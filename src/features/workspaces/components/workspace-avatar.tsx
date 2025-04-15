import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";

interface WorkspaceAvatarProps {
	image?: string | null;
	name: string;
	className?: string;
}

// Функция для проверки валидности URL изображения
function isValidImageUrl(url: string): boolean {
	return url && url.trim() !== "" && 
		(url.startsWith('/uploads/') || url.startsWith('/placeholder') || url.startsWith('http'));
}

export const WorkspaceAvatar = ({
	name,
	className,
	image,
}: WorkspaceAvatarProps) => {
	const [imgError, setImgError] = useState(false);
	
	// Сбрасываем ошибку при изменении URL изображения
	useEffect(() => {
		setImgError(false);
	}, [image]);
	
	// Логируем полученное изображение для отладки
	console.log(`WorkspaceAvatar for "${name}":`, { 
		image, 
		imgError,
		hasValidImage: image && !imgError && isValidImageUrl(image)
	});
	
	// Проверяем, что изображение действительно существует и не пустая строка
	const hasValidImage = image && !imgError && isValidImageUrl(image);
	
	return (
		<Avatar className={cn("size-10 rounded-md overflow-hidden", className)}>
			{hasValidImage ? (
				<div className="h-full w-full relative">
					<Image 
						src={image}
						alt={`${name} workspace icon`}
						fill
						className="object-cover"
						onError={(e) => {
							console.error(`Ошибка загрузки изображения для ${name}:`, image);
							setImgError(true);
						}}
					/>
				</div>
			) : (
				<AvatarFallback className="text-white bg-blue-600 font-semibold text-lg uppercase rounded-md">
					{name?.[0] || "?"}
				</AvatarFallback>
			)}
		</Avatar>
	);
};
