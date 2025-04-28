import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie, setCookie } from "hono/cookie";

import { sessionMiddleware } from "@/lib/session-middleware";
import { AUTH_COOKIE } from "../constants";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../schemas";
import { createPasswordResetToken, loginUser, registerUser, resetPassword } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

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
	})
	.post("/forgot-password", zValidator("json", forgotPasswordSchema), async (c) => {
		try {
			const { email } = c.req.valid("json");
			console.log("Получен запрос на восстановление пароля для:", email);
			
			// Создаем токен сброса пароля
			let user, resetToken;
			try {
				const result = await createPasswordResetToken({ email });
				user = result.user;
				resetToken = result.resetToken;
				console.log("Токен сброса пароля успешно создан:", { userId: user.id, tokenLength: resetToken.length });
			} catch (tokenError) {
				console.error("Ошибка при создании токена сброса:", tokenError);
				return c.json({ 
					success: false, 
					message: "Ошибка при создании токена сброса пароля", 
					detail: tokenError instanceof Error ? tokenError.message : tokenError 
				});
			}
			
			// Создаем URL для сброса пароля с явным указанием baseUrl
			const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
			const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
			console.log("Сформирован URL для сброса пароля:", resetUrl);
			
			// Отправляем письмо для восстановления пароля
			try {
				const emailResult = await sendPasswordResetEmail(email, resetToken, resetUrl);
				console.log("Результат отправки письма:", emailResult);
				
				if (!emailResult.success) {
					console.error("Не удалось отправить письмо для восстановления пароля:", emailResult.error);
					return c.json({
						success: false,
						message: "Ошибка отправки электронной почты",
						detail: emailResult.error instanceof Error ? emailResult.error.message : emailResult.error
					});
				}
			} catch (emailError) {
				console.error("Ошибка при отправке письма:", emailError);
				return c.json({
					success: false,
					message: "Ошибка при отправке письма",
					detail: emailError instanceof Error ? emailError.message : emailError
				});
			}
			
			return c.json({ 
				success: true, 
				message: "Инструкции по восстановлению пароля отправлены на ваш email",
				debugInfo: {
					token: resetToken,
					url: resetUrl,
					userId: user.id,
				}
			});
		} catch (error) {
			console.error("Ошибка при обработке запроса на восстановление пароля:", error);
			return c.json({ 
				success: false, 
				message: "Внутренняя ошибка сервера", 
				detail: error instanceof Error ? error.message : error 
			});
		}
	})
	.post("/reset-password", zValidator("json", resetPasswordSchema), async (c) => {
		try {
			const { token, password } = c.req.valid("json");
			
			// Сбрасываем пароль
			await resetPassword({ token, password });
			
			return c.json({ 
				success: true, 
				message: "Пароль успешно изменен" 
			});
		} catch (error) {
			return c.json({ 
				success: false, 
				message: error instanceof Error ? error.message : "Не удалось сбросить пароль" 
			}, 400);
		}
	});

export default app;
