"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";

import { useCreateProject } from "../api/use-create-project";
import { type CreateProjectSchema, createProjectSchema } from "../schemas";

interface CreateProjectFormProps {
	onCancel?: () => void;
}

// Константы для хранения данных в localStorage
const CREATED_PROJECT_ID_KEY = "jira_clone_last_created_project";
const CREATED_PROJECT_WORKSPACE_ID_KEY = "jira_clone_last_created_project_workspace";

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProps) => {
	const workspaceId = useWorkspaceId();
	const router = useRouter();
	const { mutate, isPending } = useCreateProject();
	const inputRef = useRef<HTMLInputElement>(null);
	const [imgError, setImgError] = useState(false);
	const [isRedirecting, setIsRedirecting] = useState(false);
	
	// При загрузке компонента проверяем, есть ли сохраненный ID проекта
	useEffect(() => {
		const lastCreatedProjectId = localStorage.getItem(CREATED_PROJECT_ID_KEY);
		const lastCreatedProjectWorkspaceId = localStorage.getItem(CREATED_PROJECT_WORKSPACE_ID_KEY);
		
		// Если есть сохраненный ID проекта и ID рабочего пространства
		if (lastCreatedProjectId && lastCreatedProjectWorkspaceId) {
			// Удаляем данные из localStorage
			localStorage.removeItem(CREATED_PROJECT_ID_KEY);
			localStorage.removeItem(CREATED_PROJECT_WORKSPACE_ID_KEY);
			
			console.log("Обнаружен ID последнего созданного проекта:", {
				projectId: lastCreatedProjectId,
				workspaceId: lastCreatedProjectWorkspaceId
			});
			
			// Перенаправляем на страницу проекта
			router.push(`/workspaces/${lastCreatedProjectWorkspaceId}/projects/${lastCreatedProjectId}`);
		}
	}, [router]);
	
	const form = useForm<CreateProjectSchema>({
		resolver: zodResolver(createProjectSchema.omit({ workspaceId: true })),
		defaultValues: {
			name: "",
			image: "",
		},
	});
	const onSumit = (values: CreateProjectSchema) => {
		if (!workspaceId) {
			console.error("workspaceId is null, cannot create project");
			return;
		}
		
		const finalValues = {
			...values,
			image: values.image instanceof File ? values.image : "",
			workspaceId,
		};
		
		console.log("Создание проекта с данными:", {
			name: finalValues.name,
			hasImage: Boolean(finalValues.image),
			workspaceId
		});
		
		mutate(
			{ 
				form: finalValues,
				param: { workspaceId }
			},
			{
				onSuccess: ({ data }) => {
					console.log("Проект успешно создан:", data);
					form.reset();
					// Устанавливаем флаг редиректа
					setIsRedirecting(true);
					
					// Сохраняем ID созданного проекта и ID рабочего пространства в localStorage
					const projectId = data.$id || data.id;
					localStorage.setItem(CREATED_PROJECT_ID_KEY, projectId);
					localStorage.setItem(CREATED_PROJECT_WORKSPACE_ID_KEY, workspaceId);
					
					console.log("ID проекта сохранен в localStorage:", {
						projectId,
						workspaceId
					});
					
					// Принудительно полностью перезагружаем страницу
					setTimeout(() => {
						console.log("Выполняем полную перезагрузку страницы...");
						window.location.href = window.location.origin;
					}, 1500);
				},
				onError: (error) => {
					console.error("Ошибка при создании проекта:", error);
				}
			}
		);
	};
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			form.setValue("image", file);
			setImgError(false); // Сбрасываем флаг ошибки при новой загрузке
		}
	};

	return (
		<Card className="size-full border-none shadow-none">
			<CardHeader className="flex p-7">
				<CardTitle className="text-xl font-bold">Создать новый проект</CardTitle>
			</CardHeader>
			<div className="px-7">
				<DottedSeparator />
			</div>
			<CardContent className="p-7">
				{isRedirecting ? (
					<div className="flex flex-col items-center justify-center py-8">
						<p className="text-lg mb-4">Создание проекта...</p>
						<div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSumit)}>
							<div className="flex flex-col gap-y-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Название проекта</FormLabel>
											<FormControl>
												<Input {...field} placeholder="Введите название проекта" />
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
												{field.value && !imgError ? (
													<div className="size-[80px] relative rounded-md overflow-hidden">
														<Image
															fill
															src={
																field.value instanceof File
																	? URL.createObjectURL(field.value)
																	: field.value
															}
															alt="Project Icon"
															className="object-cover"
															onError={() => setImgError(true)}
														/>
													</div>
												) : (
													<Avatar className="size-[80px]">
														<AvatarFallback>
															<ImageIcon className="size-[36px] text-neutral-400" />
														</AvatarFallback>
													</Avatar>
												)}
												<div className="flex flex-col">
													<p className="text-sm">Значок проекта</p>
													<p className="text-sm text-muted-foreground">
														JPEG, PNG, SVG, или JPEG, максимум 5 mb
													</p>
													<input
														hidden
														type="file"
														ref={inputRef}
														disabled={isPending}
														onChange={handleImageChange}
														accept=".jpg, .jpeg, .png, .svg"
													/>
													{field.value && !imgError ? (
														<Button
															size="xs"
															type="button"
															variant="destructive"
															className="w-fit mt-2"
															disabled={isPending}
															onClick={() => {
																field.onChange(null);
																setImgError(false);
																if (inputRef.current) inputRef.current.value = "";
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
								Создать проект
								</Button>
							</div>
						</form>
					</Form>
				)}
			</CardContent>
		</Card>
	);
};
