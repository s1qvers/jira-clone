"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import { useInviteCode } from "@/features/workspaces/hooks/use-invite-code";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/rpc";
import { useCheckMembership } from "@/features/members/api/use-check-membership";
import { useRouter } from "next/navigation";

const DebugComponent = ({ workspaceId, inviteCode }: { workspaceId: string, inviteCode: string }) => {
	const [debugInfo, setDebugInfo] = useState<string>("");
	
	const testDirectRequest = async () => {
		try {
			const response = await fetch(`/api/workspaces/${workspaceId}/join`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ inviteCode }),
			});
			
			const data = await response.json();
			setDebugInfo(JSON.stringify({
				status: response.status,
				statusText: response.statusText,
				data
			}, null, 2));
		} catch (error) {
			setDebugInfo(JSON.stringify(error, null, 2));
		}
	};
	
	return (
		<div className="mt-4 p-4 bg-gray-100 rounded-md">
			<h3 className="font-bold mb-2">Отладочная информация</h3>
			<div className="mb-4">
				<div>workspaceId: <code className="bg-gray-200 p-1">{workspaceId}</code></div>
				<div>inviteCode: <code className="bg-gray-200 p-1">{inviteCode}</code></div>
			</div>
			<Button onClick={testDirectRequest} variant="outline" size="sm">
				Тестировать прямой запрос
			</Button>
			{debugInfo && (
				<pre className="mt-4 p-2 bg-gray-200 overflow-auto text-xs">
					{debugInfo}
				</pre>
			)}
		</div>
	);
};

export const WorkspaceIdJoinClient = () => {
	const router = useRouter();
	const workspaceId = useWorkspaceId();
	const inviteCode = useInviteCode();
	
	console.log("Данные из URL:", { workspaceId, inviteCode });
	
	const { data: initialValues, isLoading: isLoadingWorkspace } = useGetWorkspaceInfo({
		workspaceId,
	});
	
	// Проверяем, является ли пользователь уже участником
	const { data: membershipData, isLoading: isCheckingMembership } = useCheckMembership({
		workspaceId,
	});
	
	const isLoading = isLoadingWorkspace || isCheckingMembership;
	
	if (isLoading) return <PageLoader />;
	if (!initialValues) return <PageError message="Рабочее пространство не найдено" />;
	
	// Если пользователь уже участник, показываем сообщение и кнопку для перехода на страницу пространства
	if (membershipData?.isMember) {
		return (
			<div className="w-full lg:max-w-xl">
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<h2 className="text-xl font-bold mb-2">Присоединиться к рабочему пространству</h2>
					<p className="text-gray-500 mb-4">Рабочее пространство: <strong>{initialValues.name}</strong></p>
					<div className="p-4 mb-6 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200">
						<p className="font-medium">Вы уже являетесь участником этого рабочего пространства</p>
					</div>
					<div className="flex justify-end">
						<Button 
							onClick={() => router.push(`/workspaces/${workspaceId}`)}
							className="w-full lg:w-auto"
						>
							Перейти в рабочее пространство
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full lg:max-w-xl">
			<JoinWorkspaceForm
				initialValues={initialValues}
				workspaceId={workspaceId}
				code={inviteCode}
			/>
			<DebugComponent workspaceId={workspaceId} inviteCode={inviteCode} />
		</div>
	);
};
