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
import { TextSelectionPopover } from "./text-selection-popover-v2";

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
							onClick={(e) => {
								e.preventDefault();
								handleToggleKeyword(match.id);
							}}
							onMouseDown={(e) => {
								// 防止按钮点击清除文本选择
								if (window.getSelection()?.toString()) {
									e.preventDefault();
								}
							}}
							className={`rounded-md px-1.5 py-0.5 transition-all duration-200 ${
								isKeywordSelected(match.id)
									? "bg-green-100 text-green-700 ring-2 ring-green-300/50 ring-offset-1 hover:bg-green-200"
									: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:ring-2 hover:ring-yellow-300/50 hover:ring-offset-1"
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
					<div
						className="whitespace-pre-wrap text-sm"
						data-editor-content="true"
					>
						{renderHighlightedText()}
					</div>
				</TooltipProvider>
				<TextSelectionPopover />
			</EditorLayout>

			{/* 关键词管理栏 */}
			<div className="flex items-center justify-between rounded-lg border bg-gradient-to-r from-muted/50 to-muted/30 p-4">
				<div className="flex items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
						<span className="font-semibold text-primary text-sm">
							{selectedKeywordIds.size}
						</span>
					</div>
					<div className="text-sm">
						<span className="text-muted-foreground">
							已选择关键词 ({Object.keys(keywordMetadata).length}/20)
						</span>
						<p className="text-muted-foreground/70 text-xs">
							鼠标选择文本可快速添加新关键词
						</p>
					</div>
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
