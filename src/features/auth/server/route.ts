import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie, setCookie } from "hono/cookie";

import { sessionMiddleware } from "@/lib/session-middleware";
import { AUTH_COOKIE } from "../constants";
import { loginSchema, registerSchema } from "../schemas";
import { loginUser, registerUser } from "@/lib/auth";

const app = new Hono()
	.get("/current", sessionMiddleware, async (c) => {
		const user = c.get("user");
		return c.json({ data: user });
	})
	.post("/login", zValidator("json", loginSchema), async (c) => {
		try {
			const { email, password } = c.req.valid("json");

			const user = await loginUser({ email, password });
			
			// Создаем сессию
			const sessionData = { userId: user.id };
			const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');
			
			setCookie(c, AUTH_COOKIE, sessionToken, {
				path: "/",
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				maxAge: 60 * 60 * 24 * 30, // 30 дней
			});

			return c.json({ success: true });
		} catch (error) {
			return c.json({ 
				success: false, 
				message: error instanceof Error ? error.message : "Ошибка входа" 
			}, 401);
		}
	})
	.post("/register", zValidator("json", registerSchema), async (c) => {
		try {
			const { name, email, password } = c.req.valid("json");
			
			const user = await registerUser({ name, email, password });
			
			// Создаем сессию
			const sessionData = { userId: user.id };
			const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');
			
			setCookie(c, AUTH_COOKIE, sessionToken, {
				path: "/",
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				maxAge: 60 * 60 * 24 * 30, // 30 дней
			});
			return c.json({ success: true });
		} catch (error) {
			return c.json({ 
				success: false, 
				message: error instanceof Error ? error.message : "Ошибка регистрации" 
			}, 400);
		}
	})
	.post("/logout", sessionMiddleware, async (c) => {
		deleteCookie(c, AUTH_COOKIE);
		return c.json({ success: true });
	});

export default app;
