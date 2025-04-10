import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session-middleware";
import { getMemberByWorkspaceAndUserId } from "@/features/members/service";
import { getProjectById } from "@/features/projects/service";
import { createTask, getTaskById, getTasksByProjectId, updateTask, deleteTask, reorderTasks } from "@/features/tasks/service";
import { createTaskSchema, updateTaskSchema, updateTaskOrderSchema } from "../schemas";
import { TaskStatus } from "../types";
import { prisma } from "@/lib/prisma";

const app = new Hono()
	.get("/", sessionMiddleware, async (c) => {
		const workspaceId = c.req.query("workspaceId");
		if (!workspaceId) {
			return c.json({ error: "workspaceId параметр необходим" }, 400);
		}

		const user = c.get("user");
		const projectId = c.req.query("projectId");
		const status = c.req.query("status");
		const assigneeId = c.req.query("assigneeId");
		const dueDate = c.req.query("dueDate");

		// Для логов
		console.log(`Получение задач с параметрами:`, {
			workspaceId,
			projectId,
			status,
			assigneeId,
			dueDate,
			userId: user.id
		});

		// Проверяем, что пользователь имеет доступ к рабочему пространству
		const member = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
		if (!member) {
			return c.json({ error: "Неавторизованный" }, 401);
		}

		// Формируем условия для фильтрации задач
		const where: any = { workspaceId };
		
		if (projectId) {
			where.projectId = projectId;
		}
		
		if (status) {
			where.status = status;
		}
		
		if (assigneeId) {
			where.assigneeId = assigneeId;
		}
		
		if (dueDate) {
			// Если нужна фильтрация по дате, добавляем ее
			const date = new Date(dueDate);
			where.dueDate = {
				gte: date,
				// Добавляем день к дате для получения задач на этот день
				lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
			};
		}

		// Получаем все задачи с применением фильтров
		const tasks = await prisma.task.findMany({
			where,
			include: {
				project: {
					select: {
						id: true,
						name: true,
						imageUrl: true
					}
				},
				assignee: {
					select: {
						id: true,
						name: true,
						email: true
					}
				}
			},
			orderBy: { dueDate: 'asc' }
		});

		// Подсчитываем общее количество задач для пагинации
		const total = await prisma.task.count({ where });

		console.log(`Найдено задач: ${tasks.length} из ${total}`);

		// Преобразуем данные для совместимости с фронтендом
		const formattedTasks = tasks.map(task => ({
			...task,
			$id: task.id,
			project: task.project ? {
				...task.project,
				$id: task.project.id
			} : null,
			assignee: task.assignee ? {
				...task.assignee,
				$id: task.assignee.id
			} : null
		}));

		return c.json({ 
			data: { 
				documents: formattedTasks, 
				total: total 
			} 
		});
	})
	.get("/projects/:projectId", sessionMiddleware, async (c) => {
		const { projectId } = c.req.param();
		const user = c.get("user");
		
		// Получаем информацию о проекте
		const project = await getProjectById(projectId);
		
		if (!project) {
			return c.json({ error: "Проект не найден" }, 404);
		}
		
		// Проверяем доступ пользователя к рабочему пространству проекта
		const member = await getMemberByWorkspaceAndUserId(project.workspaceId, user.id);
		
		if (!member) {
			return c.json({ error: "Неавторизованный" }, 401);
		}
		
		// Получаем все задачи проекта
		const tasks = await getTasksByProjectId(projectId);
		
		return c.json({ data: tasks });
	})
	.get("/:taskId", sessionMiddleware, async (c) => {
		const { taskId } = c.req.param();
		const user = c.get("user");
		
		const task = await getTaskById(taskId);
		
		if (!task) {
			return c.json({ error: "Задача не найдена" }, 404);
		}
		
		// Проверяем доступ пользователя к рабочему пространству задачи
		const member = await getMemberByWorkspaceAndUserId(task.workspaceId, user.id);
		
		if (!member) {
			return c.json({ error: "Неавторизованный" }, 401);
		}
		
		return c.json({ data: task });
	})
	.post(
		"/projects/:projectId",
		sessionMiddleware,
		zValidator("json", createTaskSchema),
		async (c) => {
			const { projectId } = c.req.param();
			const user = c.get("user");
			const { 
				name, 
				status, 
				assigneeId, 
				dueDate, 
				description, 
				workspaceId 
			} = c.req.valid("json");
			
			console.log("Данные, полученные сервером:", {
				projectId,
				userId: user.id,
				name,
				status,
				assigneeId,
				workspaceId,
				dueDate
			});
			
			// Получаем информацию о проекте
			const project = await getProjectById(projectId);
			
			if (!project) {
				return c.json({ error: "Проект не найден" }, 404);
			}
			
			console.log("Найден проект:", {
				id: project.id,
				name: project.name,
				workspaceId: project.workspaceId
			});
			
			// Проверяем доступ пользователя к рабочему пространству проекта
			const member = await getMemberByWorkspaceAndUserId(project.workspaceId, user.id);
			
			if (!member) {
				return c.json({ error: "У вас нет доступа к этому рабочему пространству" }, 401);
			}
			
			// Проверяем, что назначенный пользователь имеет доступ к рабочему пространству
			const assigneeMember = await getMemberByWorkspaceAndUserId(project.workspaceId, assigneeId);
			
			console.log("Исполнитель не найден или не имеет доступа:", {
				assigneeId,
				workspaceId: project.workspaceId 
			});
			
			if (!assigneeMember) {
				return c.json({ 
					error: "Указанный исполнитель не является участником этого рабочего пространства",
					detail: `Пользователь ${assigneeId} не является участником рабочего пространства ${project.workspaceId}`
				}, 400);
			}
			
			// Преобразуем дату, если она передана
			let parsedDueDate = undefined;
			if (dueDate) {
				parsedDueDate = new Date(dueDate);
			}
			
			try {
				// Создаем задачу
				const task = await createTask(
					project.workspaceId,
					projectId,
					assigneeId,
					{
						name,
						status,
						dueDate: parsedDueDate,
						description,
					}
				);
				
				return c.json({ data: task });
			} catch (error: any) {
				console.error("Ошибка при создании задачи:", error);
				return c.json({ error: error.message || "Не удалось создать задачу", detail: error.stack }, 400);
			}
		}
	)
	.patch(
		"/:taskId",
		sessionMiddleware,
		zValidator("json", updateTaskSchema),
		async (c) => {
			try {
				const { taskId } = c.req.param();
				const user = c.get("user");
				const updateData = c.req.valid("json");
				
				console.log("Данные для обновления задачи:", {
					taskId,
					userId: user.id,
					updateData
				});
				
				const task = await getTaskById(taskId);
				
				if (!task) {
					console.log("Задача не найдена:", taskId);
					return c.json({ error: "Задача не найдена" }, 404);
				}
				
				console.log("Найдена задача:", task);
				
				// Проверяем доступ пользователя к рабочему пространству задачи
				const member = await getMemberByWorkspaceAndUserId(task.workspaceId, user.id);
				
				if (!member) {
					console.log("Пользователь не имеет доступа к рабочему пространству:", {
						userId: user.id,
						workspaceId: task.workspaceId
					});
					return c.json({ error: "Неавторизованный" }, 401);
				}
				
				// Если задан projectId и он отличается от текущего, проверяем доступ к новому проекту
				if (updateData.projectId && updateData.projectId !== task.projectId) {
					console.log("Изменение проекта задачи:", {
						oldProjectId: task.projectId,
						newProjectId: updateData.projectId
					});
					
					// Проверяем существование нового проекта
					const newProject = await getProjectById(updateData.projectId);
					
					if (!newProject) {
						console.log("Новый проект не найден:", updateData.projectId);
						return c.json({ error: "Указанный проект не найден" }, 404);
					}
					
					// Проверяем, что новый проект принадлежит тому же рабочему пространству
					if (newProject.workspaceId !== task.workspaceId) {
						console.log("Новый проект принадлежит другому рабочему пространству:", {
							taskWorkspaceId: task.workspaceId,
							newProjectWorkspaceId: newProject.workspaceId
						});
						return c.json({ error: "Нельзя переместить задачу в проект из другого рабочего пространства" }, 400);
					}
				}
				
				// Если задан assigneeId, проверяем, что пользователь существует в рабочем пространстве
				if (updateData.assigneeId) {
					const assigneeMember = await getMemberByWorkspaceAndUserId(task.workspaceId, updateData.assigneeId);
					
					if (!assigneeMember) {
						console.log("Указанный исполнитель не является участником рабочего пространства:", {
							assigneeId: updateData.assigneeId,
							workspaceId: task.workspaceId
						});
						return c.json({
							error: "Указанный исполнитель не является участником рабочего пространства",
							detail: `Пользователь ${updateData.assigneeId} не является участником рабочего пространства ${task.workspaceId}`
						}, 400);
					}
				}
				
				// Преобразуем дату, если она передана
				if (updateData.dueDate) {
					updateData.dueDate = new Date(updateData.dueDate);
				}
				
				console.log("Обновляем задачу с данными:", updateData);
				
				// Обновляем задачу
				const updatedTask = await updateTask(taskId, updateData);
				
				console.log("Задача успешно обновлена:", updatedTask);
				
				return c.json({ data: updatedTask });
			} catch (error: any) {
				console.error("Ошибка при обновлении задачи:", error);
				return c.json({ 
					error: error.message || "Не удалось обновить задачу", 
					detail: error.stack 
				}, 500);
			}
		}
	)
	.patch(
		"/reorder",
		sessionMiddleware,
		zValidator("json", updateTaskOrderSchema),
		async (c) => {
			const user = c.get("user");
			const { items, projectId } = c.req.valid("json");
			
			// Получаем информацию о проекте
			const project = await getProjectById(projectId);
			
			if (!project) {
				return c.json({ error: "Проект не найден" }, 404);
			}
			
			// Проверяем доступ пользователя к рабочему пространству проекта
			const member = await getMemberByWorkspaceAndUserId(project.workspaceId, user.id);
			
			if (!member) {
				return c.json({ error: "Неавторизованный" }, 401);
			}
			
			// Обновляем порядок задач
			await reorderTasks(items);
			
			return c.json({ success: true });
		}
	)
	.delete("/:taskId", sessionMiddleware, async (c) => {
		const { taskId } = c.req.param();
		const user = c.get("user");
		
		console.log(`Запрос на удаление задачи ${taskId} от пользователя ${user.id}`);
		
		const task = await getTaskById(taskId);
		
		if (!task) {
			console.log(`Задача ${taskId} не найдена`);
			return c.json({ error: "Задача не найдена" }, 404);
		}
		
		// Проверяем доступ пользователя к рабочему пространству задачи
		const member = await getMemberByWorkspaceAndUserId(task.workspaceId, user.id);
		
		if (!member) {
			console.log(`Пользователь ${user.id} не имеет доступа к рабочему пространству ${task.workspaceId}`);
			return c.json({ error: "Неавторизованный" }, 401);
		}
		
		// Удаляем задачу
		await deleteTask(taskId);
		console.log(`Задача ${taskId} успешно удалена`);
		
		return c.json({ data: { $id: taskId, id: taskId } });
	});

export default app;
