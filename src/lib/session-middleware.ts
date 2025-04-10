import "server-only";
import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { prisma } from "./prisma";
import { AUTH_COOKIE } from "@/features/auth/constants";

type AdditionalContext = {
	Variables: {
		user: {
			id: string;
			email: string;
			name: string;
		};
	};
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
	async (c, next) => {
		const sessionCookie = getCookie(c, AUTH_COOKIE);

		if (!sessionCookie) {
			return c.json({ message: "Неавторизован" }, 401);
		}

		try {
			// Декодируем сессию из куки и получаем userId
			const sessionData = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
			
			if (!sessionData.userId) {
				return c.json({ message: "Неавторизован" }, 401);
			}
			
			// Находим пользователя
			const user = await prisma.user.findUnique({
				where: { id: sessionData.userId },
				select: {
					id: true,
					email: true,
					name: true,
				},
			});
			
			if (!user) {
				return c.json({ message: "Неавторизован" }, 401);
			}
			
			// Устанавливаем пользователя в контекст
			c.set("user", user);
			
			await next();
		} catch (error) {
			return c.json({ message: "Ошибка авторизации" }, 401);
		}
	}
);
