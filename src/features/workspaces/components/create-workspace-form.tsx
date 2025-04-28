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
import { cn } from "@/lib/utils";

import { useCreateWorkspace } from "../api/use-create-workspace";

import { type CreateWorkspaceSchema, createWorkspaceSchema } from "../schemas";

interface CreateWorkspaceFormProps {
	onCancel?: () => void;
}

// Константа для хранения ID только что созданного рабочего пространства
const CREATED_WORKSPACE_ID_KEY = "jira_clone_last_created_workspace";

export const CreateWorkspaceForm = ({ onCancel }: CreateWorkspaceFormProps) => {
	const router = useRouter();
	const { mutate, isPending } = useCreateWorkspace();
	const inputRef = useRef<HTMLInputElement>(null);
	const [imgError, setImgError] = useState(false);
	const [isRedirecting, setIsRedirecting] = useState(false);
	
	// При загрузке компонента проверяем, есть ли сохраненный ID рабочего пространства
	useEffect(() => {
		// Проверяем, содержит ли URL параметр from=delete, что означает, что мы пришли сюда после удаления рабочего пространства
		const urlParams = new URLSearchParams(window.location.search);
		const fromDelete = urlParams.get('from') === 'delete';
		
		// Если мы пришли сюда после удаления рабочего пространства, не делаем перенаправление
		if (fromDelete) {
			console.log("Страница открыта после удаления рабочего пространства, пропускаем проверку localStorage");
			return;
		}
		
		const lastCreatedWorkspaceId = localStorage.getItem(CREATED_WORKSPACE_ID_KEY);
		if (lastCreatedWorkspaceId) {
			// Если есть - удаляем его из localStorage и перенаправляем на страницу рабочего пространства
			localStorage.removeItem(CREATED_WORKSPACE_ID_KEY);
			console.log("Обнаружен ID последнего созданного рабочего пространства:", lastCreatedWorkspaceId);
			router.push(`/workspaces/${lastCreatedWorkspaceId}`);
		}
	}, [router]);
	
	const form = useForm<CreateWorkspaceSchema>({
		resolver: zodResolver(createWorkspaceSchema),
		defaultValues: {
			name: "",
		},
	});
	const onSumit = (values: CreateWorkspaceSchema) => {
		const finalValues = {
			...values,
			image: values.image instanceof File ? values.image : "",
		};
		
		console.log("Создание рабочего пространства с данными:", {
			name: finalValues.name,
			hasImage: Boolean(finalValues.image),
			imageType: finalValues.image instanceof File ? "File" : typeof finalValues.image,
			imageSize: finalValues.image instanceof File ? finalValues.image.size : null
		});
		
		mutate(
			{ form: finalValues },
			{
				onSuccess: ({ data }) => {
					console.log("Рабочее пространство создано:", data);
					form.reset();
					// Устанавливаем флаг редиректа
					setIsRedirecting(true);
					
					// Сохраняем ID созданного рабочего пространства в localStorage
					localStorage.setItem(CREATED_WORKSPACE_ID_KEY, data.$id || data.id);
					
					console.log("ID рабочего пространства сохранен в localStorage:", data.$id || data.id);
					
					// Принудительно полностью перезагружаем страницу
					setTimeout(() => {
						console.log("Выполняем полную перезагрузку страницы...");
						window.location.href = window.location.origin;
					}, 1500);
				},
				onError: (error) => {
					console.error("Ошибка при создании рабочего пространства:", error);
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
				<CardTitle className="text-xl font-bold">
				Создайте новое рабочее пространство
				</CardTitle>
			</CardHeader>
			<div className="px-7">
				<DottedSeparator />
			</div>
			<CardContent className="p-7">
				{isRedirecting ? (
					<div className="flex flex-col items-center justify-center py-8">
						<p className="text-lg mb-4">Создание рабочего пространства...</p>
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
												{field.value && !imgError ? (
													<div className="size-[72px] relative rounded-md overflow-hidden">
														<Image
															fill
															src={
																field.value instanceof File
																	? URL.createObjectURL(field.value)
																	: field.value
															}
															alt="Workspace Icon"
															className="object-cover"
															onError={() => setImgError(true)}
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
													<p className="text-sm">Значок рабочего пространства</p>
													<p className="text-sm text-muted-foreground">
														JPEG, PNG, SVG, или JPEG, максимум 10 mb
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
									Отменить
								</Button>
								<Button disabled={isPending} type="submit" size="lg">
								Создание рабочего пространства
								</Button>
							</div>
						</form>
					</Form>
				)}
			</CardContent>
		</Card>
	);
};
