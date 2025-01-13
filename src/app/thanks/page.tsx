import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ThanksPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                感谢反馈！
              </h1>
              <p className="text-sm text-muted-foreground">
                你的反馈对这个工具非常重要，我会认真考虑每一条建议。
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/" passHref>
            <Button>返回首页</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
