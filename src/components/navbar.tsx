"use client";
import { usePathname } from "next/navigation";

import { UserButton } from "@/features/auth/components/user-button";

import { MobileSidebar } from "./mobile-sidebar";

const pathnameMap = {
	tasks: {
		title: "Мои задачи",
		description: "Просмотрите все свои задачи здесь",
	},
	projects: {
		title: "Мои проекты",
		description: "Ознакомьтесь с задачами вашего проекта здесь",
	},
};
const defaultMap = {
	title: "Домой",
	description: "Следите за всеми своими проектами и задачами здесь",
};
export const Navbar = () => {
	const pathname = usePathname();
	const parts = pathname.split("/");
	const pathnameKey = parts[3] as keyof typeof pathnameMap;

	const { description, title } = pathnameMap[pathnameKey] || defaultMap;
	return (
		<nav className="pt-4 px-6 flex items-center justify-between">
			<div className="flex-col hidden lg:flex">
				<h1 className="text-2xl font-bold">{title}</h1>
				<p className="text-muted-foreground">{description}</p>
			</div>
			<MobileSidebar />
			<UserButton />
		</nav>
	);
};
