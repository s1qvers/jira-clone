"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

import { type ResetPasswordSchema, resetPasswordSchema } from "../schemas";
import { useResetPassword } from "../api/use-reset-password";

export const ResetPasswordCard = () => {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [isSuccess, setIsSuccess] = useState(false);

	const { mutate, isPending } = useResetPassword();
	
	const form = useForm<ResetPasswordSchema>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			token: token || "",
			password: "",
		},
	});

	// Обновляем token в форме, если он изменился в URL
	useEffect(() => {
		if (token) {
			form.setValue("token", token);
		}
	}, [token, form]);

	const onSubmit = (values: ResetPasswordSchema) => {
		mutate(
			{ json: values },
			{
				onSuccess: () => {
					setIsSuccess(true);
				}
			}
		);
	};
	
	// Если токен отсутствует, показываем сообщение об ошибке
	if (!token) {
		return (
			<Card className="w-full md:w-[487px] border-none shadow-lg bg-gradient-to-b from-blue-600 to-blue-800 text-white">
				<CardHeader className="flex items-center justify-center text-center p-7">
					<CardTitle className="text-xl font-bold">🔒 Сброс пароля</CardTitle>
					<p className="mt-2 text-sm text-blue-100">Ошибка: отсутствует токен сброса пароля</p>
				</CardHeader>
				<div className="px-7">
					<DottedSeparator className="border-blue-300/30" />
				</div>
				<CardContent className="p-7 text-center">
					<div className="text-3xl mb-4">❌</div>
					<h3 className="text-xl font-medium mb-4">Неверная ссылка для сброса пароля</h3>
					<p className="text-blue-100 mb-6">
						Ссылка для сброса пароля недействительна или срок ее действия истек.
					</p>
					<Button 
						className="bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-white" 
						asChild
					>
						<Link href="/forgot-password">Запросить новую ссылку</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}
	
	return (
		<Card className="w-full md:w-[487px] border-none shadow-lg bg-gradient-to-b from-blue-600 to-blue-800 text-white">
			<CardHeader className="flex items-center justify-center text-center p-7">
				<CardTitle className="text-xl font-bold">🔒 Сброс пароля</CardTitle>
				<p className="mt-2 text-sm text-blue-100">Введите новый пароль</p>
			</CardHeader>
			<div className="px-7">
				<DottedSeparator className="border-blue-300/30" />
			</div>
			<CardContent className="p-7">
				{isSuccess ? (
					<div className="text-center py-6">
						<div className="text-3xl mb-4">✅</div>
						<h3 className="text-xl font-medium mb-2">Пароль успешно изменен</h3>
						<p className="text-blue-100 mb-6">
							Ваш пароль был успешно изменен. Сейчас вы будете перенаправлены на страницу входа.
						</p>
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								name="password"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-blue-100">Новый пароль</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="password"
												placeholder="Введите новый пароль"
												className="bg-blue-700/40 border-blue-500 text-white placeholder:text-blue-300"
											/>
										</FormControl>
										<FormMessage className="text-red-300" />
									</FormItem>
								)}
							/>
							<Button className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-white" size="lg" disabled={isPending}>
								Сбросить пароль
							</Button>
						</form>
					</Form>
				)}
			</CardContent>
			<div className="px-7">
				<DottedSeparator className="border-blue-300/30" />
			</div>
			<CardContent className="p-7 flex items-center justify-center">
				<p className="text-blue-100">
					Вспомнили пароль?
					<Link href="/sign-in">
						<span className="text-blue-200 hover:text-white font-medium">&nbsp;Войти</span>
					</Link>
				</p>
			</CardContent>
		</Card>
	);
}; 