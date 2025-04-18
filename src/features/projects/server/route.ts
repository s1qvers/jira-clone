import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session-middleware";
import { getMemberByWorkspaceAndUserId } from "@/features/members/service";
import { MemberRole } from "@/features/members/types";
import { createProject, getProjectById, getProjectsByWorkspaceId, updateProject, deleteProject } from "@/features/projects/service";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import { uploadImage, getPublicIdFromUrl, deleteImage } from "@/lib/upload";
import path from "path";
import fs from "fs";

// Функция для проверки и коррекции пути к изображению
function normalizeiImageUrl(imageUrl: string | null | undefined): string | null {
	if (!imageUrl) return null;
	
	// Если это уже абсолютный URL, возвращаем как есть
	if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
		return imageUrl;
	}
	
	// Если изображение не начинается с /, добавляем /
	if (!imageUrl.startsWith('/')) {
		imageUrl = '/' + imageUrl;
	}
	
	// Проверяем существование файла (для локальных файлов)
	const fullPath = path.join(process.cwd(), 'public', imageUrl.replace(/^\//, ''));
	if (!fs.existsSync(fullPath)) {
		console.warn(`Файл изображения не найден: ${fullPath}, используем плейсхолдер`);
		return '/placeholder.png';
	}
	
	return imageUrl;
}

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
		
		// Преобразуем id в $id для совместимости с фронтендом и нормализуем пути к изображениям
		const formattedProjects = projects.map(project => ({
			...project,
			$id: project.id,
			imageUrl: normalizeiImageUrl(project.imageUrl)
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
		
		// Нормализуем пути к изображениям
		const formattedProjects = projects.map(project => ({
			...project,
			imageUrl: normalizeiImageUrl(project.imageUrl)
		}));
		
		return c.json({ data: formattedProjects });
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

		// Добавляем $id для совместимости и нормализуем путь к изображению
		const formattedProject = {
			...project,
			$id: project.id,
			imageUrl: normalizeiImageUrl(project.imageUrl)
		};

		return c.json({ data: formattedProject });
	})
	.post(
		"/workspaces/:workspaceId",
		sessionMiddleware,
		zValidator("form", createProjectSchema),
		async (c) => {
			const { workspaceId } = c.req.param();
			const user = c.get("user");
			const { name, image } = c.req.valid("form");

			console.log("Создание проекта - полученные данные:", {
				workspaceId,
				name,
				image: image instanceof File ? "File Object" : image,
				imageType: typeof image,
				imageInstanceofFile: image instanceof File,
				imageSize: image instanceof File ? image.size : null,
				userId: user.id
			});

			// Проверяем, что пользователь имеет доступ к рабочему пространству
			const member = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
			if (!member) {
				return c.json({ error: "Неавторизованный" }, 401);
			}

			let imageUrl: string | undefined;
			
			// Загружаем изображение, если оно есть
			if (image instanceof File) {
				try {
					console.log("Начинаем загрузку изображения для проекта");
					imageUrl = await uploadImage(image, 'jira_clone/projects');
					console.log("Изображение успешно загружено:", imageUrl);
					
					// Проверка существования загруженного файла
					if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
						console.error("Ошибка: загруженный файл не имеет валидного пути");
						imageUrl = "/placeholder.png";
					}
					
					// Дополнительная проверка наличия файла перед сохранением в базу
					if (imageUrl.startsWith('/uploads/')) {
						const fullPath = path.join(process.cwd(), 'public', imageUrl);
						if (!fs.existsSync(fullPath)) {
							console.error("Ошибка: загруженный файл не существует по указанному пути:", fullPath);
							imageUrl = "/placeholder.png";
						} else {
							console.log("Проверка файла успешна, файл существует:", fullPath);
						}
					}
				} catch (error) {
					console.error('Ошибка при загрузке изображения:', error);
					// Используем локальную заглушку вместо внешнего сервиса
					imageUrl = "/placeholder.png";
				}
			}

			const project = await createProject(workspaceId, name, imageUrl);
			console.log("Проект создан:", {
				id: project.id,
				name: project.name,
				imageUrl: project.imageUrl,
				hasValidImageUrl: project.imageUrl && project.imageUrl.trim() !== ''
			});
			
			// Добавляем свойство $id для совместимости с клиентским кодом и нормализуем путь к изображению
			const response = {
				...project,
				$id: project.id,
				// Обеспечиваем, что imageUrl всегда валидный
				imageUrl: normalizeiImageUrl(project.imageUrl)
			};
			
			return c.json({ data: response });
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

			console.log("PATCH /projects/:projectId - Полученные данные:", {
				projectId,
				name,
				image: image instanceof File ? "File Object" : image,
				imageType: typeof image,
				isNull: image === null,
				isNullString: image === 'null'
			});

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

			let imageUrl: string | undefined | null = undefined;
			
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
			} else if (image === null && project.imageUrl) {
				// Если image = null, значит пользователь удалил изображение
				try {
					const publicId = getPublicIdFromUrl(project.imageUrl);
					if (publicId) {
						await deleteImage(publicId);
					}
					imageUrl = null;
				} catch (error) {
					console.error('Ошибка при удалении изображения:', error);
				}
			} else if (image === 'null' && project.imageUrl) {
				// Обработка строкового значения 'null' от клиента
				try {
					console.log('Обрабатываем строковое значение "null", удаляем существующее изображение');
					const publicId = getPublicIdFromUrl(project.imageUrl);
					if (publicId) {
						await deleteImage(publicId);
					}
					imageUrl = null;
				} catch (error) {
					console.error('Ошибка при удалении изображения:', error);
				}
			} else if (typeof image === 'string') {
				imageUrl = image;
			}

			const updatedProject = await updateProject(projectId, {
				name,
				imageUrl: imageUrl as string | null
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
