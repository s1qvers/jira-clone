import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface WorkspaceAvatarProps {
	image?: string;
	name: string;
	className?: string;
}

export const WorkspaceAvatar = ({
	name,
	className,
	image,
}: WorkspaceAvatarProps) => {
	// Всегда используем fallback для надежности
	return (
		<Avatar className={cn("size-10 rounded-md", className)}>
			<AvatarFallback className="text-white bg-blue-600 font-semibold text-lg uppercase rounded-md">
				{name[0]}
			</AvatarFallback>
		</Avatar>
	);
};
