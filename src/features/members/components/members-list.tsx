"use client";

import Link from "next/link";
import { Fragment } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { useGetMembers, MemberDocument } from "@/features/members/api/use-get-members";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { MemberRole } from "@/features/members/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { useConfirm } from "@/hooks/use-confirm";
import { useAuth } from "@/hooks/use-auth";

export const MembersList = () => {
	const workspaceId = useWorkspaceId();
	const router = useRouter();
	const { user } = useAuth();
	const [ConfirmDialog, confirm] = useConfirm(
		"Удалить участника",
		"Вы уверены, что хотите удалить этого участника из рабочего пространства?",
		"destructive"
	);

	const { data } = useGetMembers({ workspaceId });

	const { mutate: updateMember } = useUpdateMember();
	const { mutate: deleteMember } = useDeleteMember();

	// Определяем, является ли текущий пользователь администратором
	const isAdmin = data?.documents.some(
		(member: MemberDocument) => member.role === MemberRole.ADMIN && member.userId === user?.id
	);

	const members = data?.documents || [];

	const handleUpdateMember = (memberId: string, role: MemberRole) => {
		updateMember({
			param: { memberId },
			json: { role },
		}, {
			onSuccess: () => {
				router.refresh();
			},
			onError: (error) => {
				if (error.message.includes("единственного администратора")) {
					toast.error("Невозможно понизить статус единственного администратора");
				} else {
					toast.error("Не удалось обновить роль участника");
				}
			}
		});
	};

	const handleDeleteMember = async (memberId: string) => {
		const ok = await confirm();
		if (!ok) return;
		deleteMember(
			{ param: { memberId } },
			{
				onSuccess: () => {
					router.refresh();
				},
			}
		);
	};
	
	return (
		<>
			<Card className="size-full border-none shadow-none">
				<ConfirmDialog />
				<CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
					<Button asChild variant="secondary" size="sm">
						<Link href={`/workspaces/${workspaceId}`}>
							<ArrowLeft className="size-4 mr-2" />
							Назад
						</Link>
					</Button>
					<CardTitle className="text-xl font-bold">Список участников</CardTitle>
				</CardHeader>
				<CardContent className="p-7">
					<div className="space-y-4">
						{members.map((member) => (
							<Fragment key={member.$id}>
								<div className="flex items-center justify-between py-2">
									<div className="flex items-center gap-x-3">
										<MemberAvatar
											className="size-10"
											fallbackClassName="text-lg"
											name={member.name}
										/>
										<div className="space-y-1">
											<p className="text-sm font-medium">{member.name}</p>
											<p className="text-xs text-muted-foreground">{member.email}</p>
										</div>
									</div>
									<div className="flex items-center gap-x-4">
										<span className="text-sm font-medium">
											{member.role === MemberRole.ADMIN
												? "Администратор"
												: "Участник"}
										</span>
										{isAdmin && (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button size="icon" variant="ghost">
														<MoreVertical className="size-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() =>
															handleUpdateMember(member.$id, MemberRole.MEMBER)
														}
														disabled={member.role === MemberRole.MEMBER}
													>
														Сделать участником
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() =>
															handleUpdateMember(member.$id, MemberRole.ADMIN)
														}
														disabled={member.role === MemberRole.ADMIN}
													>
														Сделать администратором
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleDeleteMember(member.$id)}
														className="text-destructive"
													>
														Удалить
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									</div>
								</div>
							</Fragment>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	);
};
