import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FeedbackForm } from "./form";
import { getFeedbackMessages } from "./messages";

export default async function FeedbackDialog() {
	const messages = await getFeedbackMessages();

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon">
					<MessageSquarePlus className="h-5 w-5" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[625px]">
				<DialogHeader>
					<DialogTitle>{messages.title}</DialogTitle>
					<DialogDescription>{messages.description}</DialogDescription>
				</DialogHeader>
				<FeedbackForm messages={messages} />
			</DialogContent>
		</Dialog>
	);
}
