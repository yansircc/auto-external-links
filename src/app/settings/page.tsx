import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { APISettings } from "@/components/settings/api-settings";
import { BlacklistManager } from "@/components/settings/blacklist-manager";
import { getSettingsMessages } from "@/components/settings/messages";
import { PreferredSitesManager } from "@/components/settings/preferred-manager";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
	const t = await getTranslations("settings");
	const messages = await getSettingsMessages();

	return (
		<div className="container mx-auto max-w-5xl px-4 py-8">
			{/* 页面头部 */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">{t("title")}</h1>
					<p className="mt-2 text-muted-foreground">{t("description")}</p>
				</div>
				<Button variant="ghost" asChild>
					<Link href="/">
						<ArrowLeft className="mr-2 h-4 w-4" />
						返回首页
					</Link>
				</Button>
			</div>

			{/* 设置内容 - 使用 Tabs 布局 */}
			<Tabs defaultValue="api" className="space-y-6">
				<TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
					<TabsTrigger value="api">API 设置</TabsTrigger>
					<TabsTrigger value="search">搜索偏好</TabsTrigger>
				</TabsList>

				{/* API 设置标签页 */}
				<TabsContent value="api" className="space-y-6">
					<APISettings />
				</TabsContent>

				{/* 搜索偏好标签页 */}
				<TabsContent value="search" className="space-y-6">
					{/* 偏好站点设置 */}
					<Card>
						<CardHeader>
							<CardTitle>{messages.dialog.preferredTitle}</CardTitle>
							<CardDescription>
								设置优先显示的网站，搜索结果中这些网站会优先展示
							</CardDescription>
						</CardHeader>
						<CardContent>
							<PreferredSitesManager messages={messages.preferred} />
						</CardContent>
					</Card>

					{/* 黑名单设置 */}
					<Card>
						<CardHeader>
							<CardTitle>{messages.dialog.blacklistTitle}</CardTitle>
							<CardDescription>
								设置要屏蔽的网站，这些网站不会出现在搜索结果中
							</CardDescription>
						</CardHeader>
						<CardContent>
							<BlacklistManager messages={messages.blacklist} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
