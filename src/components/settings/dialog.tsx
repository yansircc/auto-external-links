import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlacklistManager } from "./blacklist-manager";
import { getSettingsMessages } from "./messages";
import { PreferredSitesManager } from "./preferred-manager";

export default async function SettingsDialog() {
	const messages = await getSettingsMessages();

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon">
					<Settings className="h-4 w-4" />
					<span className="sr-only">{messages.dialog.title}</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{messages.dialog.searchTitle}</DialogTitle>
					<DialogDescription>
						{messages.dialog.searchDescription}
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="preferred">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="preferred">
							{messages.dialog.preferredTitle}
						</TabsTrigger>
						<TabsTrigger value="blacklist">
							{messages.dialog.blacklistTitle}
						</TabsTrigger>
					</TabsList>
					<TabsContent value="preferred">
						<PreferredSitesManager messages={messages.preferred} />
					</TabsContent>
					<TabsContent value="blacklist">
						<BlacklistManager messages={messages.blacklist} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
