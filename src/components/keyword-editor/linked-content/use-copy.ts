import { useState } from "react";
import type { Footnote, RenderOptions } from "../core/types";
import {
	generateFootnotesSection,
	generateMarkdown,
	generateMarkdownWithFootnotes,
} from "./text-utils";

export function useCopy(options: RenderOptions, footnotes: Footnote[]) {
	const [copiedSimple, setCopiedSimple] = useState(false);
	const [copiedWithFootnotes, setCopiedWithFootnotes] = useState(false);

	async function copyToClipboard(withFootnotes: boolean) {
		const markdown = withFootnotes
			? generateMarkdownWithFootnotes(options) +
				generateFootnotesSection(footnotes)
			: generateMarkdown(options);

		await navigator.clipboard.writeText(markdown);

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
