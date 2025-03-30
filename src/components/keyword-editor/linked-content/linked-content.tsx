"use client";

import { Button } from "@/components/ui/button";
import { useKeywordEditorStore } from "@/stores/keyword-editor";
import { Check, Copy } from "lucide-react";
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
	const {
		text,
		matches,
		keywordMetadata,
		selectedKeywordIds,
		updateKeywordLink,
	} = useKeywordEditorStore();

	const { footnotes, footnoteIndexMap } = useFootnotes(
		matches,
		selectedKeywordIds,
		keywordMetadata,
	);

	const [{ copiedSimple, copiedWithFootnotes }, { copyToClipboard }] = useCopy(
		{
			text,
			matches,
			keywordMetadata,
			selectedKeywordIds,
			footnoteIndexMap,
			messages,
		},
		footnotes,
	);

	// 处理链接切换
	function handleLinkChange(id: string, link: string, title: string) {
		const keyword = id.slice(0, id.lastIndexOf("-"));
		updateKeywordLink(keyword, link, title);
	}

	return (
		<div className="space-y-8">
			<EditorLayout>
				<div className="whitespace-pre-wrap text-sm">
					{renderLinkedText({
						text,
						matches,
						keywordMetadata,
						selectedKeywordIds,
						footnoteIndexMap,
						onLinkChange: handleLinkChange,
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
