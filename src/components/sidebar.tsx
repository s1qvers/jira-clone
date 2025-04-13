import Image from "next/image";
import Link from "next/link";

import { Projects } from "./projects";
import { Navigation } from "./navigation";
import { DottedSeparator } from "./dotted-separator";
import { WorkspaceSwitcher } from "./workspace-switcher";

export const Sidebar = () => {
	return (
		<aside className="h-full bg-neutral-100 p-4 w-full">
			<Link href="/" className="block w-[80px] h-[80px] relative">
				<Image 
					src="/logo.png" 
					alt="Jira Clone" 
					priority 
					fill
					className="object-contain" 
				/>
			</Link>
			<DottedSeparator className="my-4" />
			<WorkspaceSwitcher />
			<DottedSeparator className="my-4" />
			<Navigation />
			<DottedSeparator className="my-4" />
			<Projects />
		</aside>
	);
};
