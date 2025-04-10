"use client";

import Link from "next/link";
import { Task } from "@/features/tasks/types";
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";

import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useGetMembers, type MembersResponse, type MemberDocument } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";

import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/page-loader";
import { Project } from "@/features/projects/types";
import { PageError } from "@/components/page-error";
import { Analytics } from "@/components/analytics";
import { Button } from "@/components/ui/button";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { DashboardTopbar } from "@/components/dashboard-topbar";

export const WorkspaceIdClient = () => {
	const workspaceId = useWorkspaceId();
	
	// Если workspaceId отсутствует, показываем сообщение об ошибке
	if (!workspaceId) {
		return <PageError message="ID рабочего пространства не указан" />;
	}
	
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const { data: projects, isLoading: projectsLoading } = useGetProjects({ workspaceId });
	const { data: members, isLoading: membersLoading } = useGetMembers({ workspaceId });
	const { data: analytics, isLoading: analyticsLoading } = useGetWorkspaceAnalytics({ workspaceId });
	const { data: tasks, isLoading: tasksLoading } = useGetTasks({ workspaceId });

	const isLoading =
		analyticsLoading || tasksLoading || projectsLoading || membersLoading;

	if (isLoading) return <PageLoader />;

	if (!analytics || !tasks || !projects || !members)
		return <PageError message="Не удалось загрузить данные рабочей области" />;
	return (
		<div className="h-full flex flex-col space-y-4">
			<Analytics data={{
				...analytics,
				tasksByStatus: {
					BACKLOG: 0,
					TODO: 0,
					IN_PROGRESS: 0,
					IN_REVIEW: 0,
					DONE: 0,
					...Object.fromEntries(analytics?.tasksByStatus.map(item => [item.status, item.count]) || [])
				},
				completionRate: 0,
				averageCompletionTime: 0
			}} />
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
				<TaskList data={tasks.documents as Task[]} total={tasks.total} />
				<ProjectList data={projects.documents as Project[]} total={projects.total} />
				<MembersList data={members.documents as MemberDocument[]} total={members.total} />
			</div>
			<DashboardTopbar
				members={members}
				tasks={tasks}
				projects={projects}
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
				workspaceId={workspaceId}
			/>
		</div>
	);
};

interface TaskListProps {
	data: Task[];
	total: number;
}
export const TaskList = ({ data, total }: TaskListProps) => {
	const { open: createTask } = useCreateTaskModal();
	const workspaceId = useWorkspaceId();

	return (
		<div className="flex flex-col gap-y-4 col-span-1">
			<div className="bg-muted rounded-lg p-4">
				<div className="flex items-center justify-between">
					<p className="text-lg font-semibold">Задачи ({total})</p>
					<Button variant="muted" size="icon" onClick={createTask}>
						<PlusIcon className="size-4 text-neutral-400" />
					</Button>
				</div>
				<DottedSeparator className="my-4" />
				<ul className="flex flex-col gap-y-4">
					{data.map((task) => (
						<li key={task.$id}>
							<Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
								<Card className="shadow-none rounded-lg hover:opacity-75 transition">
									<CardContent className="p-4">
										<p className="text-lg font-medium truncate">{task.name}</p>
										<div className="flex items-center gap-x-2">
											<p>{task.project?.name}</p>
											<div className="dot" />
											<div className="text-sm text-muted-foreground flex items-center">
												<CalendarIcon className="size-3 mr-1" />
												<span className="truncate">
													{formatDistanceToNow(new Date(task.dueDate))}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							</Link>
						</li>
					))}
					<li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
					Не найдено ни одного задания
					</li>
				</ul>
				<Button variant="muted" className="mt-4 w-full" asChild>
					<Link href={`/workspaces/${workspaceId}/tasks`}>Показать все</Link>
				</Button>
			</div>
		</div>
	);
};

interface ProjectListProps {
	data: Project[];
	total: number;
}
export const ProjectList = ({ data, total }: ProjectListProps) => {
	const { open: createProject } = useCreateProjectModal();
	const workspaceId = useWorkspaceId();

	return (
		<div className="flex flex-col gap-y-4 col-span-1">
			<div className="bg-white border rounded-lg p-4">
				<div className="flex items-center justify-between">
					<p className="text-lg font-semibold">Проекты ({total})</p>
					<Button variant="secondary" size="icon" onClick={createProject}>
						<PlusIcon className="size-4 text-neutral-400" />
					</Button>
				</div>
				<DottedSeparator className="my-4" />
				<ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{data.map((project) => (
						<li key={project.$id || project.id}>
							<Link href={`/workspaces/${workspaceId}/projects/${project.$id || project.id}`}>
								<Card className="shadow-none rounded-lg hover:opacity-75 transition">
									<CardContent className="p-4 flex items-center gap-x-2.5">
										<ProjectAvatar
											className="size-12"
											fallbackClassName="text-lg"
											name={project.name}
											image={project.imageUrl}
										/>
										<p className="text-lg font-medium truncate">
											{project.name}
										</p>
									</CardContent>
								</Card>
							</Link>
						</li>
					))}
					<li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
					Не найдено ни одного проекта
					</li>
				</ul>
			</div>
		</div>
	);
};

interface MembersListProps {
	data: MemberDocument[];
	total: number;
}
export const MembersList = ({ data, total }: MembersListProps) => {
	const workspaceId = useWorkspaceId();

	return (
		<div className="flex flex-col gap-y-4 col-span-1">
			<div className="bg-white border rounded-lg p-4">
				<div className="flex items-center justify-between">
					<p className="text-lg font-semibold">Участники ({total})</p>
					<Button asChild variant="secondary" size="icon">
						<Link href={`/workspaces/${workspaceId}/members`}>
							<SettingsIcon className="size-4 text-neutral-400" />
						</Link>
					</Button>
				</div>
				<DottedSeparator className="my-4" />
				<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{data.map((member) => (
						<li key={member.$id}>
							<Card className="shadow-none rounded-lg overflow-hidden">
								<CardContent className="p-3 flex-col flex items-center gap-x-2">
									<MemberAvatar className="size-12" name={member.name} />
									<div className="flex flex-col items-center overflow-hidden">
										<p className="text-lg font-medium line-clamp-1">
											{member.name}
										</p>
										<p className="text-sm text-muted-foreground line-clamp-1">
											{member.email}
										</p>
									</div>
								</CardContent>
							</Card>
						</li>
					))}
					<li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
					Не найдено ни одного участника
					</li>
				</ul>
			</div>
		</div>
	);
};
