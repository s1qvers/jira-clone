"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
import { DatePicker } from "@/components/date-picker";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import {
	type CreateTaskSchema,
	createTaskSchema,
} from "@/features/tasks/schemas";

import { TaskStatus } from "../types";
import { useCreateTask } from "../api/use-create-task";

interface CreateTaskFormProps {
	onCancel?: () => void;
	projectOptions: {
		id: string;
		name: string;
		imageUrl: string;
	}[];
	memberOptions: {
		id: string;
		name: string;
	}[];
}

export const CreateTaskForm = ({
	onCancel,
	memberOptions,
	projectOptions,
}: CreateTaskFormProps) => {
	const workspaceId = useWorkspaceId();
	const [selectedProjectId, setSelectedProjectId] = useState<string>("");
	const { mutate, isPending } = useCreateTask({ projectId: selectedProjectId });
	
	const form = useForm<CreateTaskSchema>({
		resolver: zodResolver(createTaskSchema.omit({ workspaceId: true })),
		defaultValues: {
			workspaceId: workspaceId || "",
			name: "",
			status: undefined,
			projectId: "",
			assigneeId: "",
			dueDate: undefined,
		},
	});
	
	const onSubmit = (values: CreateTaskSchema) => {
		if (!values.projectId) {
			// Выводим ошибку, если проект не выбран
			form.setError("projectId", {
				type: "manual",
				message: "Выберите проект для задачи"
			});
			return;
		}
		
		if (!workspaceId) {
			toast.error("ID рабочего пространства не указан");
			return;
		}
		
		// Проверяем, что assigneeId установлен, иначе используем текущего пользователя
		// или первого доступного участника из списка
		if (!values.assigneeId && memberOptions.length > 0) {
			console.log("Исполнитель не выбран, используем первого доступного участника");
			values.assigneeId = memberOptions[0].id;
		}
		
		if (!values.status) {
			// Устанавливаем BACKLOG как статус по умолчанию
			values.status = TaskStatus.BACKLOG;
		}
		
		// Для отладки - выводим значения в консоль
		console.log("Отправляемые данные:", {
			projectId: values.projectId,
			assigneeId: values.assigneeId,
			workspaceId,
			name: values.name,
			status: values.status,
			dueDate: values.dueDate
		});
		
		// Устанавливаем projectId для API вызова
		setSelectedProjectId(values.projectId);
		
		mutate(
			{
				param: { projectId: values.projectId },
				json: { ...values, workspaceId }
			},
			{
				onSuccess: () => {
					form.reset();
					onCancel?.();
				},
				onError: (error) => {
					console.error("Ошибка при создании задачи:", error);
					toast.error(error.message || "Не удалось создать задачу");
				}
			}
		);
	};

	return (
		<Card className="size-full border-none shadow-none">
			<CardHeader className="flex p-7">
				<CardTitle className="text-xl font-bold">Создать новую задачу</CardTitle>
			</CardHeader>
			<div className="px-7">
				<DottedSeparator />
			</div>
			<CardContent className="p-7">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="flex flex-col gap-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Имя задачи</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Введите название задачи" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="dueDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Две даты</FormLabel>
										<FormControl>
											<DatePicker {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="assigneeId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Правопреемник</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Выберите ответственного" />
												</SelectTrigger>
											</FormControl>
											<FormMessage />
											<SelectContent>
												{memberOptions.map((member) => (
													<SelectItem key={member.id} value={member.id}>
														<div className="flex items-center gap-x-2">
															<MemberAvatar
																className="size-6"
																name={member.name}
															/>
															{member.name}
														</div>
													</SelectItem>
												))}
												<FormMessage />
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Статус</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Выберите статус" />
												</SelectTrigger>
											</FormControl>
											<FormMessage />
											<SelectContent>
												{Object.entries(TaskStatus).map(([key, value]) => (
													<SelectItem key={value} value={value}>
														{key
															.replace("_", " ")
															.toLowerCase()
															.replace(/\b\w/g, (char) => char.toUpperCase())}
													</SelectItem>
												))}
												<FormMessage />
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="projectId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Проект</FormLabel>
										<Select
											onValueChange={(value) => {
												field.onChange(value);
												setSelectedProjectId(value);
											}}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Выберите проект" />
												</SelectTrigger>
											</FormControl>
											<FormMessage />
											<SelectContent>
												{projectOptions.map((project) => (
													<SelectItem key={project.id} value={project.id}>
														<div className="flex items-center gap-x-2">
															<ProjectAvatar
																image={project.imageUrl}
																className="size-6"
																name={project.name}
															/>
															{project.name}
														</div>
													</SelectItem>
												))}
												<FormMessage />
											</SelectContent>
										</Select>
									</FormItem>
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
							Создать задачу
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};
