import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

// Используем только тип запроса из Hono
type RequestType = InferRequestType<
	(typeof client.api.workspaces)[":workspaceId"]["$delete"]
>;

interface ResponseData {
	data: {
		$id: string;
		[key: string]: any;
	}
}

export const useDeleteWorkspace = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseData, Error, RequestType>({
		mutationFn: async ({ param }) => {
			console.log("Удаление рабочего пространства:", param);
			
			// Явно проверяем наличие workspaceId в параметрах
			if (!param || !param.workspaceId) {
				throw new Error("Отсутствует ID рабочего пространства");
			}
			
			// Используем обычный fetch вместо Hono-клиента
			const response = await fetch(`/api/workspaces/${param.workspaceId}`, {
				method: 'DELETE'
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error("Ошибка при удалении рабочего пространства:", {
					status: response.status,
					statusText: response.statusText,
					errorData
				});
				throw new Error("Не удалось удалить рабочую область");
			}
			return await response.json();
		},
		onSuccess: ({ data }) => {
			toast.success("Рабочее пространство успешно удалено");
			queryClient.invalidateQueries({ queryKey: ["workspaces"] });
			queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
		},
		onError: (error) => {
			console.error("Ошибка в хуке useDeleteWorkspace:", error);
			toast.error("Не удалось удалить рабочую область");
		},
	});

	return mutation;
};
