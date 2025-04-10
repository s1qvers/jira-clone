"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { toast } from "sonner";

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
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import {
	UpdateTaskSchema,
	updateTaskSchema,
} from "@/features/tasks/schemas";

import { TaskStatus, Task } from "../types";
import { useUpdateTask } from "../api/use-update-task";

interface EditTaskFormProps {
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
	initialValues: Task;
}

export const EditTaskForm = ({
	onCancel,
	memberOptions,
	projectOptions,
	initialValues,
}: EditTaskFormProps) => {
	const { mutate, isPending } = useUpdateTask();
	
	// Проверяем, есть ли текущий исполнитель в списке доступных
	const isAssigneeValid = initialValues.assigneeId && 
		memberOptions.some(member => member.id === initialValues.assigneeId);
	
	const form = useForm<UpdateTaskSchema>({
		resolver: zodResolver(updateTaskSchema),
		defaultValues: {
			name: initialValues.name,
			status: initialValues.status,
			assigneeId: isAssigneeValid ? initialValues.assigneeId : undefined,
			projectId: initialValues.projectId,
			dueDate: initialValues.dueDate
				? new Date(initialValues.dueDate)
				: undefined,
		},
	});
	const onSubmit = (values: UpdateTaskSchema) => {
		try {
			// Очищаем пустые значения, чтобы не отправлять их на сервер
			const cleanValues = Object.fromEntries(
				Object.entries(values).filter(([_, value]) => value !== undefined && value !== "")
			) as UpdateTaskSchema;
			
			// Проверяем assigneeId - если выбранного исполнителя нет в списке доступных, удаляем это поле
			if (cleanValues.assigneeId && !memberOptions.some(member => member.id === cleanValues.assigneeId)) {
				console.log("Исполнитель не найден в списке доступных участников, удаляем поле assigneeId");
				toast.warning("Выбранный исполнитель недоступен. Пожалуйста, выберите другого исполнителя.");
				delete cleanValues.assigneeId;
			}
			
			// Добавляем минимально необходимые поля
			if (!cleanValues.name) {
				cleanValues.name = initialValues.name;
			}
			
			// Проверяем, есть ли реальные изменения в задаче
			const hasChanges = Object.keys(cleanValues).some(key => {
				// @ts-ignore - динамический доступ к полям
				const initialValue = initialValues[key];
				// @ts-ignore
				const newValue = cleanValues[key];
				
				if (key === 'dueDate' && initialValue && newValue) {
					// Сравниваем даты, преобразуя их в строки
					return new Date(initialValue).toISOString() !== new Date(newValue).toISOString();
				}
				
				return initialValue !== newValue;
			});
			
			// Если нет изменений, выводим сообщение и не делаем запрос
			if (!hasChanges) {
				console.log("Нет изменений в задаче, запрос не будет отправлен");
				toast.info("Изменений не обнаружено");
				onCancel?.();
				return;
			}
			
			console.log("Отправка данных для обновления задачи:", cleanValues);
			
			mutate(
				{ json: cleanValues, param: { taskId: initialValues.id } },
				{
					onSuccess: () => {
						form.reset();
						onCancel?.();
					},
					onError: (err) => {
						console.error("Ошибка при отправке формы:", err);
						toast.error("Не удалось обновить задачу: " + err.message);
					}
				}
			);
		} catch (err) {
			console.error("Ошибка в onSubmit:", err);
			toast.error("Произошла ошибка при обработке формы");
		}
	};

	return (
		<Card className="size-full border-none shadow-none">
			<CardHeader className="flex p-7">
				<CardTitle className="text-xl font-bold">Редактировать задачу</CardTitle>
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
											</SelectContent>
										</Select>
										<FormMessage />
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
											</SelectContent>
										</Select>
										<FormMessage />
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
											onValueChange={field.onChange}
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
											</SelectContent>
										</Select>
										<FormMessage />
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
								Сохранить изменения
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};
