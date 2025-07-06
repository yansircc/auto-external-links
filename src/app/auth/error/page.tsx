import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorPageProps {
	searchParams: Promise<{
		error?: string;
	}>;
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
	const t = await getTranslations("auth.error");
	const errorType = (await searchParams).error ?? "Default";

	/**
	 * 获取错误信息的翻译
	 */
	const getErrorMessage = (type: string) => {
		const key = type.toLowerCase();
		// 如果有对应的翻译键值，使用翻译，否则使用默认错误信息
		return t.has(key) ? t(key) : t("default");
	};

	const errorMessage = getErrorMessage(errorType);

	return (
		<div className="container flex h-screen items-center justify-center">
			<Card className="w-full max-w-md p-6">
				<div className="flex flex-col items-center space-y-4 text-center">
					{/* 错误图标 */}
					<div className="rounded-full bg-red-100 p-3">
						<AlertCircle className="h-6 w-6 text-red-600" />
					</div>

					{/* 错误标题 */}
					<h1 className="font-bold text-2xl tracking-tight">{t("title")}</h1>

					{/* 错误信息 */}
					<p className="text-muted-foreground">{errorMessage}</p>

					{/* 操作按钮 */}
					<div className="flex w-full flex-col gap-2 pt-4">
						{errorType === "Verification" && (
							<Button asChild variant="default">
								<Link href="/login">{t("resend")}</Link>
							</Button>
						)}
						<Button asChild variant="outline">
							<Link href="/">{t("back")}</Link>
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
