"use client";
import { useRouter } from "next/navigation";
import { RiAddCircleFill, RiRefreshLine } from "react-icons/ri";
import { useEffect, useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

// Функция для проверки валидности URL изображения
function isValidImageUrl(url: string | null | undefined): boolean {
	if (!url || typeof url !== 'string' || url.trim() === "") return false;
	return url.startsWith('/uploads/') || url.startsWith('/placeholder') || url.startsWith('http');
}

export const WorkspaceSwitcher = () => {
	const workspaceId = useWorkspaceId();
	const router = useRouter();
	const { open } = useCreateWorkspaceModal();
	const { data, refetch, isLoading } = useGetWorkspaces();
	const queryClient = useQueryClient();
	const [isRefreshing, setIsRefreshing] = useState(false);
	
	// При монтировании компонента принудительно инвалидируем кеш
	useEffect(() => {
		// Инвалидируем кеш и обновляем данные
		queryClient.invalidateQueries({ queryKey: ["workspaces"] });
		
		// Принудительно обновляем данные после задержки
		const timer = setTimeout(() => {
			refetch();
		}, 500);
		
		return () => clearTimeout(timer);
	}, [queryClient, refetch]);
	
	// Отладочная информация при получении данных
	useEffect(() => {
		if (data) {
			console.log("WorkspaceSwitcher data:", data);
		}
	}, [data]);
	
	// Получаем текущее рабочее пространство
	const currentWorkspace = data?.documents?.find(ws => ws.id === workspaceId);
	
	// Логируем информацию о текущем рабочем пространстве
	useEffect(() => {
		if (currentWorkspace) {
			console.log("Current workspace:", {
				id: currentWorkspace.id,
				name: currentWorkspace.name,
				imageUrl: currentWorkspace.imageUrl,
				imageType: typeof currentWorkspace.imageUrl,
				hasImage: Boolean(currentWorkspace.imageUrl),
				isValidImage: isValidImageUrl(currentWorkspace.imageUrl)
			});
		}
	}, [currentWorkspace]);

	// Функция перехода к выбранному рабочему пространству
	const onSelect = (id: string) => {
		router.push(`/workspaces/${id}`);
	};
	
	// Функция для принудительного обновления данных
	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			// Инвалидируем все кэши, связанные с рабочими пространствами
			await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
			await queryClient.invalidateQueries({ queryKey: ["workspace"] });
			
			// Принудительно обновляем данные
			await refetch();
			
			console.log("Данные о рабочих пространствах обновлены");
		} catch (error) {
			console.error("Ошибка при обновлении данных:", error);
		} finally {
			setIsRefreshing(false);
		}
	};
	
	return (
		<div className="flex flex-col gap-y-2">
			<div className="flex items-center justify-between">
				<p className="text-xs uppercase text-neutral-500">Рабочие пространства</p>
				<div className="flex items-center gap-x-2">
					<Button 
						size="icon" 
						variant="ghost" 
						className="size-5 text-neutral-500 p-0"
						onClick={handleRefresh}
						disabled={isRefreshing}
					>
						<RiRefreshLine className={`size-5 ${isRefreshing ? 'animate-spin' : ''}`} />
					</Button>
					<RiAddCircleFill
						onClick={open}
						className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
					/>
				</div>
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
						// Отладка данных о рабочем пространстве при отрисовке
						console.log(`Workspace ${workspace.name}:`, {
							id: workspace.id, 
							imageUrl: workspace.imageUrl,
							imageType: typeof workspace.imageUrl,
							isValidImage: isValidImageUrl(workspace.imageUrl)
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