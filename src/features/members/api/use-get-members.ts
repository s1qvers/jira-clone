import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
interface UseGetMembersProps {
	workspaceId: string;
}
export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
	const query = useQuery({
		queryKey: ["members", workspaceId],
		queryFn: async () => {
			const response = await client.api.members.$get({
				query: { workspaceId },
			});
			if (!response.ok) {
				throw new Error("Не удалось получить участников");
			}
			const { data } = await response.json();
			return data;
		},
	});

	return query;
};
