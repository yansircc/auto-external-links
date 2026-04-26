import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Footnote, RenderOptions } from "../core/types";
import {
	generateFootnotesSection,
	generateMarkdown,
	generateMarkdownWithFootnotes,
} from "./text-utils";

function copyWithTextarea(text: string): boolean {
	if (typeof document === "undefined") return false;

	const selection = document.getSelection();
	const previousRange =
		selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
	const textarea = document.createElement("textarea");

	textarea.value = text;
	textarea.setAttribute("readonly", "");
	textarea.style.position = "fixed";
	textarea.style.top = "0";
	textarea.style.left = "0";
	textarea.style.width = "1px";
	textarea.style.height = "1px";
	textarea.style.opacity = "0";

	document.body.appendChild(textarea);
	textarea.focus();
	textarea.select();
	textarea.setSelectionRange(0, text.length);

	const didCopy = document.execCommand("copy");
	document.body.removeChild(textarea);

	if (selection && previousRange) {
		selection.removeAllRanges();
		selection.addRange(previousRange);
	}

	return didCopy;
}

async function writeClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return copyWithTextarea(text);
	}
}

export function useCopy(options: RenderOptions, footnotes: Footnote[]) {
	const { toast } = useToast();
	const [copiedSimple, setCopiedSimple] = useState(false);
	const [copiedWithFootnotes, setCopiedWithFootnotes] = useState(false);

	async function copyToClipboard(withFootnotes: boolean) {
		const markdown = withFootnotes
			? generateMarkdownWithFootnotes(options) +
				generateFootnotesSection(footnotes)
			: generateMarkdown(options);

		const didCopy = await writeClipboard(markdown);
		if (!didCopy) {
			toast({
				title: options.messages.copyFailed,
				description: options.messages.copyManually,
				variant: "destructive",
			});
			return;
		}

		if (withFootnotes) {
			setCopiedWithFootnotes(true);
			setTimeout(() => {
				setCopiedWithFootnotes(false);
			}, 1000);
		} else {
			setCopiedSimple(true);
			setTimeout(() => {
				setCopiedSimple(false);
			}, 1000);
		}
	}

	return [{ copiedSimple, copiedWithFootnotes }, { copyToClipboard }] as const;
}
