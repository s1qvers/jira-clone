"use client";

import * as React from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { ru } from 'date-fns/locale';
import { Calendar } from "./ui/calendar";

interface DatePickerProps {
	value: Date | undefined;
	onChange: (date: Date | undefined) => void;
	className?: string;
	placeholder?: string;
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
	({ onChange, value, className, placeholder = "Выберите дату" }, ref) => {
		return (
			<Popover>
				<PopoverTrigger asChild>
					<Button
						ref={ref}
						variant="outline"
						size="lg"
						className={cn(
							"w-full justify-start text-left font-normal px-3",
							!value && "text-muted-foreground",
							className
						)}
					>
						<CalendarIcon className="size-4 mr-2" />
						{value ? format(value, "d MMMM yyyy", { locale: ru }) : <span>{placeholder}</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<Calendar
						mode="single"
						selected={value}
						onSelect={(date) => onChange(date as Date)}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		);
	}
);

DatePicker.displayName = "DatePicker";
