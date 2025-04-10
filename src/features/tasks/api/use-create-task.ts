import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { Task } from "../types";

export interface TaskCreateResponse {
	data: Task;
}

type RequestType = InferRequestType<
	(typeof client.api.tasks)["projects"][":projectId"]["$post"]
>;

interface UseCreateTaskParams {
	projectId: string;
}

export const useCreateTask = ({ projectId }: UseCreateTaskParams) => {
	const queryClient = useQueryClient();
	const mutation = useMutation<TaskCreateResponse, Error, RequestType>({
		mutationFn: async ({ json }) => {
			if (!projectId) {
				throw new Error("ID проекта не указан");
			}
			
			const response = await client.api.tasks.projects[":projectId"].$post({
				param: { projectId },
				json,
			});
			if (!response.ok) throw new Error("Не удалось создать задачу");
			return await response.json() as TaskCreateResponse;
		},
		onSuccess: () => {
			toast.success("Задача успешно создана");
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
		onError: (error) => {
			toast.error(error.message || "Не удалось создать задачу");
		},
	});

	return mutation;
};
