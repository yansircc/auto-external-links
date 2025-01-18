import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

/**
 * 认证错误信息映射
 */
const errorMessages: Record<string, string> = {
  Verification: "验证链接无效或已过期",
  AccessDenied: "访问被拒绝",
  Configuration: "服务器配置错误",
  Default: "认证过程中出现错误",
};

interface ErrorPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const errorType = (await searchParams).error ?? "Default";
  const errorMessage = errorMessages[errorType] ?? errorMessages.Default;

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* 错误图标 */}
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>

          {/* 错误标题 */}
          <h1 className="text-2xl font-bold tracking-tight">认证错误</h1>

          {/* 错误信息 */}
          <p className="text-muted-foreground">{errorMessage}</p>

          {/* 操作按钮 */}
          <div className="flex w-full flex-col gap-2 pt-4">
            {errorType === "Verification" && (
              <Button asChild variant="default">
                <Link href="/login">重新发送验证邮件</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
