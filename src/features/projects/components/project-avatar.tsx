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
	// Всегда используем fallback для надежности
	return (
		<Avatar className={cn("size-10 rounded-md", className)}>
			<AvatarFallback
				className={cn("text-white bg-blue-600 rounded-md", fallbackClassName)}
			>
				{name[0]}
			</AvatarFallback>
		</Avatar>
	);
};
