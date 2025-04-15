import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<
	(typeof client.api.workspaces)[":workspaceId"]["join"]["$post"],
	200
>;
type RequestType = InferRequestType<
	(typeof client.api.workspaces)[":workspaceId"]["join"]["$post"]
>;

export const useJoinWorkspace = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ param, json }) => {
			console.log("Отправка запроса на присоединение:", { param, json });
			
			try {
				const response = await client.api.workspaces[":workspaceId"][
					"join"
				].$post({
					param,
					json,
				});
				
				console.log("Ответ от сервера:", response.status, response.statusText);
				
				if (!response.ok) {
					const errorData = await response.json().catch(e => {
						console.error("Ошибка при чтении данных ответа:", e);
						return { error: "Ошибка при чтении данных ответа" };
					});
					console.error("Детали ошибки при присоединении:", {
						status: response.status,
						statusText: response.statusText,
						errorData
					});
					throw new Error(errorData.error || "Не удалось присоединиться к рабочей области");
				}
				
				const result = await response.json();
				console.log("Успешный ответ:", result);
				return result;
			} catch (error) {
				console.error("Исключение при выполнении запроса:", error);
				throw error;
			}
		},
		onSuccess: ({ data }) => {
			toast.success("Успешно подключено рабочее пространство");
			queryClient.invalidateQueries({ queryKey: ["workspaces"] });
			queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
		},
		onError: (error) => {
			console.error("Ошибка мутации:", error);
			toast.error(error.message || "Не удалось присоединиться к рабочей области");
		},
	});

	return mutation;
};
