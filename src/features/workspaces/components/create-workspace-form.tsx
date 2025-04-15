"use client";
import { useRef, useState } from "react";
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

export const CreateWorkspaceForm = ({ onCancel }: CreateWorkspaceFormProps) => {
	const router = useRouter();
	const { mutate, isPending } = useCreateWorkspace();
	const inputRef = useRef<HTMLInputElement>(null);
	const [imgError, setImgError] = useState(false);
	
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
			hasImage: Boolean(finalValues.image)
		});
		
		mutate(
			{ form: finalValues },
			{
				onSuccess: ({ data }) => {
					form.reset();
					router.push(`/workspaces/${data.$id}`);
				},
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
												<p className="text-sm">Значок рабочей области</p>
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
								Отменить
							</Button>
							<Button disabled={isPending} type="submit" size="lg">
							Создание рабочего пространства
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};
