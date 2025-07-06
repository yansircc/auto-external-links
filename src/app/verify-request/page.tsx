import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default async function VerifyRequestPage() {
	const t = await getTranslations("auth.verifyRequest");

	return (
		<div className="flex min-h-screen items-center justify-center bg-background/50 p-4">
			<div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="font-bold text-2xl tracking-tight">{t("title")}</h1>
					<p className="text-base text-muted-foreground">{t("description")}</p>
				</div>

				<Alert className="border-2">
					<Mail className="h-5 w-5 text-primary" />
					<AlertDescription className="ml-2 text-sm">
						{t("checkSpam")}
					</AlertDescription>
				</Alert>

				<Button
					variant="outline"
					asChild
					className="w-full transition-colors hover:bg-secondary"
				>
					<a href="/login">{t("backToLogin")}</a>
				</Button>
			</div>
		</div>
	);
}
