import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.auth.logout)["$post"]>;

export const useLogout = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error>({
		mutationFn: async () => {
			const response = await client.api.auth.logout.$post();
			if (!response.ok) throw new Error("Не удалось выйти из системы");
			return await response.json();
		},
		onSuccess: () => {
			router.refresh();
			toast.success("Успешно вышел из системы");
			queryClient.invalidateQueries({ queryKey: ["current"] });
			queryClient.invalidateQueries({ queryKey: ["workspaces"] });
		},
		onError: () => {
			toast.error("Не удалось выйти из системы");
		},
	});

	return mutation;
};
