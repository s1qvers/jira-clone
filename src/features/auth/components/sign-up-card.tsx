"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type RegisterSchema, registerSchema } from "../schemas";
import { useRegister } from "../api/use-register";

export const SignUpCard = () => {
	const { mutate, isPending } = useRegister();
	const form = useForm<RegisterSchema>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	const onSubmit = (values: RegisterSchema) => {
		mutate({ json: values });
	};
	
	return (
		<Card className="w-full md:w-[487px] border-none shadow-lg bg-gradient-to-b from-blue-600 to-blue-800 text-white">
			<CardHeader className="flex items-center justify-center text-center p-7">
				<CardTitle className="text-xl font-bold">🔒 Аутентификация</CardTitle>
				<CardDescription className="text-blue-100 mt-2">
					Регистрируясь, вы соглашаетесь с нашими{" "}
					<Link href="/privacy">
						<span className="text-blue-200 hover:text-white">Политикой конфиденциальности</span>
					</Link>{" "}
					и{" "}
					<Link href="/terms">
						<span className="text-blue-200 hover:text-white">Условиями</span>
					</Link>
				</CardDescription>
			</CardHeader>
			<div className="px-7">
				<DottedSeparator className="border-blue-300/30" />
			</div>
			<CardContent className="p-7">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							name="name"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-blue-100">Имя</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="text"
											placeholder="Введите свое имя"
											className="bg-blue-700/40 border-blue-500 text-white placeholder:text-blue-300"
										/>
									</FormControl>
									<FormMessage className="text-red-300" />
								</FormItem>
							)}
						/>
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
									<FormLabel className="text-blue-100">Пароль</FormLabel>
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
							Зарегистрироваться
						</Button>
					</form>
				</Form>
				
				<div className="relative flex items-center justify-center mt-6 mb-3">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-blue-500/30"></span>
					</div>
					<span className="relative px-2 text-xs text-blue-200 bg-gradient-to-b from-blue-600 to-blue-800">или продолжить с</span>
				</div>
				
				<Button 
					className="w-full mt-3 bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center" 
					type="button" 
					variant="outline"
				>
					<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
						<path d="M6.52 13.92h3.08l-.92-3.467-2.16 3.467z" fill="#34A853"/>
						<path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133l3.107 2.42c1.84-1.76 2.907-4.347 2.907-7.387 0-.76-.053-1.467-.173-2.053H12.48z" fill="#FBBC05"/>
						<path d="M5.907 14.32l-3.2 2.453C3.6 18.44 6.573 20 12.48 20c3.573 0 6.267-1.173 8.373-3.36l-3.107-2.427c-1.147 1.147-2.933 2.4-6.053 2.4-3.36 0-6.267-2.32-7.293-5.4h-.4z" fill="#EA4335"/>
					</svg>
					Регистрация с Google
				</Button>
			</CardContent>
			<div className="px-7">
				<DottedSeparator className="border-blue-300/30" />
			</div>
			<CardContent className="p-7 flex items-center justify-center">
				<p className="text-blue-100">
					Уже есть аккаунт?
					<Link href="/sign-in">
						<span className="text-blue-200 hover:text-white font-medium">&nbsp;Войти</span>
					</Link>
				</p>
			</CardContent>
		</Card>
	);
};
