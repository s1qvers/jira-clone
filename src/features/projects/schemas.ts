import { z } from "zod";

export const createProjectSchema = z.object({
	name: z.string().trim().min(1, { message: "Необходимый" }),
	image: z
		.union([
			z.instanceof(File),
			z.string().transform((value) => (value === "" ? undefined : value)),
			z.null().transform(() => undefined),
		])
		.optional(),

	workspaceId: z.string(),
});
export const updateProjectSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: "Требуется минимум 1 символ" })
		.optional(),
	image: z
		.union([
			z.instanceof(File),
			z.string().transform((value) => {
				if (value === "null") return null;
				return value === "" ? undefined : value;
			}),
			z.null(),
		])
		.optional(),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;
