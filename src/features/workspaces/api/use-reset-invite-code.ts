import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

// Используем только тип запроса из Hono
type RequestType = InferRequestType<
	(typeof client.api.workspaces)[":workspaceId"]["reset-invite-code"]["$post"]
>;

interface ResponseData {
	data: {
		$id: string;
		[key: string]: any;
	}
}

export const useResetInviteCode = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseData, Error, RequestType>({
		mutationFn: async ({ param }) => {
			console.log("Сброс инвайт-кода:", param);
			
			// Явно проверяем наличие workspaceId в параметрах
			if (!param || !param.workspaceId) {
				throw new Error("Отсутствует ID рабочего пространства");
			}
			
			// Используем обычный fetch вместо Hono-клиента
			const response = await fetch(`/api/workspaces/${param.workspaceId}/reset-invite-code`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error("Ошибка при сбросе инвайт-кода:", {
					status: response.status,
					statusText: response.statusText,
					errorData,
					url: response.url
				});
				throw new Error("Не удалось сбросить пригласительный код");
			}
			return await response.json();
		},
		onSuccess: ({ data }) => {
			toast.success("Успешно сброшен пригласительный код");
			// Инвалидируем кэш всех рабочих пространств
			queryClient.invalidateQueries({ queryKey: ["workspaces"] });
			queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
		},
		onError: (error) => {
			console.error("Ошибка в хуке useResetInviteCode:", error);
			toast.error("Не удалось сбросить пригласительный код");
		},
	});

	return mutation;
};
