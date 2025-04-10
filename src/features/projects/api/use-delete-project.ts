import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<
	(typeof client.api.projects)[":projectId"]["$delete"],
	200
>;
type RequestType = InferRequestType<
	(typeof client.api.projects)[":projectId"]["$delete"]
>;

export const useDeleteProject = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ param }) => {
			console.log("Отправка запроса на удаление проекта, ID:", param.projectId);
			
			const response = await client.api.projects[":projectId"].$delete({
				param,
			});

			if (!response.ok) throw new Error("Не удалось удалить проект");
			return await response.json();
		},
		onSuccess: (data) => {
			// Удаляем toast.success, так как он будет показываться в компоненте
			const projectId = data?.data?.id || data?.data?.$id;
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			if (projectId) {
				queryClient.invalidateQueries({ queryKey: ["project", projectId] });
			}
		},
		onError: (error) => {
			console.error("Ошибка при удалении проекта:", error);
			toast.error(`Не удалось удалить проект: ${error.message}`);
		},
	});

	return mutation;
};
