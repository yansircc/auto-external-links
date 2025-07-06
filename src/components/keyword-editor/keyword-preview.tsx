"use client";

import { Link2, Loader2 } from "lucide-react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useKeywordAnalysis, useKeywordSelection } from "@/hooks/keyword";
import { useKeywordEditorStore } from "@/stores/keyword-editor";
import { AddKeyword } from "./add-keyword";
import { EditorActions, EditorLayout } from "./core/editor-layout";
import type { EditorMessages } from "./core/messages";

interface KeywordPreviewProps {
	messages: EditorMessages["preview"];
}

export function KeywordPreview({ messages }: KeywordPreviewProps) {
	// Use store for pure state
	const { text, matches, keywordMetadata, selectedKeywordIds } =
		useKeywordEditorStore();

	// Use hooks for business logic
	const { fetchLinks, isLoading } = useKeywordAnalysis();
	const { handleToggleKeyword, isKeywordSelected } = useKeywordSelection();

	// 渲染高亮文本
	function renderHighlightedText() {
		let lastIndex = 0;
		const elements: JSX.Element[] = [];

		for (const match of matches) {
			// 添加普通文本
			if (match.start > lastIndex) {
				elements.push(
					<span key={`text-before-${match.start}`}>
						{text.slice(lastIndex, match.start)}
					</span>,
				);
			}

			// 添加关键词
			const metadata = keywordMetadata[match.keyword];
			if (!metadata) continue;

			elements.push(
				<Tooltip key={`tooltip-${match.id}`}>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={() => handleToggleKeyword(match.id)}
							className={`rounded px-0.5 hover:bg-accent ${
								isKeywordSelected(match.id)
									? "bg-green-200 text-green-700 hover:bg-green-300"
									: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
							}`}
						>
							{text.slice(match.start, match.end)}
						</button>
					</TooltipTrigger>
					<TooltipContent side="top" align="start">
						<div className="space-y-1">
							<p className="font-medium">{metadata.query}</p>
							<p className="text-muted-foreground text-xs">{metadata.reason}</p>
						</div>
					</TooltipContent>
				</Tooltip>,
			);

			lastIndex = match.end;
		}

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

			{/* 关键词管理栏 */}
			<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
				<div className="text-muted-foreground text-sm">
					已选择{" "}
					<span className="font-medium text-foreground">
						{selectedKeywordIds.size}
					</span>{" "}
					个关键词
				</div>
				<AddKeyword />
			</div>

			<EditorActions>
				<Button
					type="button"
					disabled={isLoading}
					onClick={() => fetchLinks()}
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
