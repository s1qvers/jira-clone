import { getCurrentUser } from "@/lib/auth";

export const getCurrent = async () => {
	try {
		return await getCurrentUser();
	} catch {
		return null;
	}
};
