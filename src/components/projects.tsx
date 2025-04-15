"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";
import { useEffect } from "react";

import { cn } from "@/lib/utils";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

export const Projects = () => {
	const pathname = usePathname();
	const workspaceId = useWorkspaceId();

	const { open } = useCreateProjectModal();
	const { data, isLoading, error } = useGetProjects({ workspaceId });
	
	// Расширенная отладка
	useEffect(() => {
		console.log("Projects data:", data);
		console.log("Projects isLoading:", isLoading);
		console.log("Projects error:", error);
		
		if (data?.documents?.length > 0) {
			data.documents.forEach(project => {
				console.log(`Project in list ${project.name}:`, {
					id: project.$id || project.id,
					imageUrl: project.imageUrl || "не указан",
					hasImage: Boolean(project.imageUrl)
				});
			});
		}
	}, [data, isLoading, error]);

	if (!data?.documents || data.documents.length === 0) {
		return (
			<div className="flex flex-col gap-y-2">
				<div className="flex items-center justify-between">
					<p className="text-xs uppercase text-neutral-500">Проекты</p>
					<RiAddCircleFill
						onClick={open}
						className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
					/>
				</div>
				<div className="p-2 text-center text-sm text-neutral-500">
					Нет доступных проектов
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-y-2">
			<div className="flex items-center justify-between">
				<p className="text-xs uppercase text-neutral-500">Проекты</p>
				<RiAddCircleFill
					onClick={open}
					className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
				/>
			</div>
			{data.documents.map((project) => {
				const href = `/workspaces/${workspaceId}/projects/${project.$id || project.id}`;
				const isActive = pathname === href;
				
				return (
					<Link href={href} key={project.$id || project.id}>
						<div
							className={cn(
								"flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500",
								isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
							)}
						>
							<ProjectAvatar image={project.imageUrl} name={project.name} />
							<span className="truncate">{project.name}</span>
						</div>
					</Link>
				);
			})}
		</div>
	);
};
