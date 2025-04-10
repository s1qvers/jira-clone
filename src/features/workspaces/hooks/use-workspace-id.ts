import { useParams } from "next/navigation";

export const useWorkspaceId = () => {
	const params = useParams();
	
	// В Next.js params могут быть строкой, массивом или undefined
	const workspaceId = params?.workspaceId;
	
	if (!workspaceId) {
		return null;
	}
	
	if (Array.isArray(workspaceId)) {
		return workspaceId[0] || null;
	}
	
	return workspaceId as string;
};
