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

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background/50 p-4">
      <Card className="w-full max-w-[400px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription className="text-base">
            输入邮箱地址，你会收到登录链接。
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
                邮箱地址
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                required
                className="transition-colors focus:ring-2"
              />
            </div>
            <Button
              type="submit"
              className="w-full font-medium transition-colors hover:opacity-90"
            >
              发送登录链接
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
