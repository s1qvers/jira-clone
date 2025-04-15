import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface WorkspaceAvatarProps {
	image?: string | null;
	name: string;
	className?: string;
}

export const WorkspaceAvatar = ({
	name,
	className,
	image,
}: WorkspaceAvatarProps) => {
	const [imgError, setImgError] = useState(false);
	
	// Логируем полученное изображение для отладки
	console.log(`WorkspaceAvatar for "${name}":`, { image });
	
	// Проверяем, что изображение действительно существует и не пустая строка
	const hasValidImage = image && image.trim() !== "" && !imgError;
	
	return (
		<Avatar className={cn("size-10 rounded-md overflow-hidden", className)}>
			{hasValidImage ? (
				<div className="h-full w-full relative">
					<Image 
						src={image}
						alt={`${name} workspace icon`}
						fill
						className="object-cover"
						onError={() => setImgError(true)}
					/>
				</div>
			) : (
				<AvatarFallback className="text-white bg-blue-600 font-semibold text-lg uppercase rounded-md">
					{name[0]}
				</AvatarFallback>
			)}
		</Avatar>
	);
};
