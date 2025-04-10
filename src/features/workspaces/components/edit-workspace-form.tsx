"use client";
import { useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CopyIcon, ImageIcon } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useConfirm } from "@/hooks/use-confirm";

import { type UpdateWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { type Workspace } from "../types";
import { toast } from "sonner";
import { useResetInviteCode } from "../api/use-reset-invite-code";

interface EditWorkspaceFormProps {
	onCancel?: () => void;
	initialValues: Workspace;
}

export const EditWorkspaceForm = ({
	onCancel,
	initialValues,
}: EditWorkspaceFormProps) => {
	const router = useRouter();
	const { mutate, isPending } = useUpdateWorkspace();
	const { mutate: deleteWorkspace, isPending: deletingWorkspace } =
		useDeleteWorkspace();

	const [DeleteWorkspaceDialog, confirmDelete] = useConfirm(
		"Расширенное рабочее пространство",
		"Вы уверены, что хотите удалить это рабочее пространство?",
		"destructive"
	);
	const { mutate: resetInviteCode, isPending: resetingInviteCode } =
		useResetInviteCode();

	const [ResetDialog, confirmReset] = useConfirm(
		"Сбросить ссылку для приглашения",
		"Это приведет к аннулированию текущей ссылки на приглашение",
		"destructive"
	);

	const inputRef = useRef<HTMLInputElement>(null);

	const form = useForm<UpdateWorkspaceSchema>({
		resolver: zodResolver(updateWorkspaceSchema),
		defaultValues: {
			...initialValues,
			image: initialValues.imageUrl && initialValues.imageUrl.includes('placeholder.com') 
				? '/placeholder.png' 
				: initialValues.imageUrl ?? "",
		},
	});
	const onSumbit = (values: UpdateWorkspaceSchema) => {
		const finalValues = {
			...values,
			image: values.image instanceof File ? values.image : values.image === null ? null : "",
		};
		const workspaceId = initialValues.id || initialValues.$id;
		console.log("Отправка данных на сервер:", {
			workspaceId,
			data: finalValues
		});
		mutate({
			form: finalValues,
			param: { workspaceId },
		}, {
			onSuccess: () => {
				// Не перенаправляем, просто показываем уведомление
				toast.success("Рабочее пространство успешно обновлено");
			}
		});
	};
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			form.setValue("image", file);
		}
	};

	const handleDelete = async () => {
		const ok = await confirmDelete();
		if (!ok) return;
		const workspaceId = initialValues.id || initialValues.$id;
		console.log("Удаление рабочего пространства:", workspaceId);
		deleteWorkspace(
			{
				param: { workspaceId },
			},
			{
				onSuccess: () => {
					toast.success("Рабочее пространство успешно удалено");
					// Принудительное перенаправление на главную страницу
					window.location.href = "/";
				},
			}
		);
	};
	const handleResetInviteCode = async () => {
		const ok = await confirmReset();
		if (!ok) return;
		const workspaceId = initialValues.id || initialValues.$id;
		console.log("Сброс инвайт-кода для рабочего пространства:", workspaceId);
		resetInviteCode({
			param: { workspaceId },
		});
	};
	const absoluteInviteLink = `${window.location.origin}/workspaces/${initialValues.id || initialValues.$id}/join/${initialValues.inviteCode}`;

	return (
		<div className="flex flex-col gap-y-4">
			<DeleteWorkspaceDialog />
			<ResetDialog />
			<Card className="size-full border-none shadow-none">
				<CardHeader className="flex flex-row items-center gap-x-4 space-y-0">
					<Button
						variant="secondary"
						onClick={
							onCancel
								? onCancel
								: () => {
									const workspaceId = initialValues.id || initialValues.$id;
									router.push(`/workspaces/${workspaceId}`);
								}
						}
					>
						<ArrowLeft className="size-4 mr-2" />
						Назад
					</Button>
					<CardTitle className="text-xl font-bold">
						{initialValues.name}
					</CardTitle>
				</CardHeader>
				<div className="px-7">
					<DottedSeparator />
				</div>
				<CardContent className="p-7">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSumbit)}>
							<div className="flex flex-col gap-y-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Имя рабочей области</FormLabel>
											<FormControl>
												<Input {...field} placeholder="Введите имя рабочей области" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="image"
									render={({ field }) => (
										<div className="flex flex-col gap-y-2">
											<div className="flex items-center gap-x-5">
												{field.value ? (
													<div className="size-[72px] relative rounded-md overflow-hidden">
														<Image
															fill
															src={
																field.value instanceof File
																	? URL.createObjectURL(field.value)
																	: typeof field.value === 'string' && field.value.includes('placeholder.com')
																		? '/placeholder.png'
																		: field.value
															}
															alt="Workspace Icon"
															className="object-cover"
														/>
													</div>
												) : (
													<Avatar className="size-[72px]">
														<AvatarFallback>
															<ImageIcon className="size-[36px] text-neutral-400" />
														</AvatarFallback>
													</Avatar>
												)}
												<div className="flex flex-col">
													<p className="text-sm">Значок рабочей области</p>
													<p className="text-sm text-muted-foreground">
														JPEG, PNG, SVG, или JPEG, максимум 1 mb
													</p>
													<input
														hidden
														type="file"
														ref={inputRef}
														disabled={isPending}
														onChange={handleImageChange}
														accept=".jpg, .jpeg, .png, .svg"
													/>
													{field.value ? (
														<Button
															size="xs"
															type="button"
															variant="destructive"
															className="w-fit mt-2"
															disabled={isPending}
															onClick={() => {
																field.onChange(null);
																if (inputRef.current)
																	inputRef.current.value = "";
																console.log("Значок удален", form.getValues());
															}}
														>
															Удалить значок
														</Button>
													) : (
														<Button
															size="xs"
															type="button"
															variant="teritary"
															className="w-fit mt-2"
															disabled={isPending}
															onClick={() => inputRef.current?.click()}
														>
															Значок загрузки
														</Button>
													)}
												</div>
											</div>
										</div>
									)}
								/>
							</div>
							<DottedSeparator className="py-7" />
							<div className="flex items-center justify-between">
								<Button
									type="button"
									size="lg"
									variant="secondary"
									onClick={onCancel}
									disabled={isPending}
									className={cn(!onCancel && "invisible")}
								>
									Отменить
								</Button>
								<Button disabled={isPending} type="submit" size="lg">
								Сохранить изменения
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
			<Card className="size-full border-none shadow-none">
				<CardContent className="p-7">
					<div className="flex flex-col">
						<h3 className="font-bold">Пригласить участников</h3>
						<p className="text-sm text-muted-foreground">
						Используйте ссылку пригласить, чтобы добавить участников в свое рабочее пространство
						</p>
						<div className="mt-4">
							<div className="flex items-center gap-x-2">
								<Input value={absoluteInviteLink} readOnly />
								<Button
									onClick={() => {
										navigator.clipboard
											.writeText(absoluteInviteLink)
											.then(() => toast.success("Copied to clipboard"));
									}}
									variant="secondary"
									className="size-12"
								>
									<CopyIcon className="size-5" />
								</Button>
							</div>
						</div>
						<DottedSeparator className="py-7" />
						<Button
							className="mt-6 w-fit ml-auto"
							size="sm"
							variant="destructive"
							disabled={isPending || resetingInviteCode}
							onClick={handleResetInviteCode}
						>
							Сбросить ссылку для приглашения
						</Button>
					</div>
				</CardContent>
			</Card>
			<Card className="size-full border-none shadow-none">
				<CardContent className="p-7">
					<div className="flex flex-col">
						<h3 className="font-bold">Опасная зона</h3>
						<p className="text-sm text-muted-foreground">
						Удаление рабочей области является необратимым и приведет к удалению всех
						связанных данных
						</p>
						<DottedSeparator className="py-7" />
						<Button
							className="mt-6 w-fit ml-auto"
							size="sm"
							variant="destructive"
							disabled={isPending || deletingWorkspace}
							onClick={handleDelete}
						>
							Удалить рабочее пространство
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
