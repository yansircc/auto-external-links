import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default async function ThanksPage() {
	const t = await getTranslations("thanks");

	return (
		<div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
			<Card className="w-full max-w-md">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center gap-4 text-center">
						<CheckCircle2 className="h-12 w-12 text-green-500" />
						<div className="space-y-2">
							<h1 className="font-semibold text-2xl tracking-tight">
								{t("title")}
							</h1>
							<p className="text-muted-foreground text-sm">
								{t("description")}
							</p>
						</div>
					</div>
				</CardContent>
				<CardFooter className="justify-center">
					<Link href="/" passHref>
						<Button>{t("backHome")}</Button>
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
