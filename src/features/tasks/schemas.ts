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

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;