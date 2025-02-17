import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
	(typeof client.api.auth.register)["$post"]
>;
type RequestType = InferRequestType<(typeof client.api.auth.register)["$post"]>;

export const useRegister = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ json }) => {
			const response = await client.api.auth.register.$post({ json });
			if (!response.ok) throw new Error("Не удалось зарегистрироваться");

			return await response.json();
		},
		onSuccess: () => {
			router.refresh();
			toast.success("Зарегистрировано успешно!");
			queryClient.invalidateQueries({ queryKey: ["current"] });
		},
		onError: () => {
			toast.error("Не удалось зарегистрироваться");
		},
	});

	return mutation;
};
