import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<
	(typeof client.api.members)[":memberId"]["$patch"],
	200
>;
type RequestType = InferRequestType<
	(typeof client.api.members)[":memberId"]["$patch"]
>;

export const useUpdateMember = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ param, json }) => {
			const response = await client.api.members[":memberId"].$patch({
				param,
				json,
			});
			if (!response.ok) {
				const responseData = await response.json() as { error?: string };
				throw new Error(responseData.error || "Не удалось обновить участника");
			}
			return await response.json();
		},
		onSuccess: () => {
			toast.success("Участник успешно обновлен");
			queryClient.invalidateQueries({ queryKey: ["members"] });
		},
		onError: (error) => {
			toast.error(error.message || "Не удалось обновить участника");
		},
	});

	return mutation;
};
