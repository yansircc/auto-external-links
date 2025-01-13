import { useState } from "react";
import { type Footnote } from "./types";
import {
  generateMarkdown,
  generateMarkdownWithFootnotes,
  generateFootnotesSection,
} from "./text-utils";
import { type RenderOptions } from "./types";

interface CopyState {
  copiedSimple: boolean;
  copiedWithFootnotes: boolean;
}

interface CopyActions {
  copyToClipboard: (withFootnotes: boolean) => Promise<void>;
}

export function useCopy(
  options: RenderOptions,
  footnotes: Footnote[],
): [CopyState, CopyActions] {
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
      setTimeout(() => setCopiedWithFootnotes(false), 2000);
    } else {
      setCopiedSimple(true);
      setTimeout(() => setCopiedSimple(false), 2000);
    }
  }

  return [{ copiedSimple, copiedWithFootnotes }, { copyToClipboard }];
}
