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

export const ProjectAvatar = ({
	name,
	className,
	image,
	fallbackClassName,
}: ProjectAvatarProps) => {
	const [imgError, setImgError] = useState(false);
	
	// Сбрасываем ошибку при изменении URL изображения
	useEffect(() => {
		setImgError(false);
	}, [image]);
	
	// Логируем для отладки
	console.log(`ProjectAvatar for "${name}":`, { image, imgError });
	
	// Проверяем, что изображение действительно существует и не пустая строка
	const hasValidImage = image && image.trim() !== "" && !imgError;
	
	return (
		<Avatar className={cn("size-10 rounded-md overflow-hidden", className)}>
			{hasValidImage ? (
				<div className="h-full w-full relative">
					<Image 
						src={image} 
						alt={`${name} project icon`}
						fill
						className="object-cover"
						onError={() => setImgError(true)}
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
