import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseCheckMembershipProps {
  workspaceId: string;
}

export const useCheckMembership = ({ workspaceId }: UseCheckMembershipProps) => {
  return useQuery({
    queryKey: ["membership", workspaceId],
    queryFn: async () => {
      try {
        // Используем API для получения списка участников
        const response = await client.api.members.$get({
          query: { workspaceId }
        });
        
        if (!response.ok) {
          // Если пользователь не авторизован или не участник, получим ошибку 401
          return { isMember: false };
        }
        
        const data = await response.json();
        return { isMember: true, data };
      } catch (error) {
        // В случае ошибки считаем, что пользователь не участник
        return { isMember: false };
      }
    },
    retry: false, // Отключаем повторные запросы при ошибке
  });
}; 