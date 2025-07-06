"use client";

import { AnimatePresence } from "framer-motion";
import { Brain, Link2, Sparkles, Wand2 } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useKeywordEditorStore } from "@/stores/keyword-editor";
import type { EditorMessages } from "./core/messages";
import { EditorForm } from "./editor-form";
import { KeywordPreview } from "./keyword-preview";
import { LinkedContent } from "./linked-content";

interface EditorProps {
	messages: EditorMessages;
	onSubmit: (data: { text: string }) => Promise<void>;
}

export function KeywordEditor({ messages, onSubmit }: EditorProps) {
	const { mode } = useKeywordEditorStore();

	return (
		<div className="space-y-6">
			{/* Marketing Header */}
			<div className="space-y-2 text-center">
				<div className="flex items-center justify-center gap-2 text-primary">
					<Sparkles className="h-5 w-5" />
					<h2 className="font-semibold text-lg">{messages.header.title}</h2>
				</div>
				<p className="text-muted-foreground text-sm">
					{messages.header.description}
				</p>
			</div>

			{/* Editor Container */}
			<Card>
				<CardHeader>
					<CardTitle>{messages.form.title}</CardTitle>
					<CardDescription>
						{mode === "editing"
							? messages.form.description
							: mode === "linked"
								? messages.linkedContent.description
								: messages.preview.description}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AnimatePresence mode="wait">
						{mode === "editing" ? (
							<EditorForm
								key="form"
								messages={messages.form}
								onSubmit={onSubmit}
							/>
						) : mode === "linked" ? (
							<LinkedContent key="linked" messages={messages.linkedContent} />
						) : (
							<KeywordPreview key="preview" messages={messages.preview} />
						)}
					</AnimatePresence>
				</CardContent>
			</Card>

			{/* Features List */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Card className="border-none bg-muted/50 shadow-none">
					<CardHeader className="space-y-1 pb-2">
						<div className="flex items-center gap-2">
							<div className="rounded-md bg-primary/10 p-1">
								<Brain className="h-4 w-4 text-primary" />
							</div>
							<CardTitle className="font-medium text-sm">
								{messages.features.ai.title}
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-2 text-muted-foreground text-xs">
						<p>{messages.features.ai.description}</p>
					</CardContent>
				</Card>

				<Card className="border-none bg-muted/50 shadow-none">
					<CardHeader className="space-y-1 pb-2">
						<div className="flex items-center gap-2">
							<div className="rounded-md bg-primary/10 p-1">
								<Link2 className="h-4 w-4 text-primary" />
							</div>
							<CardTitle className="font-medium text-sm">
								{messages.features.links.title}
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-2 text-muted-foreground text-xs">
						<p>{messages.features.links.description}</p>
					</CardContent>
				</Card>

				<Card className="border-none bg-muted/50 shadow-none">
					<CardHeader className="space-y-1 pb-2">
						<div className="flex items-center gap-2">
							<div className="rounded-md bg-primary/10 p-1">
								<Wand2 className="h-4 w-4 text-primary" />
							</div>
							<CardTitle className="font-medium text-sm">
								{messages.features.optimization.title}
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-2 text-muted-foreground text-xs">
						<p>{messages.features.optimization.description}</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
