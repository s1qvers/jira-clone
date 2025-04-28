"use client";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { PropsWithChildren } from "react";
import Link from "next/link";

const AuthLayout = ({ children }: PropsWithChildren) => {
	const pathname = usePathname();
	
	return (
		<main className="bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 min-h-screen flex flex-col items-center justify-center">
			<div className="mx-auto max-w-screen-2xl p-4 w-full">
				<nav className="flex items-center justify-center mb-8">
					<Link href="/">
						<div className="w-[60px] h-[60px] relative">
							<Image 
								src="/logo.png" 
								alt="Jira Clone" 
								priority 
								fill
								className="object-contain" 
							/>
						</div>
					</Link>
				</nav>
				<div className="flex flex-col items-center justify-center">
					{children}
				</div>
			</div>
		</main>
	);
};
export default AuthLayout;
