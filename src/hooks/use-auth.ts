import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

export const useAuth = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const response = await client.api.auth.current.$get();
      if (!response.ok) return null;
      return response.json();
    }
  });

  return {
    user: data?.data,
    isLoading
  };
}; 