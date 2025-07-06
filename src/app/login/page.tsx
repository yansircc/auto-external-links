import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { signInWithEmail } from "@/actions/auth";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default async function SignIn() {
	// 检查用户是否已登录
	const session = await auth();
	if (session?.user) {
		redirect("/");
	}

	const t = await getTranslations("auth.loginPage");

	return (
		<div className="flex min-h-screen items-center justify-center bg-background/50 p-4">
			<Card className="w-full max-w-[400px] shadow-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="font-bold text-2xl">{t("title")}</CardTitle>
					<CardDescription className="text-base">
						{t("description")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<LoginForm
						messages={{
							emailLabel: t("email.label"),
							emailPlaceholder: t("email.placeholder"),
							submitButton: t("email.submit"),
							sendingButton: t("email.sending"),
							successTitle: t("email.successTitle"),
							successDescription: t("email.successDescription"),
							errorTitle: t("email.errorTitle"),
							errorDescription: t("email.errorDescription"),
						}}
						onSubmit={signInWithEmail}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
