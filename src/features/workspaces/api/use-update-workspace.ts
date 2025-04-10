import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

// Используем только тип запроса из Hono
type RequestType = InferRequestType<
	(typeof client.api.workspaces)[":workspaceId"]["$patch"]
>;

interface ResponseData {
	data: {
		$id: string;
		[key: string]: any;
	}
}

export const useUpdateWorkspace = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseData, Error, RequestType>({
		mutationFn: async ({ form, param }) => {
			console.log("Обновление рабочего пространства:", {
				parameters: param,
				formData: form
			});
			
			// Явно проверяем наличие workspaceId в параметрах
			if (!param || !param.workspaceId) {
				throw new Error("Отсутствует ID рабочего пространства");
			}
			
			// Используем обычный fetch вместо Hono-клиента
			const formData = new FormData();
			if (form.name) formData.append('name', form.name);
			
			// Явно добавляем поле image даже если оно null, чтобы сервер знал, что его нужно удалить
			if (form.image instanceof File) {
				formData.append('image', form.image);
				console.log("Отправляем файл изображения");
			}
			else if (form.image === null) {
				// Отправляем специальное строковое значение 'null' для обозначения удаления
				formData.append('image', 'null');
				console.log("Отправляем 'null' строку для удаления изображения");
			}
			else if (typeof form.image === 'string') {
				// Для обычных строковых значений URL
				formData.append('image', form.image);
				console.log("Отправляем строковый URL изображения");
			}
			
			// Вывод всех полей FormData для отладки
			console.log("Отправляемые данные:");
			for (const [key, value] of formData.entries()) {
				console.log(`${key}: ${value}`);
			}
			
			const response = await fetch(`/api/workspaces/${param.workspaceId}`, {
				method: 'PATCH',
				body: formData
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error("Ошибка при обновлении рабочего пространства:", {
					status: response.status,
					statusText: response.statusText,
					errorData
				});
				throw new Error("Не удалось обновить рабочую область");
			}
			return await response.json();
		},
		onSuccess: ({ data }) => {
			// Инвалидируем кэш всех рабочих пространств, чтобы обновления отображались на главной странице
			queryClient.invalidateQueries({ queryKey: ["workspaces"] });
			queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
		},
		onError: (error) => {
			console.error("Ошибка в хуке useUpdateWorkspace:", error);
			toast.error("Не удалось обновить рабочую область");
		},
	});

	return mutation;
};
