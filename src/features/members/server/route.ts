import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";
import { prisma } from "@/lib/prisma";
import { MemberRole } from "@/features/members/types";

interface UserInfo {
	id: string;
	name: string;
	email: string;
}

interface MemberWithUser {
	id: string;
	workspaceId: string;
	userId: string;
	role: MemberRole;
	user: UserInfo;
	createdAt: Date;
	updatedAt: Date;
}

const app = new Hono()
	.get(
		"/",
		sessionMiddleware,
		zValidator("query", z.object({ workspaceId: z.string() })),
		async (c) => {
			const user = c.get("user");
			const { workspaceId } = c.req.valid("query");

			// Проверяем права пользователя
			const member = await prisma.member.findUnique({
				where: {
					workspaceId_userId: {
						workspaceId,
						userId: user.id
					}
				}
			});

			if (!member) {
				return c.json({ error: "Несанкционированный" }, 401);
			}

			// Получаем всех участников рабочего пространства с информацией о пользователях
			const members = await prisma.member.findMany({
				where: {
					workspaceId
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				}
			});

			// Форматируем данные для совместимости с предыдущим API
			const populatedMembers = members.map((member) => ({
				$id: member.id,
				workspaceId: member.workspaceId,
				userId: member.userId,
				role: member.role,
				name: member.user.name,
				email: member.user.email,
				createdAt: member.createdAt,
				updatedAt: member.updatedAt
			}));

			return c.json({
				data: {
					documents: populatedMembers,
					total: populatedMembers.length
				},
			});
		}
	)
	.delete("/:memberId", sessionMiddleware, async (c) => {
		const { memberId } = c.req.param();
		const user = c.get("user");

		// Получаем информацию об удаляемом участнике
		const memberToDelete = await prisma.member.findUnique({
			where: { id: memberId }
		});

		if (!memberToDelete) {
			return c.json({ error: "Участник не найден" }, 404);
		}

		// Проверяем права текущего пользователя
		const currentMember = await prisma.member.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: memberToDelete.workspaceId,
					userId: user.id
				}
			}
		});

		if (!currentMember) {
			return c.json({ error: "Несанкционированный" }, 401);
		}

		// Проверяем, что либо пользователь удаляет сам себя, либо он админ
		if (currentMember.id !== memberToDelete.id && currentMember.role !== MemberRole.ADMIN) {
			return c.json({ error: "Несанкционированный" }, 401);
		}

		// Проверяем, что не удаляется последний участник
		const membersCount = await prisma.member.count({
			where: { workspaceId: memberToDelete.workspaceId }
		});

		if (membersCount <= 1) {
			return c.json({ error: "Невозможно удалить единственного участника" }, 400);
		}

		// Удаляем участника
		await prisma.member.delete({
			where: { id: memberId }
		});

		return c.json({ data: { $id: memberId } });
	})
	.patch(
		"/:memberId",
		sessionMiddleware,
		zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
		async (c) => {
			const { memberId } = c.req.param();
			const { role } = c.req.valid("json");
			const user = c.get("user");

			// Получаем информацию об обновляемом участнике
			const memberToUpdate = await prisma.member.findUnique({
				where: { id: memberId }
			});

			if (!memberToUpdate) {
				return c.json({ error: "Участник не найден" }, 404);
			}

			// Проверяем права текущего пользователя
			const currentMember = await prisma.member.findUnique({
				where: {
					workspaceId_userId: {
						workspaceId: memberToUpdate.workspaceId,
						userId: user.id
					}
				}
			});

			if (!currentMember || currentMember.role !== MemberRole.ADMIN) {
				return c.json({ error: "Несанкционированный" }, 401);
			}

			// Проверяем, что не понижается роль последнего админа
			if (memberToUpdate.role === MemberRole.ADMIN && role !== MemberRole.ADMIN) {
				const adminsCount = await prisma.member.count({
					where: {
						workspaceId: memberToUpdate.workspaceId,
						role: MemberRole.ADMIN
					}
				});

				if (adminsCount <= 1) {
					return c.json({ error: "Невозможно понизить статус единственного администратора" }, 400);
				}
			}

			// Обновляем роль участника
			const updatedMember = await prisma.member.update({
				where: { id: memberId },
				data: { role }
			});

			return c.json({ data: { $id: updatedMember.id } });
		}
	);
export default app;
