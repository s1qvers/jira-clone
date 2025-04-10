import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

type ResponseType = InferResponseType<
	(typeof client.api.projects)["workspaces"][":workspaceId"]["$post"],
	200
>;
type RequestType = InferRequestType<(typeof client.api.projects)["workspaces"][":workspaceId"]["$post"]>;

export const useCreateProject = () => {
	const queryClient = useQueryClient();
	const workspaceId = useWorkspaceId();
	
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ form }) => {
			if (!workspaceId) {
				throw new Error("ID рабочего пространства не указан");
			}
			
			const response = await client.api.projects.workspaces[":workspaceId"].$post({
				param: { workspaceId },
				form
			});
			if (!response.ok) throw new Error("Не удалось создать проект");
			return await response.json();
		},
		onSuccess: () => {
			toast.success("Проект успешно создан");
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
		onError: (error) => {
			toast.error(error.message || "Не удалось создать проект");
		},
	});

	return mutation;
};
