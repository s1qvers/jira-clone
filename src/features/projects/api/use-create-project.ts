import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { createProjectSchema } from "../schemas";
import { z } from "zod";

// Определим тип для формы без workspaceId
type CreateProjectFormType = z.infer<typeof createProjectSchema> & { workspaceId?: string };

type RequestType = { 
	form: Omit<CreateProjectFormType, "workspaceId"> & { workspaceId?: string; }, 
	param: { workspaceId: string }
};
type ResponseType = { data: any };

export const useCreateProject = () => {
	const queryClient = useQueryClient();
	const workspaceId = useWorkspaceId();
	
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ form, param }) => {
			if (!param.workspaceId) {
				throw new Error("ID рабочего пространства не указан");
			}
			
			console.log("Отправка запроса на создание проекта:", {
				name: form.name,
				hasImage: !!form.image,
				imageType: form.image instanceof File ? "File" : typeof form.image,
				workspaceId: param.workspaceId
			});
			
			const response = await client.api.projects.workspaces[":workspaceId"].$post({
				param: { workspaceId: param.workspaceId },
				form
			});
			
			if (!response.ok) {
				console.error("Ошибка при создании проекта:", response.status, response.statusText);
				throw new Error("Не удалось создать проект");
			}
			
			const result = await response.json();
			console.log("Ответ сервера на создание проекта:", result);
			return result;
		},
		onSuccess: (data) => {
			toast.success("Проект успешно создан");
			
			// Принудительно инвалидируем все кэши, связанные с проектами
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			
			// Добавляем новый проект напрямую в кэш
			if (data?.data?.id && workspaceId) {
				// Обновляем существующие кэшированные данные, добавляя новый проект в начало списка
				queryClient.setQueryData(["projects", { workspaceId }], (oldData: any) => {
					if (!oldData) return { documents: [data.data], total: 1 };
					
					// Если data.documents существует, добавляем новый проект в начало списка
					if (oldData.documents) {
						return {
							...oldData,
							documents: [data.data, ...oldData.documents],
							total: (oldData.total || 0) + 1
						};
					}
					
					return oldData;
				});
			}
		},
		onError: (error) => {
			console.error("Ошибка при создании проекта:", error);
			toast.error(error.message || "Не удалось создать проект");
		},
	});

	return mutation;
};
