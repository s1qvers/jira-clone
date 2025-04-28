import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
	(typeof client.api.auth.register)["$post"]
>;
type RequestType = InferRequestType<(typeof client.api.auth.register)["$post"]>;

// Расширенный тип для ответа с ошибкой
interface ErrorResponse {
	success: boolean;
	message?: string;
}

export const useRegister = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ json }) => {
			const response = await client.api.auth.register.$post({ json });
			
			if (!response.ok) {
				const errorResponse = await response.json() as ErrorResponse;
				if (errorResponse.message) {
					throw new Error(errorResponse.message);
				}
				throw new Error("Не удалось зарегистрироваться");
			}

			return await response.json();
		},
		onSuccess: (data) => {
			// Сначала инвалидируем запросы, чтобы гарантировать актуальность данных
			queryClient.invalidateQueries({ queryKey: ["current"] });
			
			// Сообщаем пользователю об успехе
			toast.success("Зарегистрировано успешно! Перенаправление...");
			
			// Обновляем UI
			router.refresh();
			
			// Увеличиваем задержку перед перенаправлением
			setTimeout(() => {
				// Сохраняем флаг перенаправления в локальное хранилище
				try {
					localStorage.setItem("redirect_after_register", "true");
				} catch (e) {
					console.error("Ошибка при сохранении в localStorage:", e);
				}
				
				// Выполняем перенаправление
				router.push('/workspaces/create?from=registration');
				
				// Резервный механизм перенаправления, если router.push не сработает
				setTimeout(() => {
					window.location.href = '/workspaces/create?from=registration';
				}, 500);
			}, 2000); // Увеличиваем время до 2 секунд
		},
		onError: (error) => {
			toast.error(error.message || "Не удалось зарегистрироваться");
		},
	});

	return mutation;
};
