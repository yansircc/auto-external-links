"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { createKeywordId } from "@/lib/keywords";
import { useKeywordEditorStore } from "@/stores/keyword-editor";
import { Link2, Loader2 } from "lucide-react";
import { EditorActions, EditorLayout } from "./core/editor-layout";
import type { EditorMessages } from "./core/messages";

interface KeywordPreviewProps {
	messages: EditorMessages["preview"];
}

export function KeywordPreview({ messages }: KeywordPreviewProps) {
	const {
		text,
		matches,
		keywordMetadata,
		selectedKeywordIds,
		isLoading,
		toggleKeyword,
		handleConfirm,
	} = useKeywordEditorStore();

	// 渲染高亮文本
	function renderHighlightedText() {
		let lastIndex = 0;
		const elements: JSX.Element[] = [];

		matches.forEach((match, matchIndex) => {
			const id = createKeywordId(match.keyword, matchIndex);

			// 添加普通文本
			if (match.index > lastIndex) {
				elements.push(
					<span key={`text-${matchIndex}`}>
						{text.slice(lastIndex, match.index)}
					</span>,
				);
			}

			// 添加关键词
			const metadata = keywordMetadata[match.keyword];
			if (!metadata) return;

			elements.push(
				<Tooltip key={`tooltip-${id}`}>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={() => toggleKeyword(id)}
							className={`rounded px-0.5 hover:bg-accent ${
								selectedKeywordIds.has(id)
									? "bg-green-200 text-green-700 hover:bg-green-300"
									: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
							}`}
						>
							{text.slice(match.index, match.index + match.keyword.length)}
						</button>
					</TooltipTrigger>
					<TooltipContent side="top" align="start">
						<div className="space-y-1">
							<p className="font-medium">{metadata.query}</p>
							<p className="text-xs text-muted-foreground">{metadata.reason}</p>
						</div>
					</TooltipContent>
				</Tooltip>,
			);

			lastIndex = match.index + match.keyword.length;
		});

		// 添加剩余文本
		if (lastIndex < text.length) {
			elements.push(
				<span key="text-end">{text.slice(lastIndex, text.length)}</span>,
			);
		}

		return elements;
	}

	return (
		<div className="space-y-4">
			<EditorLayout>
				<TooltipProvider>
					<div className="whitespace-pre-wrap text-sm">
						{renderHighlightedText()}
					</div>
				</TooltipProvider>
			</EditorLayout>

			<EditorActions>
				<Button
					type="button"
					disabled={isLoading}
					onClick={() => handleConfirm()}
					className="gap-2"
				>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							{messages.gettingLinks}
						</>
					) : (
						<>
							<Link2 className="h-4 w-4" />
							{messages.confirm}
						</>
					)}
				</Button>
			</EditorActions>
		</div>
	);
}
