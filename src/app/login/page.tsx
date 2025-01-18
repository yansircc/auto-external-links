import { signIn } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function SignIn() {
  const t = await getTranslations("auth.loginPage");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/50 p-4">
      <Card className="w-full max-w-[400px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
          <CardDescription className="text-base">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              const email = formData.get("email") as string;
              await signIn("plunk", { email, redirect: true });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t("email.label")}
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder={t("email.placeholder")}
                required
                className="transition-colors focus:ring-2"
              />
            </div>
            <Button
              type="submit"
              className="w-full font-medium transition-colors hover:opacity-90"
            >
              {t("email.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
