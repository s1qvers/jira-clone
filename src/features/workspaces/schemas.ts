import { z } from "zod";

export const createWorkspaceSchema = z.object({
	name: z.string().trim().min(1, { message: "Требуемый" }),
	image: z
		.union([
			z.instanceof(File),
			z.string().transform((value) => (value === "" ? undefined : value)),
			z.null().transform(() => null),
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
			z.string().transform((value) => {
				if (value === "null") return null;
				return value === "" ? undefined : value;
			}),
			z.null(),
		])
		.optional(),
});
export const inviteCodeSchema = z.object({
	inviteCode: z.string().min(1, { message: "Код приглашения обязателен" }),
	
	// Для совместимости с старыми клиентами, которые могут отправлять поле 'code' вместо 'inviteCode'
	code: z.string().optional()
}).transform(data => {
	// Если клиент отправил 'code' вместо 'inviteCode', используем его значение
	if (!data.inviteCode && data.code) {
		return { inviteCode: data.code };
	}
	return data;
});

export type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceSchema = z.infer<typeof updateWorkspaceSchema>;
