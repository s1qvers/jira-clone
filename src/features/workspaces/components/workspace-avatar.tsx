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
function isValidImageUrl(url: string | null | undefined): boolean {
	if (!url || typeof url !== 'string' || url.trim() === "") return false;
	return url.startsWith('/uploads/') || url.startsWith('/placeholder') || url.startsWith('http');
}

export const WorkspaceAvatar = ({
	name,
	className,
	image,
}: WorkspaceAvatarProps) => {
	const [imgError, setImgError] = useState(false);
	const [loading, setLoading] = useState(true);
	
	// Сбрасываем ошибку при изменении URL изображения
	useEffect(() => {
		if (image) {
			setImgError(false);
			setLoading(true);
		}
	}, [image]);
	
	// Проверяем, что изображение действительно существует и не пустая строка
	const hasValidImage = image && !imgError && isValidImageUrl(image);
	
	// Логируем полученное изображение для отладки
	useEffect(() => {
		console.log(`WorkspaceAvatar for "${name}":`, { 
			image, 
			imgError,
			hasValidImage,
			imageType: typeof image
		});
	}, [name, image, imgError, hasValidImage]);
	
	return (
		<Avatar className={cn("size-10 rounded-md overflow-hidden", className)}>
			{hasValidImage ? (
				<div className="h-full w-full relative">
					<Image 
						src={image}
						alt={`${name} workspace icon`}
						fill
						className={cn(
							"object-cover",
							loading && "animate-pulse bg-neutral-200"
						)}
						onError={(e) => {
							console.error(`Ошибка загрузки изображения для ${name}:`, image);
							setImgError(true);
							setLoading(false);
						}}
						onLoad={() => {
							console.log(`Изображение для ${name} успешно загружено`);
							setLoading(false);
						}}
						priority={true} // Приоритетная загрузка аватара
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
