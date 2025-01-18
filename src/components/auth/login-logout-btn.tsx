import { signOut, auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function LoginLogoutBtn() {
  const session = await auth();
  const t = await getTranslations("auth");

  return session ? (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button variant="ghost" size="sm" className="gap-2">
        {t("logout")}
      </Button>
    </form>
  ) : (
    <Button variant="ghost" size="sm" className="gap-2">
      <Link href="/auth/login">{t("login")}</Link>
    </Button>
  );
}
