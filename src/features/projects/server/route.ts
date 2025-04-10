import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session-middleware";
import { getMemberByWorkspaceAndUserId } from "@/features/members/service";
import { MemberRole } from "@/features/members/types";
import { createProject, getProjectById, getProjectsByWorkspaceId, updateProject, deleteProject } from "@/features/projects/service";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import { uploadImage, getPublicIdFromUrl, deleteImage } from "@/lib/upload";

const app = new Hono()
	.get("/", sessionMiddleware, async (c) => {
		const workspaceId = c.req.query("workspaceId");
		if (!workspaceId) {
			return c.json({ error: "workspaceId параметр необходим" }, 400);
		}

		const user = c.get("user");

		// Проверяем, что пользователь имеет доступ к рабочему пространству
		const member = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
		if (!member) {
			return c.json({ error: "Неавторизованный" }, 401);
		}

		const projects = await getProjectsByWorkspaceId(workspaceId);
		
		// Преобразуем id в $id для совместимости с фронтендом
		const formattedProjects = projects.map(project => ({
			...project,
			$id: project.id
		}));
		
		return c.json({
			data: {
				documents: formattedProjects,
				total: formattedProjects.length
			}
		});
	})
	.get("/workspaces/:workspaceId", sessionMiddleware, async (c) => {
		const { workspaceId } = c.req.param();
		const user = c.get("user");

		// Проверяем, что пользователь имеет доступ к рабочему пространству
		const member = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
		if (!member) {
			return c.json({ error: "Неавторизованный" }, 401);
		}

		const projects = await getProjectsByWorkspaceId(workspaceId);
		return c.json({ data: projects });
	})
	.get("/:projectId", sessionMiddleware, async (c) => {
		const { projectId } = c.req.param();
		const user = c.get("user");

		const project = await getProjectById(projectId);
		
		if (!project) {
			return c.json({ error: "Проект не найден" }, 404);
		}

		// Проверяем, что пользователь имеет доступ к рабочему пространству проекта
		const member = await getMemberByWorkspaceAndUserId(project.workspaceId, user.id);
		if (!member) {
			return c.json({ error: "Неавторизованный" }, 401);
		}

		return c.json({ data: project });
	})
	.post(
		"/workspaces/:workspaceId",
		sessionMiddleware,
		zValidator("form", createProjectSchema),
		async (c) => {
			const { workspaceId } = c.req.param();
			const user = c.get("user");
			const { name, image } = c.req.valid("form");

			// Проверяем, что пользователь имеет доступ к рабочему пространству
			const member = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
			if (!member) {
				return c.json({ error: "Неавторизованный" }, 401);
			}

			let imageUrl: string | undefined;
			
			// Загружаем изображение в Cloudinary, если оно есть
			if (image instanceof File) {
				try {
					imageUrl = await uploadImage(image, 'jira_clone/projects');
				} catch (error) {
					console.error('Ошибка при загрузке изображения:', error);
					// Используем локальную заглушку вместо внешнего сервиса
					imageUrl = "/placeholder.png";
				}
			}

			const project = await createProject(workspaceId, name, imageUrl);
			return c.json({ data: project });
		}
	)
	.patch(
		"/:projectId",
		sessionMiddleware,
		zValidator("form", updateProjectSchema),
		async (c) => {
			const { projectId } = c.req.param();
			const user = c.get("user");
			const { name, image } = c.req.valid("form");

			const project = await getProjectById(projectId);
			
			if (!project) {
				return c.json({ error: "Проект не найден" }, 404);
			}

			// Проверяем, что пользователь имеет доступ к рабочему пространству
			const member = await getMemberByWorkspaceAndUserId(project.workspaceId, user.id);
			if (!member) {
				return c.json({ error: "Неавторизованный" }, 401);
			}

			// Проверяем, что пользователь является администратором
			if (member.role !== MemberRole.ADMIN) {
				return c.json({ error: "Требуются права администратора" }, 403);
			}

			let imageUrl: string | undefined;
			
			// Загружаем новое изображение, если оно есть
			if (image instanceof File) {
				try {
					// Если есть старое изображение, удаляем его
					if (project.imageUrl) {
						const publicId = getPublicIdFromUrl(project.imageUrl);
						if (publicId) {
							await deleteImage(publicId);
						}
					}
					
					// Загружаем новое изображение
					imageUrl = await uploadImage(image, 'jira_clone/projects');
				} catch (error) {
					console.error('Ошибка при загрузке изображения:', error);
					// В случае ошибки сохраняем текущее изображение или используем заглушку
					imageUrl = project.imageUrl || "/placeholder.png";
				}
			} else if (typeof image === 'string') {
				imageUrl = image;
			}

			const updatedProject = await updateProject(projectId, {
					name,
				imageUrl
			});

			return c.json({ data: updatedProject });
		}
	)
	.delete("/:projectId", sessionMiddleware, async (c) => {
		const { projectId } = c.req.param();
		const user = c.get("user");

		const project = await getProjectById(projectId);
		
		if (!project) {
			return c.json({ error: "Проект не найден" }, 404);
		}

		// Проверяем, что пользователь имеет доступ к рабочему пространству
		const member = await getMemberByWorkspaceAndUserId(project.workspaceId, user.id);
		if (!member) {
			return c.json({ error: "Неавторизованный" }, 401);
		}

		// Проверяем, что пользователь является администратором
		if (member.role !== MemberRole.ADMIN) {
			return c.json({ error: "Требуются права администратора" }, 403);
		}

		// Удаляем изображение из Cloudinary, если оно есть
		if (project.imageUrl) {
			const publicId = getPublicIdFromUrl(project.imageUrl);
			if (publicId) {
				await deleteImage(publicId);
			}
		}

		await deleteProject(projectId);
		return c.json({ success: true });
	})
	.get("/:projectId/analytics", sessionMiddleware, async (c) => {
		const { projectId } = c.req.param();
		const user = c.get("user");

		const project = await getProjectById(projectId);
		
		if (!project) {
			return c.json({ error: "Проект не найден" }, 404);
		}

		// Проверяем, что пользователь имеет доступ к рабочему пространству
		const member = await getMemberByWorkspaceAndUserId(project.workspaceId, user.id);
		if (!member) {
			return c.json({ error: "Неавторизованный" }, 401);
		}

		// Заглушка для аналитики
		return c.json({ 
			data: {
				tasksByStatus: {
					BACKLOG: 0,
					TODO: 0,
					IN_PROGRESS: 0,
					IN_REVIEW: 0,
					DONE: 0
				},
				completionRate: 0,
				averageCompletionTime: 0
			} 
		});
	});

export default app;
