import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.workspaces)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.workspaces)["$post"]>;

export const useCreateWorkspace = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ form }) => {
			console.log("Отправка запроса на создание рабочего пространства:", form);
			const response = await client.api.workspaces.$post({ form });
			
			if (!response.ok) {
				console.error("Ошибка при создании рабочего пространства:", 
					response.status, response.statusText);
				throw new Error("Не удалось создать рабочее пространство");
			}
			
			const result = await response.json();
			console.log("Успешный ответ от сервера при создании рабочего пространства:", result);
			return result;
		},
		onSuccess: (data) => {
			toast.success("Рабочее пространство успешно создано");
			
			// Принудительно очищаем кеш для рабочих пространств
			queryClient.removeQueries({ queryKey: ["workspaces"] });
			
			// Инвалидируем запросы и устанавливаем флаг для принудительного обновления
			queryClient.invalidateQueries({ 
				queryKey: ["workspaces"],
				refetchType: 'all'
			});
			
			// Принудительно устанавливаем новые данные в кеш для быстрого доступа
			queryClient.setQueryData(["workspaces"], (oldData) => {
				console.log("Обновляем кеш рабочих пространств:", { oldData, newWorkspace: data.data });
				
				// Если есть старые данные, добавляем новое рабочее пространство
				if (oldData && typeof oldData === 'object' && 'data' in oldData) {
					const typedOldData = oldData as { data: { documents: any[] } };
					
					return {
						...typedOldData,
						data: {
							...typedOldData.data,
							documents: [...(typedOldData.data.documents || []), data.data]
						}
					};
				}
				
				// Если старых данных нет, создаем новую структуру
				return {
					data: {
						documents: [data.data],
						total: 1
					}
				};
			});
		},
		onError: (error) => {
			console.error("Ошибка при создании рабочего пространства:", error);
			toast.error("Не удалось создать рабочее пространство");
		},
	});

	return mutation;
};
