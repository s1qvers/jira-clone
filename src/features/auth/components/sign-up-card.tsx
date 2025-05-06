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
