import { z } from "zod";

export const createWorkspaceSchema = z.object({
	name: z.string().trim().min(1, { message: "Требуемый" }),
	image: z
		.union([
			z.instanceof(File),
			z.string().transform((value) => (value === "" ? undefined : value)),
		])
		.optional(),
});
export const updateWorkspaceSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: "Длина должна составлять 1 или более символов" })
		.optional(),
	image: z
		.union([
			z.instanceof(File),
			z.string().transform((value) => (value === "" ? undefined : value)),
		])
		.optional(),
});
export const inviteCodeSchema = z.object({ code: z.string() });

export type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceSchema = z.infer<typeof updateWorkspaceSchema>;
