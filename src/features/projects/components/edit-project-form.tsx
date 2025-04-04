"use client";
import { useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImageIcon } from "lucide-react";

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

import { type UpdateProjectSchema, updateProjectSchema } from "../schemas";
import { useUpdateProject } from "../api/use-update-project";
import { type Project } from "../types";
import { useDeleteProject } from "../api/use-delete-project";

interface EditProjectFormProps {
	onCancel?: () => void;
	initialValues: Project;
}

export const EditProjectForm = ({
	onCancel,
	initialValues,
}: EditProjectFormProps) => {
	const router = useRouter();
	const { mutate, isPending } = useUpdateProject();
	const { mutate: deleteProject, isPending: deletingProject } =
		useDeleteProject();

	const [DeleteWorkspaceDialog, confirmDelete] = useConfirm(
		"Удалить проект",
		"Вы уверены, что хотите удалить этот проект?",
		"destructive"
	);

	const inputRef = useRef<HTMLInputElement>(null);

	const form = useForm<UpdateProjectSchema>({
		resolver: zodResolver(updateProjectSchema),
		defaultValues: {
			...initialValues,
			image: initialValues.imageUrl ?? "",
		},
	});
	const onSumbit = (values: UpdateProjectSchema) => {
		const finalValues = {
			...values,
			image: values.image instanceof File ? values.image : "",
		};
		mutate({
			form: finalValues,
			param: { projectId: initialValues.$id },
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
		deleteProject(
			{
				param: { projectId: initialValues.$id },
			},
			{
				onSuccess: () => {
					// Hard refresh to clear cache
					window.location.href = `/workspaces/${initialValues.workspaceId}`;
				},
			}
		);
	};

	return (
		<div className="flex flex-col gap-y-4">
			<DeleteWorkspaceDialog />
			<Card className="size-full border-none shadow-none">
				<CardHeader className="flex flex-row items-center gap-x-4 space-y-0">
					<Button
						variant="secondary"
						onClick={
							onCancel
								? onCancel
								: () =>
										router.push(
											`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`
										)
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
											<FormLabel>Название проекта</FormLabel>
											<FormControl>
												<Input {...field} placeholder="Enter project name" />
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
																	: field.value
															}
															alt="Project Icon"
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
													<p className="text-sm">Значок проекта</p>
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
									Отмена
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
						<h3 className="font-bold">Опасная зона</h3>
						<p className="text-sm text-muted-foreground">
						Удаление проекта необратимо и приведет к удалению всех связанных с ним
						данных
						</p>
						<DottedSeparator className="py-7" />
						<Button
							className="mt-6 w-fit ml-auto"
							size="sm"
							variant="destructive"
							disabled={isPending || deletingProject}
							onClick={handleDelete}
						>
							Удалить проект
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
