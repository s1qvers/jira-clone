"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import React from "react";

const ErrorPage = () => {
	return (
		<div className="h-screen flex items-center justify-center flex-col gap-y-4">
			<AlertTriangle className="size-6 text-muted-foreground" />
			<p className="text-sm text-muted-foreground">Что-то пошло не так</p>
			<Button variant="secondary" size="sm">
				<Link href="/">Возвращаюсь домой</Link>
			</Button>
		</div>
	);
};

export default ErrorPage;
