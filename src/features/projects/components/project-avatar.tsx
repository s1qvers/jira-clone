import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
	// Логируем для отладки
	console.log(`ProjectAvatar for "${name}":`, { image });
	
	return (
		<Avatar className={cn("size-10 rounded-md overflow-hidden", className)}>
			{image ? (
				<div className="h-full w-full relative">
					<Image 
						src={image} 
						alt={`${name} project icon`}
						fill
						className="object-cover"
					/>
				</div>
			) : (
				<AvatarFallback
					className={cn("text-white bg-blue-600 rounded-md font-semibold", fallbackClassName)}
				>
					{name[0]}
				</AvatarFallback>
			)}
		</Avatar>
	);
};
