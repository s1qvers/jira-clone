import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createWorkspaceSchema, updateWorkspaceSchema, inviteCodeSchema } from "../schemas";
import { MemberRole } from "@/features/members/types";
import { INVITECODE_LENGTH } from "@/config";
import { createMember, getMemberByWorkspaceAndUserId, getMembersByWorkspaceId, updateMemberRole, removeMember } from "@/features/members/service";
import { createWorkspace, getWorkspaceById, getWorkspacesByUserId, updateWorkspace, deleteWorkspace } from "@/features/workspaces/service";
import { uploadImage, getPublicIdFromUrl, deleteImage } from "@/lib/upload";
import { prisma } from "@/lib/prisma";

// Функция для генерации инвайт-кода
function generateInviteCode(length: number): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

const app = new Hono()
	.get("/", sessionMiddleware, async (c) => {
		const user = c.get("user");
		
		const workspaces = await getWorkspacesByUserId(user.id);
		
		return c.json({ data: { documents: workspaces } });
	})
	.get("/:workspaceId", sessionMiddleware, async (c) => {
		const user = c.get("user");
		const { workspaceId } = c.req.param();

		// Проверяем, является ли пользователь членом workspace
		const member = await getMemberByWorkspaceAndUserId(workspaceId, user.id);

		if (!member) {
			return c.json({ error: "Неавторизованный" }, 401);
		}

		const workspace = await getWorkspaceById(workspaceId);

		return c.json({ data: workspace });
	})
	.get("/:workspaceId/info", sessionMiddleware, async (c) => {
		const { workspaceId } = c.req.param();

		const workspace = await getWorkspaceById(workspaceId);
		
		if (!workspace) {
		  return c.json({ error: "Рабочее пространство не найдено" }, 404);
		}

		return c.json({
			data: {
				$id: workspace.id,
				name: workspace.name,
				imageUrl: workspace.imageUrl,
			},
		});
	})
	.post(
		"/",
		zValidator("form", createWorkspaceSchema),
		sessionMiddleware,
		async (c) => {
			const user = c.get("user");

			const { name, image } = c.req.valid("form");
			let uploadedImage: string | undefined;
			
			// Загружаем изображение в Cloudinary, если оно есть
			if (image instanceof File) {
				try {
					uploadedImage = await uploadImage(image, 'jira_clone/workspaces');
				} catch (error) {
					console.error('Ошибка при загрузке изображения:', error);
					// В случае ошибки используем локальную заглушку
					uploadedImage = "/placeholder.png";
				}
			}
			
			const workspace = await createWorkspace(user.id, name, uploadedImage);
			
			return c.json({ data: workspace });
		}
	)
	.patch(
		"/:workspaceId",
		sessionMiddleware,
		zValidator("form", updateWorkspaceSchema),
		async (c) => {
			const { workspaceId } = c.req.param();
			const user = c.get("user");
			const { name, image } = c.req.valid("form");

			// Проверяем, что пользователь имеет доступ к рабочему пространству
			const member = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
			if (!member) {
				return c.json({ error: "Неавторизованный" }, 401);
			}

			// Получаем текущее рабочее пространство
			const existingWorkspace = await getWorkspaceById(workspaceId);
			if (!existingWorkspace) {
				return c.json({ error: "Рабочее пространство не найдено" }, 404);
			}

			let uploadedImage: string | null | undefined;
			
			// Загружаем новое изображение, если оно есть
			if (image instanceof File) {
				try {
					// Если есть старое изображение, удаляем его
					if (existingWorkspace.imageUrl) {
						const publicId = getPublicIdFromUrl(existingWorkspace.imageUrl);
						if (publicId) {
							await deleteImage(publicId);
						}
					}
					
					// Загружаем новое изображение
					uploadedImage = await uploadImage(image, 'jira_clone/workspaces');
				} catch (error) {
					console.error('Ошибка при загрузке изображения:', error);
					// В случае ошибки сохраняем текущее изображение
					uploadedImage = existingWorkspace.imageUrl || undefined;
				}
			} else if (image === null || image === 'null') {
				// Если image = null или 'null', значит пользователь удалил изображение
				try {
					if (existingWorkspace.imageUrl) {
						const publicId = getPublicIdFromUrl(existingWorkspace.imageUrl);
						if (publicId) {
							await deleteImage(publicId);
						}
					}
					uploadedImage = null;
				} catch (error) {
					console.error('Ошибка при удалении изображения:', error);
					uploadedImage = null;
				}
			} else if (typeof image === 'string') {
				uploadedImage = image;
			}
			
			const updatedWorkspace = await updateWorkspace(workspaceId, {
				name,
				imageUrl: uploadedImage
			});

			return c.json({ data: updatedWorkspace });
		}
	)
	.delete("/:workspaceId", sessionMiddleware, async (c) => {
		const user = c.get("user");
		const { workspaceId } = c.req.param();
		
		// Проверяем права пользователя
		const member = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
		
		if (!member || member.role !== MemberRole.ADMIN) {
			return c.json({ error: "Неавторизованный" }, 401);
		}
		
		// Получаем информацию о рабочем пространстве
		const workspace = await getWorkspaceById(workspaceId);
		
		if (workspace && workspace.imageUrl) {
			// Удаляем изображение из Cloudinary
			const publicId = getPublicIdFromUrl(workspace.imageUrl);
			if (publicId) {
				await deleteImage(publicId);
			}
		}
		
		// При удалении рабочего пространства, благодаря каскадному удалению в Prisma,
		// все связанные записи (members, projects, tasks) будут удалены автоматически
		await deleteWorkspace(workspaceId);
		
		return c.json({ data: { $id: workspaceId } });
	})
	.post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
		const user = c.get("user");
		const { workspaceId } = c.req.param();
		
		// Проверяем права пользователя
		const member = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
		
		if (!member || member.role !== MemberRole.ADMIN) {
			return c.json({ error: "Неавторизованный" }, 401);
		}
		
		const newInviteCode = generateInviteCode(INVITECODE_LENGTH);
		const workspace = await updateWorkspace(workspaceId, {
		  inviteCode: newInviteCode
		});
		
		return c.json({ data: workspace });
	})
	.post(
		"/:workspaceId/join",
		sessionMiddleware,
		zValidator("json", inviteCodeSchema),
		async (c) => {
			const user = c.get("user");
			const { workspaceId } = c.req.param();
			const { inviteCode } = c.req.valid("json");
			
			// Проверяем существование рабочего пространства и корректность инвайт-кода
			const workspace = await getWorkspaceById(workspaceId);
			
			if (!workspace || workspace.inviteCode !== inviteCode) {
				return c.json({ error: "Неверный код приглашения" }, 400);
			}
			
			// Проверяем, не является ли пользователь уже участником
			const existingMember = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
			
			if (existingMember) {
				return c.json({ error: "Вы уже являетесь участником" }, 400);
			}
			
			// Добавляем пользователя как участника
			await createMember(workspaceId, user.id, MemberRole.MEMBER);
			
			return c.json({ success: true });
		}
	)
	.get("/:workspaceId/members", sessionMiddleware, async (c) => {
		const user = c.get("user");
		const { workspaceId } = c.req.param();

		// Проверяем права пользователя
		const member = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
		
		if (!member) {
			return c.json({ error: "Неавторизованный" }, 401);
		}

		const members = await getMembersByWorkspaceId(workspaceId);
		
		return c.json({ data: members });
	})
	.patch("/:workspaceId/members/:memberId/role", sessionMiddleware, async (c) => {
		const user = c.get("user");
		const { workspaceId, memberId } = c.req.param();
		const { role } = await c.req.json<{ role: MemberRole }>();
		
		// Проверяем права текущего пользователя
		const currentMember = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
		
		if (!currentMember || currentMember.role !== MemberRole.ADMIN) {
			return c.json({ error: "Неавторизованный" }, 401);
		}
		
		// Получаем данные о пользователе, чью роль нужно изменить
		const memberToUpdate = await getMemberByWorkspaceAndUserId(workspaceId, memberId);
		
		if (!memberToUpdate) {
			return c.json({ error: "Участник не найден" }, 404);
		}
		
		// Обновляем роль
		const updatedMember = await updateMemberRole(workspaceId, memberId, role);
		
		return c.json({ data: updatedMember });
	})
	.delete("/:workspaceId/members/:memberId", sessionMiddleware, async (c) => {
		const user = c.get("user");
		const { workspaceId, memberId } = c.req.param();
		
		// Проверяем права текущего пользователя
		const currentMember = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
		const memberToRemove = await getMemberByWorkspaceAndUserId(workspaceId, memberId);
		
		if (!currentMember || !memberToRemove) {
			return c.json({ error: "Неавторизованный" }, 401);
		}
		
		// Проверяем, что либо пользователь удаляет сам себя, либо он администратор
		if (user.id !== memberId && currentMember.role !== MemberRole.ADMIN) {
			return c.json({ error: "Неавторизованный" }, 401);
		}
		
		// Удаляем участника
		await removeMember(workspaceId, memberId);
		
		return c.json({ success: true });
	})
	.get("/:workspaceId/analytics", sessionMiddleware, async (c) => {
		const user = c.get("user");
		const { workspaceId } = c.req.param();
		
		// Проверяем права пользователя
		const member = await getMemberByWorkspaceAndUserId(workspaceId, user.id);
		
		if (!member) {
			return c.json({ error: "Неавторизованный" }, 401);
		}
		
		// Получаем количество проектов в рабочем пространстве
		const projectsCount = await prisma.project.count({
			where: { workspaceId }
		});
		
		// Получаем количество задач в рабочем пространстве
		const tasksCount = await prisma.task.count({
			where: { workspaceId }
		});
		
		// Получаем количество участников рабочего пространства
		const membersCount = await prisma.member.count({
			where: { workspaceId }
		});
		
		// Получаем статистику по задачам по статусам
		const tasksByStatus = await prisma.task.groupBy({
			by: ['status'],
			where: { workspaceId },
			_count: {
				id: true
			}
		});
		
		const analytics = {
			projectsCount,
			tasksCount,
			membersCount,
			tasksByStatus: tasksByStatus.map(item => ({
				status: item.status,
				count: item._count.id
			}))
		};
		
		return c.json({ data: analytics });
	});

export default app;
