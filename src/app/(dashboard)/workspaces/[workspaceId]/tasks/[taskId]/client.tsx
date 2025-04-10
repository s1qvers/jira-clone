"use client";

import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

import { useGetTask } from "@/features/tasks/api/use-get-task";
import { UseTaskId } from "@/features/tasks/hooks/use-task-id";
import { DottedSeparator } from "@/components/dotted-separator";
import { TaskOverview } from "@/features/tasks/components/task-overview";
import { TaskDescription } from "@/features/tasks/components/task-description";
import { TasksBreadcrumbs } from "@/features/tasks/components/tasks-breadcrumbs";
import { Task } from "@/features/tasks/types";

export const TaskIdClient = () => {
	const taskId = UseTaskId();
	const { data, isLoading } = useGetTask({ taskId });

	if (isLoading) return <PageLoader />;

	if (!data) return <PageError />;

	// Безопасное приведение data к типу Task и получение project
	const task = data as any as Task;
	const project = task.project;

	return (
		<div className="flex flex-col">
			<TasksBreadcrumbs task={task} project={project} />
			<DottedSeparator className="my-6" />
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<TaskOverview task={task} />
				<TaskDescription task={task} />
			</div>
		</div>
	);
};
