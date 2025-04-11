import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const generateInviteCode = (length: number) => {
	const charecters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	let inviteCode = "";

	for (let i = 0; i < length; i++) {
		inviteCode += charecters.charAt(
			Math.floor(Math.random() * charecters.length)
		);
	}
	return inviteCode;
};

export const INVITECODE_LENGTH = 6;

export function snakeCaseToTitleCase(s: string): string {
	// Переводим статусы задач на русский
	const translations: Record<string, string> = {
		"BACKLOG": "Бэклог",
		"TODO": "К выполнению",
		"IN_PROGRESS": "В процессе",
		"IN_REVIEW": "На проверке",
		"DONE": "Выполнено"
	};
	
	// Если есть прямой перевод, используем его
	if (translations[s]) {
		return translations[s];
	}
	
	// Иначе используем стандартное форматирование
	return s
		.replace(/_/g, " ")
		.toLowerCase()
		.replace(/\b\w/g, (char) => char.toUpperCase());
}
