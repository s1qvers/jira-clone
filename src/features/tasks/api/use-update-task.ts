import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { Task } from "../types";
import { UpdateTaskSchema } from "../schemas";

export interface TaskUpdateResponse {
	data: Task;
}

// Определяем тип параметров для запроса обновления
export interface UpdateTaskRequest {
	json: UpdateTaskSchema;
	param: { taskId: string };
}

export const useUpdateTask = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<TaskUpdateResponse, Error, UpdateTaskRequest>({
		mutationFn: async ({ json, param }) => {
			console.log("Обновление задачи:", { json, param });
			
			// Получаем taskId из параметров
			const taskId = param.taskId;
			
			try {
				// Выполняем PATCH-запрос напрямую
				const response = await fetch(`/api/tasks/${taskId}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(json),
				});
				
				if (!response.ok) {
					const errorData = await response.json();
					console.error("Ошибка при обновлении задачи:", response.status, errorData);
					throw new Error(errorData.error || "Не удалось обновить задачу");
				}
				
				const result = await response.json();
				console.log("Задача успешно обновлена:", result);
				return result;
			} catch (error) {
				console.error("Ошибка при выполнении запроса:", error);
				throw error;
			}
		},
		onSuccess: (data) => {
			toast.success("Задача успешно обновлена");
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			if (data?.data?.id) {
				queryClient.invalidateQueries({ queryKey: ["task", data.data.id] });
			}
		},
		onError: (error) => {
			console.error("Ошибка мутации при обновлении задачи:", error);
			toast.error("Не удалось обновить задачу");
		},
	});

	return mutation;
};
