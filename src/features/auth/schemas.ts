import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1, { message: "Необходимый" }),
});
export const registerSchema = z.object({
	name: z.string().trim().min(1, { message: "Необходимый" }),
	email: z.string().email(),
	password: z.string().min(8, { message: "Требуется минимум 8 символов" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;