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
		<Card className="size-full md:w-[487px] border-none shadow-none">
			<CardHeader className="flexx items-center justify-center text-center p-7">
				<CardTitle className="text-2xl">Зарегистрироваться</CardTitle>
				<CardDescription>
				Регистрируясь, вы соглашаетесь с нашими{" "}
					<Link href="/privacy">
						<span className="text-blue-700">Политика конфиденциальности</span>
					</Link>{" "}
					и{" "}
					<Link href="/terms">
						<span className="text-blue-700">условия</span>
					</Link>
				</CardDescription>
			</CardHeader>
			<div className="px-7">
				<DottedSeparator />
			</div>
			<CardContent className="p-7">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							name="name"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											{...field}
											type="text"
											placeholder="Введите свое имя"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="email"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											{...field}
											type="email"
											placeholder="Введите адрес электронной почты"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="password"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											{...field}
											type="password"
											placeholder="Введите ваш пароль"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button className="w-full" size="lg" disabled={isPending}>
						Зарегистрироваться
						</Button>
					</form>
				</Form>
			</CardContent>
			<div className="px-7">
				<DottedSeparator />
			</div>
			<CardContent className="p-7 flex items-center justify-center">
				<p>
				Уже есть аккаунт?
					<Link href="/sign-in">
						<span className="text-blue-700">&nbsp;Войти</span>
					</Link>
				</p>
			</CardContent>
		</Card>
	);
};
