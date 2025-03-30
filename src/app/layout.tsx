import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { getLocale, getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "外链优化",
	description: "AI驱动的文章外链优化工具",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const locale = await getLocale();

	const messages = await getMessages();
	return (
		<html lang={locale} suppressHydrationWarning>
			<body
				className={cn(
					inter.className,
					"min-h-screen bg-background antialiased",
				)}
			>
				<Providers messages={messages} locale={locale}>
					<div className="relative flex min-h-screen flex-col">
						<div className="container mx-auto">{children}</div>
						<Toaster />
					</div>
				</Providers>
			</body>
		</html>
	);
}
