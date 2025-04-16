import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
import { createWorkspaceSchema } from "../schemas";
import { z } from "zod";

type RequestType = { form: z.infer<typeof createWorkspaceSchema> };
type ResponseType = { data: any };

export const useCreateWorkspace = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ form }) => {
			console.log("Отправка запроса на создание рабочего пространства:", {
				name: form.name,
				hasImage: !!form.image,
				imageType: form.image instanceof File ? "File" : typeof form.image
			});
			
			const response = await client.api.workspaces.$post({ form });
			
			if (!response.ok) {
				console.error("Ошибка при создании рабочего пространства:", response.status, response.statusText);
				throw new Error("Не удалось создать рабочее пространство");
			}
			
			const result = await response.json();
			console.log("Ответ сервера на создание рабочего пространства:", result);
			return result;
		},
		onSuccess: (data) => {
			toast.success("Рабочее пространство успешно создано");
			
			// Принудительно инвалидируем все кэши, связанные с рабочими пространствами
			queryClient.invalidateQueries({ queryKey: ["workspaces"] });
			
			// Добавляем новое рабочее пространство напрямую в кэш
			if (data?.data?.id) {
				// Обновляем существующие кэшированные данные, добавляя новое рабочее пространство
				queryClient.setQueryData(["workspaces"], (oldData: any) => {
					if (!oldData) return { documents: [data.data] };
					
					// Если data.documents существует, добавляем новое рабочее пространство в начало списка
					if (oldData.documents) {
						return {
							...oldData,
							documents: [data.data, ...oldData.documents],
						};
					}
					
					return oldData;
				});
			}
		},
		onError: (error) => {
			console.error("Ошибка при создании рабочего пространства:", error);
			toast.error("Не удалось создать рабочее пространство");
		},
	});

	return mutation;
};
