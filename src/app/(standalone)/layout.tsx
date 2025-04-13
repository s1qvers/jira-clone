import { UserButton } from "@/features/auth/components/user-button";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren } from "react";

const StandaloneLayout = ({ children }: PropsWithChildren) => {
	return (
		<main className="min-h-screen bg-neutral-100">
			<div className="mx-auto max-w-screen-2xl p-4">
				<nav className="flex justify-between items-center h-[73px]">
					<Link href="/" className="w-[80px] h-[80px] relative">
						<Image 
							src="/logo.png" 
							alt="Jira Clone" 
							priority 
							fill
							className="object-contain" 
						/>
					</Link>
					<UserButton />
				</nav>
				<div className="flex flex-col items-center justify-center py-4">
					{children}
				</div>
			</div>
		</main>
	);
};

export default StandaloneLayout;
