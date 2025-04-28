import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email("Неверный формат почты"),
	password: z.string().min(1, { message: "Необходимый" }),
});
export const registerSchema = z.object({
	name: z.string().trim().min(1, { message: "Необходимый" }),
	email: z.string().email("Неверный формат почты"),
	password: z.string().min(8, { message: "Требуется минимум 8 символов" }),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email("Пожалуйста, введите действительный email-адрес"),
});

export const resetPasswordSchema = z.object({
	token: z.string().min(1, "Токен сброса обязателен"),
	password: z
		.string()
		.min(6, "Пароль должен содержать не менее 6 символов"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;