import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { MemberRole } from "@/features/members/types";

interface UseGetMembersProps {
	workspaceId: string | null;
}

export interface MemberDocument {
	$id: string;
	workspaceId: string;
	userId: string;
	role: MemberRole;
	name: string;
	email: string;
	createdAt: string;
	updatedAt: string;
}

export interface MembersResponse {
	documents: MemberDocument[];
	total: number;
}

export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
	const query = useQuery({
		queryKey: ["members", workspaceId],
		queryFn: async () => {
			if (!workspaceId) {
				return undefined;
			}
			
			const response = await client.api.members.$get({
				query: { workspaceId },
			});
			if (!response.ok) {
				throw new Error("Не удалось получить участников");
			}
			const { data } = await response.json();
			return data as MembersResponse;
		},
		enabled: !!workspaceId,
	});

	return query;
};
