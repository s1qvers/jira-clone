"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

import { type ForgotPasswordSchema, forgotPasswordSchema } from "../schemas";
import { useForgotPassword } from "../api/use-forgot-password";
import { useState } from "react";

export const ForgotPasswordCard = () => {
	const { mutate, isPending } = useForgotPassword();
	const [isSubmitted, setIsSubmitted] = useState(false);
	
	const form = useForm<ForgotPasswordSchema>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = (values: ForgotPasswordSchema) => {
		console.log("Отправка запроса на восстановление пароля:", values.email);
		
		mutate(
			{ json: values },
			{
				onSuccess: (data) => {
					console.log("Успешный запрос на восстановление пароля:", data);
					// Показываем сообщение о debugInfo, если оно есть
					if (data.debugInfo) {
						console.log("Отладочная информация:", data.debugInfo);
						console.log("Токен для восстановления:", data.debugInfo.token);
						console.log("URL для восстановления:", data.debugInfo.url);
					}
					
					setIsSubmitted(true);
				}
			}
		);
	};
	
	return (
		<Card className="w-full md:w-[487px] border-none shadow-lg bg-gradient-to-b from-blue-600 to-blue-800 text-white">
			<CardHeader className="flex items-center justify-center text-center p-7">
				<CardTitle className="text-xl font-bold">🔒 Восстановление пароля</CardTitle>
				<p className="mt-2 text-sm text-blue-100">Введите ваш email для получения инструкций по восстановлению пароля</p>
			</CardHeader>
			<div className="px-7">
				<DottedSeparator className="border-blue-300/30" />
			</div>
			<CardContent className="p-7">
				{isSubmitted ? (
					<div className="text-center py-6">
						<div className="text-3xl mb-4">✉️</div>
						<h3 className="text-xl font-medium mb-2">Проверьте вашу почту</h3>
						<p className="text-blue-100 mb-6">
							Мы отправили инструкции по восстановлению пароля на указанный email.
						</p>
						<p className="text-blue-200 text-sm">
							Не получили письмо? Проверьте папку "Спам" или попробуйте снова через несколько минут.
						</p>
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								name="email"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-blue-100">Электронная почта</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="email"
												placeholder="john.doe@example.com"
												className="bg-blue-700/40 border-blue-500 text-white placeholder:text-blue-300"
											/>
										</FormControl>
										<FormMessage className="text-red-300" />
									</FormItem>
								)}
							/>
							<Button className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-white" size="lg" disabled={isPending}>
								Восстановить пароль
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