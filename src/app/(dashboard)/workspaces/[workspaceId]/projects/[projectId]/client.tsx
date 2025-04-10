"use client";
import { Pencil } from "lucide-react";
import Link from "next/link";

import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";

import { Button } from "@/components/ui/button";
import { useProjectId } from "@/features/projects/hooks/use-projectId";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { useGetProjectAnalytics } from "@/features/projects/api/use-get-project-analytics";
import { Analytics } from "@/components/analytics";
import { useRouter } from "next/navigation";

export const ProjectIdClient = () => {
	const projectId = useProjectId();
	const router = useRouter();
	const { data: project, isLoading: projectsLoading } = useGetProject({
		projectId,
	});
	const { data: analytics, isLoading: analyticsLoading } =
		useGetProjectAnalytics({ projectId });

	const isLoading = projectsLoading || analyticsLoading;

	if (isLoading) return <PageLoader />;
	if (!project) return <PageError message="Project not found" />;

	// URL для настроек проекта должен вести к странице в слое standalone
	const workspaceId = project.workspaceId;
	
	// Создаем прямую ссылку на страницу настроек проекта
	const goToProjectSettings = () => {
		// Формируем URL с использованием window.location
		const url = `${window.location.origin}/workspaces/${workspaceId}/projects/${projectId}/settings`;
		console.log("Переход на страницу настроек проекта:", url);
		
		// Открываем окно напрямую, минуя роутер Next.js
		window.location.href = url;
	};

	return (
		<div className="flex flex-col gap-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-x-2">
					<ProjectAvatar
						name={project.name}
						image={project.imageUrl}
						className="size-8"
					/>
					<p className="text-lg font-semibold">{project.name}</p>
				</div>
				<button 
					onClick={goToProjectSettings}
					className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3"
				>
					<Pencil className="size-4 mr-2" />
					Редактировать проект
				</button>
			</div>
			{analytics ? <Analytics data={analytics} /> : null}
			<TaskViewSwitcher hideProjectFilter />
		</div>
	);
};
