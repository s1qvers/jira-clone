import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { Task } from "../types";

interface useGetTaskProps {
	taskId: string;
}

export interface TaskResponse {
	data: Task;
}

export const useGetTask = ({ taskId }: useGetTaskProps) => {
	const query = useQuery({
		queryKey: ["task", taskId],
		queryFn: async () => {
			const response = await client.api.tasks[":taskId"].$get({
				param: { taskId },
			});
			if (!response.ok) {
				throw new Error("Не удалось получить задачу");
			}
			const data = await response.json() as TaskResponse;

			return data.data;
		},
	});

	return query;
};
