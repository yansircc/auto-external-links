"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useKeywordEditorStore } from "@/stores/keyword-editor";
import { AnimatePresence } from "framer-motion";
import { Brain, Link2, Sparkles, Wand2 } from "lucide-react";
import type { EditorMessages } from "./core/messages";
import { EditorForm } from "./editor-form";
import { KeywordPreview } from "./keyword-preview";
import { LinkedContent } from "./linked-content";

interface EditorProps {
	messages: EditorMessages;
	onSubmit: (data: { text: string }) => Promise<void>;
}

export function KeywordEditor({ messages, onSubmit }: EditorProps) {
	const { isEditing, hasLinks } = useKeywordEditorStore();

	return (
		<div className="space-y-6">
			{/* Marketing Header */}
			<div className="space-y-2 text-center">
				<div className="flex items-center justify-center gap-2 text-primary">
					<Sparkles className="h-5 w-5" />
					<h2 className="text-lg font-semibold">{messages.header.title}</h2>
				</div>
				<p className="text-sm text-muted-foreground">
					{messages.header.description}
				</p>
			</div>

			{/* Editor Container */}
			<Card>
				<CardHeader>
					<CardTitle>{messages.form.title}</CardTitle>
					<CardDescription>
						{isEditing
							? messages.form.description
							: hasLinks
								? messages.linkedContent.description
								: messages.preview.description}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AnimatePresence mode="wait">
						{isEditing ? (
							<EditorForm
								key="form"
								messages={messages.form}
								onSubmit={onSubmit}
							/>
						) : hasLinks ? (
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
							<CardTitle className="text-sm font-medium">
								{messages.features.ai.title}
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-2 text-xs text-muted-foreground">
						<p>{messages.features.ai.description}</p>
					</CardContent>
				</Card>

				<Card className="border-none bg-muted/50 shadow-none">
					<CardHeader className="space-y-1 pb-2">
						<div className="flex items-center gap-2">
							<div className="rounded-md bg-primary/10 p-1">
								<Link2 className="h-4 w-4 text-primary" />
							</div>
							<CardTitle className="text-sm font-medium">
								{messages.features.links.title}
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-2 text-xs text-muted-foreground">
						<p>{messages.features.links.description}</p>
					</CardContent>
				</Card>

				<Card className="border-none bg-muted/50 shadow-none">
					<CardHeader className="space-y-1 pb-2">
						<div className="flex items-center gap-2">
							<div className="rounded-md bg-primary/10 p-1">
								<Wand2 className="h-4 w-4 text-primary" />
							</div>
							<CardTitle className="text-sm font-medium">
								{messages.features.optimization.title}
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-2 text-xs text-muted-foreground">
						<p>{messages.features.optimization.description}</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
