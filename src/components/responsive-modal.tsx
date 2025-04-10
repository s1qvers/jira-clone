import { PropsWithChildren } from "react";
import { useMedia } from "react-use";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Drawer, DrawerContent } from "./ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const ResponsiveModal = ({
	open,
	children,
	onOpenChange,
}: PropsWithChildren<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
}>) => {
	const isDesktop = useMedia("(min-width: 1024px)", true);
	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="w-full sm:max-w-lg p-0 border-none overflow-y-auto hide-scrollbar max-h-[85vh]">
					<VisuallyHidden>
						<DialogTitle>Модальное окно</DialogTitle>
						<DialogDescription>Содержимое модального окна</DialogDescription>
					</VisuallyHidden>
					{children}
				</DialogContent>
			</Dialog>
		);
	}
	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<div className="overflow-y-auto hide-scrollbar max-h-[85vh]">
					{children}
				</div>
			</DrawerContent>
		</Drawer>
	);
};
