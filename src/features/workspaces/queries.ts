import { getCurrentUser } from "@/lib/auth";
import { getWorkspacesByUserId } from "./service";
import { Prisma } from "@/generated/prisma";

type Workspace = Prisma.WorkspaceGetPayload<{}>;

export const getWorkspaces = async () => {
	const user = await getCurrentUser();
	
	if (!user) {
		return { documents: [], total: 0 };
	}
	
	const workspaces = await getWorkspacesByUserId(user.id);
	
	return {
		documents: workspaces.map((workspace: Workspace) => ({
			...workspace,
			$id: workspace.id, // Для совместимости с прежним кодом
		})),
		total: workspaces.length
	};
};
