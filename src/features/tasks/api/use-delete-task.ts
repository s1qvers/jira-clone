import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<
	(typeof client.api.tasks)[":taskId"]["$delete"],
	200
>;
type RequestType = InferRequestType<
	(typeof client.api.tasks)[":taskId"]["$delete"]
>;

export const useDeleteTask = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ param }) => {
			console.log("Удаление задачи с ID:", param.taskId);
			const response = await client.api.tasks[":taskId"].$delete({ param });
			if (!response.ok) throw new Error("Не удалось удалить задачу");
			return await response.json();
		},
		onSuccess: (response) => {
			// Проверка наличия данных в ответе
			if (!response || !response.data) {
				console.error("Неверный формат ответа при удалении задачи:", response);
				toast.success("Задача удалена, но ответ сервера неполный");
				// Инвалидируем кэш, чтобы обновить данные
				queryClient.invalidateQueries({ queryKey: ["tasks"] });
				return;
			}
			
			const taskId = response.data.$id || response.data.id;
			console.log("Задача успешно удалена, ID:", taskId);
			toast.success("Задача успешно удалена");
			
			// Инвалидируем все связанные запросы
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			queryClient.invalidateQueries({ queryKey: ["task", taskId] });
			queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
			queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
			
			// Принудительно обновляем страницу после короткой задержки
			setTimeout(() => {
				window.location.reload();
			}, 100);
		},
		onError: (error) => {
			console.error("Ошибка при удалении задачи:", error);
			toast.error("Не удалось удалить задачу");
		},
	});

	return mutation;
};
