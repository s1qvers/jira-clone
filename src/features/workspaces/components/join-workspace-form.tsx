"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { useJoinWorkspace } from "../api/use-join-workspace";

interface JoinWorkspaceFormProps {
	initialValues: {
		name: string;
	};
	code: string;
	workspaceId: string;
}
export const JoinWorkspaceForm = ({
	initialValues,
	code: inviteCode,
	workspaceId,
}: JoinWorkspaceFormProps) => {
	const router = useRouter();
	const [errorMessage, setErrorMessage] = useState("");
	const { mutate, isPending } = useJoinWorkspace();

	const onSubmit = () => {
		setErrorMessage("");
		console.log("Отправляем запрос с данными:", {
			param: { workspaceId },
			json: { 
				inviteCode,
				code: inviteCode // Для обратной совместимости, если сервер ожидает 'code'
			}
		});
		
		mutate(
			{
				param: { workspaceId },
				json: { 
					inviteCode,
					code: inviteCode // Для обратной совместимости, если сервер ожидает 'code'
				},
			},
			{
				onSuccess: ({ data }) => {
					console.log("Успешно присоединились к рабочему пространству:", data);
					router.push(`/workspaces/${data.$id}`);
				},
				onError: (error) => {
					console.error("Ошибка при присоединении:", error);
					
					// Если ошибка связана с тем, что пользователь уже участник,
					// предлагаем перейти на страницу рабочего пространства
					if (error.message.includes("уже являетесь участником")) {
						setErrorMessage("Вы уже являетесь участником этого рабочего пространства");
						setTimeout(() => {
							router.push(`/workspaces/${workspaceId}`);
						}, 2000);
					} else {
						setErrorMessage(error.message || "Не удалось присоединиться к рабочему пространству");
					}
				}
			}
		);
	};

	return (
		<Card className="size-full border-none shadow-none">
			<CardHeader className="p-7">
				<CardTitle className="text-xl font-bold">Присоединиться к рабочему пространству</CardTitle>
				<CardDescription>
				Вас пригласили присоединиться к <strong>{initialValues.name}</strong>{" "}
				рабочему пространству
				</CardDescription>
				{errorMessage && (
					<div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
						<p className="font-medium">{errorMessage}</p>
					</div>
				)}
			</CardHeader>
			<div className="px-7">
				<DottedSeparator />
			</div>
			<CardContent className="p-7">
				<div className="flex flex-col gap-2 lg:flex-row items-center justify-between">
					<Button
						className="w-full lg:w-fit"
						disabled={isPending}
						variant="secondary"
						type="button"
						size="lg"
						asChild
					>
						<Link href="/">Отменить</Link>
					</Button>
					<Button
						className="w-full lg:w-fit"
						disabled={isPending}
						onClick={onSubmit}
						type="button"
						size="lg"
					>
						Присоединиться к рабочему пространству
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
