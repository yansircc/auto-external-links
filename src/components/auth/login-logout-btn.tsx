import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function LoginLogoutBtn() {
	const session = await auth();
	const t = await getTranslations("auth");

	return session ? (
		<Button variant="ghost" size="sm" className="gap-2" asChild>
			<Link href="/api/auth/signout">{t("logout")}</Link>
		</Button>
	) : (
		<Button variant="ghost" size="sm" className="gap-2" asChild>
			<Link href="/login">{t("login")}</Link>
		</Button>
	);
}
