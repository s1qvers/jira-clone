import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<
	(typeof client.api.members)[":memberId"]["$delete"],
	200
>;
type RequestType = InferRequestType<
	(typeof client.api.members)[":memberId"]["$delete"]
>;

export const useDeleteMember = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ param }) => {
			const response = await client.api.members[":memberId"].$delete({
				param,
			});
			if (!response.ok) throw new Error("Не удалось удалить участника");
			return await response.json();
		},
		onSuccess: () => {
			toast.success("Участник успешно удален");
			queryClient.invalidateQueries({ queryKey: ["members"] });
		},
		onError: () => {
			toast.error("Не удалось удалить участника");
		},
	});

	return mutation;
};
