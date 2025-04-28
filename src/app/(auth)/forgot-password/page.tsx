import { redirect } from "next/navigation";

import { ForgotPasswordCard } from "@/features/auth/components/forgot-password-card";
import { getCurrent } from "@/features/auth/queries";

const ForgotPasswordPage = async () => {
	const user = await getCurrent();
	if (user) redirect("/");

	return <ForgotPasswordCard />;
};

export default ForgotPasswordPage; 