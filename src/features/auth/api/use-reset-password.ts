import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { client } from "@/lib/rpc";
import { ResetPasswordSchema } from "../schemas";

type RequestType = {
  json: ResetPasswordSchema;
};

interface ResponseData {
  success: boolean;
  message?: string;
}

export const useResetPassword = () => {
  const router = useRouter();
  const mutation = useMutation<ResponseData, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth["reset-password"].$post({ json });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Произошла ошибка при сбросе пароля");
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Пароль успешно изменен");
      // Перенаправляем на страницу входа
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || "Произошла ошибка при сбросе пароля");
    },
  });

  return mutation;
}; 