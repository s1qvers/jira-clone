import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { TaskStatus, Task } from "../types";

interface useGetTasksProps {
	workspaceId: string | null;
	projectId?: string | null;
	status?: TaskStatus | null;
	assigneeId?: string | null;
	dueDate?: string | null;
	search?: string | null;
}

export interface TasksResponse {
	data: {
		documents: Task[];
		total: number;
	};
}

export const useGetTasks = ({
	workspaceId,
	assigneeId,
	projectId,
	dueDate,
	search,
	status,
}: useGetTasksProps) => {
	const query = useQuery({
		queryKey: [
			"tasks",
			workspaceId,
			projectId,
			status,
			search,
			assigneeId,
			dueDate,
		],
		queryFn: async () => {
			if (!workspaceId) {
				return undefined;
			}
			
			const response = await client.api.tasks.$get({
				query: {
					workspaceId,
					projectId: projectId ?? undefined,
					status: status ?? undefined,
					search: search ?? undefined,
					assigneeId: assigneeId ?? undefined,
					dueDate: dueDate ?? undefined,
				},
			});
			if (!response.ok) {
				throw new Error("Не удалось получить задачи");
			}
			const result = await response.json() as TasksResponse;

			return result.data;
		},
		enabled: !!workspaceId,
	});

	return query;
};
