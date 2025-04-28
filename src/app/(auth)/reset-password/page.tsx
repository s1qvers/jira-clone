import { redirect } from "next/navigation";

import { ResetPasswordCard } from "@/features/auth/components/reset-password-card";
import { getCurrent } from "@/features/auth/queries";

const ResetPasswordPage = async () => {
	const user = await getCurrent();
	if (user) redirect("/");

	return <ResetPasswordCard />;
};

export default ResetPasswordPage; 