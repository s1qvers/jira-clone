import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";

interface UseGetWorkspaceAnalyticsProps {
	workspaceId: string | null;
}
export type WorkspaceAnalyticsResponseType = InferResponseType<
	(typeof client.api.workspaces)[":workspaceId"]["analytics"]["$get"],
	200
>;
export const useGetWorkspaceAnalytics = ({
	workspaceId,
}: UseGetWorkspaceAnalyticsProps) => {
	const query = useQuery({
		queryKey: ["workspace-analytics", workspaceId],
		queryFn: async () => {
			if (!workspaceId) {
				return undefined;
			}
			
			const response = await client.api.workspaces[
				":workspaceId"
			].analytics.$get({
				param: { workspaceId },
			});
			if (!response.ok) {
				throw new Error("Не удалось получить аналитику рабочей области");
			}
			const { data } = await response.json();
			return data;
		},
		enabled: !!workspaceId,
	});

	return query;
};
