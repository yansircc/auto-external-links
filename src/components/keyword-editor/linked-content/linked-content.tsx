"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKeywordSelection } from "@/hooks/keyword";
import { useKeywordEditorStore } from "@/stores/keyword-editor";
import { EditorActions, EditorLayout } from "../core/editor-layout";
import type { EditorMessages } from "../core/messages";
import { Footnotes } from "./footnotes";
import { renderLinkedText } from "./text-utils";
import { useCopy } from "./use-copy";
import { useFootnotes } from "./use-footnotes";

interface LinkedContentProps {
	messages: EditorMessages["linkedContent"];
}

export function LinkedContent({ messages }: LinkedContentProps) {
	// Use store for pure state
	const { text, matches, targetMetadata, selectedTargetIds } =
		useKeywordEditorStore();

	// Use hook for business logic
	const { switchTargetLink, removeTargetLink } = useKeywordSelection();

	const { footnotes, footnoteIndexMap } = useFootnotes(
		matches,
		selectedTargetIds,
		targetMetadata,
	);

	const [{ copiedSimple, copiedWithFootnotes }, { copyToClipboard }] = useCopy(
		{
			text,
			matches,
			targetMetadata,
			selectedTargetIds,
			footnoteIndexMap,
			messages,
		},
		footnotes,
	);

	// 处理链接切换
	function handleLinkChange(id: string, link: string, title: string) {
		switchTargetLink(id, link, title);
	}

	// 处理链接删除
	function handleLinkRemove(id: string) {
		removeTargetLink(id);
	}

	return (
		<div className="space-y-8">
			<EditorLayout>
				<div className="whitespace-pre-wrap text-sm">
					{renderLinkedText({
						text,
						matches,
						targetMetadata,
						selectedTargetIds,
						footnoteIndexMap,
						onLinkChange: handleLinkChange,
						onLinkRemove: handleLinkRemove,
						messages,
					})}
				</div>
				<Footnotes footnotes={footnotes} messages={messages} />
			</EditorLayout>

			<EditorActions>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => void copyToClipboard(false)}
						disabled={copiedSimple}
					>
						{copiedSimple ? (
							<>
								<Check className="mr-2 h-4 w-4" />
								{messages.copied}
							</>
						) : (
							<>
								<Copy className="mr-2 h-4 w-4" />
								{messages.copyMarkdown}
							</>
						)}
					</Button>
					<Button
						variant="default"
						onClick={() => void copyToClipboard(true)}
						disabled={copiedWithFootnotes}
					>
						{copiedWithFootnotes ? (
							<>
								<Check className="mr-2 h-4 w-4" />
								{messages.copied}
							</>
						) : (
							<>
								<Copy className="mr-2 h-4 w-4" />
								{messages.copyMarkdownWithFootnotes}
							</>
						)}
					</Button>
				</div>
			</EditorActions>
		</div>
	);
}
