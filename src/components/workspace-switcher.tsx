"use client";
import { useRouter } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";

export const WorkspaceSwitcher = () => {
	const workspaceId = useWorkspaceId();
	const router = useRouter();
	const { open } = useCreateWorkspaceModal();
	const { data } = useGetWorkspaces();
	
	// Отладочная информация
	console.log("WorkspaceSwitcher data:", data);
	
	// Получаем текущее рабочее пространство
	const currentWorkspace = data?.documents?.find(ws => ws.id === workspaceId);
	console.log("Current workspace:", {
		id: currentWorkspace?.id,
		name: currentWorkspace?.name,
		imageUrl: currentWorkspace?.imageUrl,
		imageType: typeof currentWorkspace?.imageUrl,
		hasImage: Boolean(currentWorkspace?.imageUrl)
	});

	const onSelect = (id: string) => {
		router.push(`/workspaces/${id}`);
	};
	return (
		<div className="flex flex-col gap-y-2">
			<div className="flex items-center justify-between">
				<p className="text-xs uppercase text-neutral-500">Рабочие пространства</p>
				<RiAddCircleFill
					onClick={open}
					className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
				/>
			</div>
			<Select onValueChange={onSelect} value={workspaceId || undefined}>
				<SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
					<SelectValue placeholder="Рабочее пространство не выбрано">
						{currentWorkspace && (
							<div className="flex justify-start items-center gap-3 font-medium">
								<WorkspaceAvatar
									name={currentWorkspace.name}
									image={currentWorkspace.imageUrl}
								/>
								<span className="truncate">{currentWorkspace.name}</span>
							</div>
						)}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{data?.documents?.map((workspace) => {
						// Отладка данных о рабочем пространстве
						console.log(`Workspace ${workspace.name}:`, {
							id: workspace.id, 
							imageUrl: workspace.imageUrl,
							imageType: typeof workspace.imageUrl
						});
						
						return (
							<SelectItem value={workspace.id} key={workspace.id}>
								<div className="flex justify-start items-center gap-3 font-medium">
									<WorkspaceAvatar
										name={workspace.name}
										image={workspace.imageUrl}
									/>
									<span className="truncate">{workspace.name}</span>
								</div>
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
};
