import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";

interface ProjectAvatarProps {
	image?: string | null;
	name: string;
	className?: string;
	fallbackClassName?: string;
}

// Функция для проверки валидности URL изображения
function isValidImageUrl(url: string | null | undefined): boolean {
	if (!url || typeof url !== 'string' || url.trim() === "") return false;
	return url.startsWith('/uploads/') || url.startsWith('/placeholder') || url.startsWith('http');
}

export const ProjectAvatar = ({
	name,
	className,
	image,
	fallbackClassName,
}: ProjectAvatarProps) => {
	const [imgError, setImgError] = useState(false);
	const [loading, setLoading] = useState(true);
	
	// Сбрасываем ошибку и статус загрузки при изменении URL изображения
	useEffect(() => {
		if (image) {
			setImgError(false);
			setLoading(true);
		}
	}, [image]);
	
	// Логируем для отладки
	useEffect(() => {
		console.log(`ProjectAvatar for "${name}":`, { 
			image, 
			imgError, 
			hasValidImage: image && !imgError && isValidImageUrl(image),
			imageType: typeof image
		});
	}, [name, image, imgError]);
	
	// Проверяем, что изображение действительно существует и не пустая строка
	const hasValidImage = image && !imgError && isValidImageUrl(image);
	
	return (
		<Avatar className={cn("size-10 rounded-md overflow-hidden", className)}>
			{hasValidImage ? (
				<div className="h-full w-full relative">
					<Image 
						src={image} 
						alt={`${name} project icon`}
						fill
						priority={true}
						className={cn(
							"object-cover",
							loading && "animate-pulse bg-neutral-200"
						)}
						onError={(e) => {
							console.error(`Ошибка загрузки изображения для проекта ${name}:`, image);
							setImgError(true);
							setLoading(false);
						}}
						onLoad={() => {
							console.log(`Изображение для проекта ${name} успешно загружено`);
							setLoading(false);
						}}
					/>
				</div>
			) : (
				<AvatarFallback
					className={cn("text-white bg-blue-600 rounded-md font-semibold", fallbackClassName)}
				>
					{name?.[0] || "?"}
				</AvatarFallback>
			)}
		</Avatar>
	);
};
