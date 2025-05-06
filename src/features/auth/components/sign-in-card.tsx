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

import { type LoginSchema, loginSchema } from "../schemas";
import { useLogin } from "../api/use-login";

export const SignInCard = () => {
	const { mutate, isPending } = useLogin();
	const form = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (values: LoginSchema) => {
		mutate({ json: values });
	};
	
	return (
		<Card className="w-full md:w-[487px] border-none shadow-lg bg-gradient-to-b from-blue-600 to-blue-800 text-white">
			<CardHeader className="flex items-center justify-center text-center p-7">
				<CardTitle className="text-xl font-bold">🔒 Аутентификация</CardTitle>
				<p className="mt-2 text-sm text-blue-100">Добро пожаловать</p>
			</CardHeader>
			<div className="px-7">
				<DottedSeparator className="border-blue-300/30" />
			</div>
			<CardContent className="p-7">
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
						<FormField
							name="password"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<div className="flex justify-between items-center">
										<FormLabel className="text-blue-100">Пароль</FormLabel>
										<Link href="/forgot-password" className="text-xs text-blue-200 hover:text-blue-100">
											Забыли пароль?
										</Link>
									</div>
									<FormControl>
										<Input
											{...field}
											type="password"
											placeholder="******"
											className="bg-blue-700/40 border-blue-500 text-white placeholder:text-blue-300"
										/>
									</FormControl>
									<FormMessage className="text-red-300" />
								</FormItem>
							)}
						/>
						<Button className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-white" size="lg" disabled={isPending}>
							Авторизоваться
						</Button>
					</form>
				</Form>
			</CardContent>
			<div className="px-7">
				<DottedSeparator className="border-blue-300/30" />
			</div>
			<CardContent className="p-7 flex items-center justify-center">
				<p className="text-blue-100">
					У вас нет учетной записи?
					<Link href="/sign-up">
						<span className="text-blue-200 hover:text-white font-medium">&nbsp;Зарегистрироваться</span>
					</Link>
				</p>
			</CardContent>
		</Card>
	);
};
