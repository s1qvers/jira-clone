import { z } from "zod";
import { TaskStatus } from "./types";

export const createTaskSchema = z.object({
	name: z.string().trim().min(1, { message: "Необходимый" }),
	status: z.nativeEnum(TaskStatus, { required_error: "Необходимый" }),
	workspaceId: z.string().trim().min(1, { message: "Необходимый" }),
	projectId: z.string().trim().min(1, { message: "Необходимый" }),
	assigneeId: z.string().trim().min(1, { message: "Необходимый" }),
	dueDate: z.coerce.date(),
	description: z.string().optional(),
});

export const updateTaskSchema = z.object({
	name: z.string().trim().min(1, { message: "Необходимый" }).optional(),
	status: z.nativeEnum(TaskStatus).optional(),
	assigneeId: z.string().optional(),
	projectId: z.string().optional(),
	dueDate: z.coerce.date().optional(),
	description: z.string().optional(),
	position: z.number().int().positive().optional(),
});

export const updateTaskOrderSchema = z.object({
	projectId: z.string().trim().min(1, { message: "Необходимый" }),
	items: z.array(z.object({
		id: z.string().trim().min(1, { message: "Необходимый" }),
		position: z.number().int().positive(),
	})),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;
export type UpdateTaskOrderSchema = z.infer<typeof updateTaskOrderSchema>;