import { useMutation } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
import { ForgotPasswordSchema } from "../schemas";

type RequestType = {
  json: ForgotPasswordSchema;
};

interface ResponseData {
  success: boolean;
  message?: string;
  debugInfo?: any; // Для отладочной информации
}

export const useForgotPassword = () => {
  const mutation = useMutation<ResponseData, Error, RequestType>({
    mutationFn: async ({ json }) => {
      console.log('Отправка запроса на восстановление пароля:', json.email);
      
      const response = await client.api.auth["forgot-password"].$post({ json });
      
      const data = await response.json();
      console.log('Ответ сервера на запрос восстановления пароля:', data);
      
      if (!data.success) {
        throw new Error(data.message || "Произошла ошибка при отправке запроса на восстановление пароля");
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Инструкции по восстановлению пароля отправлены на ваш email");
      
      console.log('Успешный запрос на восстановление пароля', data);
    },
    onError: (error) => {
      toast.error(error.message || "Произошла ошибка при отправке запроса на восстановление пароля");
      console.error('Ошибка при запросе восстановления пароля:', error);
    },
  });

  return mutation;
}; 