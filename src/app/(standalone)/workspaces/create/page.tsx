import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { CreateWorkspaceForm } from "@/features/workspaces/components/create-workspace-form";

const CreateWorkspacePage = async ({ searchParams }: { searchParams?: { from?: string } }) => {
	const current = await getCurrent();
	if (!current) {
		console.log("Пользователь не аутентифицирован, перенаправление на /sign-in");
		redirect("/sign-in");
	}
	
	const isFromRegistration = searchParams?.from === 'registration';
	
	return (
		<div className="w-full lg:max-w-xl">
			<CreateWorkspaceForm fromRegistration={isFromRegistration} />
		</div>
	);
};

export default CreateWorkspacePage;
