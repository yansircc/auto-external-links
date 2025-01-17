import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background/50 p-4">
      <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">查看你的邮箱</h1>
          <p className="text-base text-muted-foreground">
            我们已经发送了一个登录链接到你的邮箱
          </p>
        </div>

        <Alert className="border-2">
          <Mail className="h-5 w-5 text-primary" />
          <AlertDescription className="ml-2 text-sm">
            点击邮件中的链接即可登录。如果没有收到邮件，请检查垃圾邮件文件夹。
          </AlertDescription>
        </Alert>

        <Button
          variant="outline"
          asChild
          className="w-full transition-colors hover:bg-secondary"
        >
          <a href="/login">返回登录页面</a>
        </Button>
      </div>
    </div>
  );
}
