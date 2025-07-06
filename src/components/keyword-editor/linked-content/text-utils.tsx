import type { JSX } from "react";
import { createKeywordId } from "@/lib/keywords";
import type { Footnote, RenderOptions } from "../core/types";
import { LinkSwitcher } from "./link-switcher";

export function renderLinkedText({
	text,
	matches,
	keywordMetadata,
	selectedKeywordIds,
	footnoteIndexMap,
	onLinkChange,
	messages,
}: RenderOptions & {
	onLinkChange: (id: string, link: string, title: string) => void;
}) {
	let lastIndex = 0;
	const elements: JSX.Element[] = [];

	for (const [matchIndex, match] of matches.entries()) {
		const id = createKeywordId(match.keyword, matchIndex);
		// Only process selected keywords
		if (!selectedKeywordIds.has(id)) {
			if (match.index > lastIndex) {
				elements.push(
					<span key={`text-skip-${match.index}`}>
						{text.slice(lastIndex, match.index + match.keyword.length)}
					</span>,
				);
				lastIndex = match.index + match.keyword.length;
			}
			continue;
		}

		// Add normal text before the keyword
		if (match.index > lastIndex) {
			elements.push(
				<span key={`text-before-${match.index}`}>
					{text.slice(lastIndex, match.index)}
				</span>,
			);
		}

		// Add linked keyword with footnote
		const metadata = keywordMetadata[match.keyword];
		if (!metadata?.link) continue;

		const footnoteIndex = footnoteIndexMap.get(id);
		if (!footnoteIndex) continue;

		elements.push(
			<span
				key={`link-${id}`}
				id={`link-${id}`}
				className="group inline-flex items-start"
			>
				<LinkSwitcher
					link={metadata.link}
					title={metadata.title}
					alternatives={metadata.alternatives}
					onLinkChange={(link, title) => onLinkChange(id, link, title)}
					messages={messages}
				>
					{text.slice(match.index, match.index + match.keyword.length)}
				</LinkSwitcher>
				<a
					href={`#footnote-${footnoteIndex}`}
					className="ml-0.5 text-muted-foreground text-xs no-underline group-hover:text-primary"
					aria-label={`See footnote ${footnoteIndex}`}
				>
					[{footnoteIndex}]
				</a>
			</span>,
		);

		lastIndex = match.index + match.keyword.length;
	}

	// Add remaining text
	if (lastIndex < text.length) {
		elements.push(
			<span key="text-end">{text.slice(lastIndex, text.length)}</span>,
		);
	}

	return elements;
}

export function generateMarkdown({
	text,
	matches,
	keywordMetadata,
	selectedKeywordIds,
}: Omit<RenderOptions, "footnoteIndexMap" | "messages">) {
	let result = text;
	const sortedMatches = [...matches]
		.filter((match, index) =>
			selectedKeywordIds.has(createKeywordId(match.keyword, index)),
		)
		.sort((a, b) => b.index - a.index); // Process from end to start

	// Add links
	for (const match of sortedMatches) {
		const metadata = keywordMetadata[match.keyword];
		if (!metadata?.link) continue;

		const linkText = text.slice(
			match.index,
			match.index + match.keyword.length,
		);
		const markdown = `[${linkText}](${metadata.link})`;
		result =
			result.slice(0, match.index) +
			markdown +
			result.slice(match.index + match.keyword.length);
	}

	return result;
}

export function generateMarkdownWithFootnotes({
	text,
	matches,
	keywordMetadata,
	selectedKeywordIds,
	footnoteIndexMap,
}: Omit<RenderOptions, "messages">) {
	let result = text;
	const sortedMatches = [...matches]
		.filter((match, index) =>
			selectedKeywordIds.has(createKeywordId(match.keyword, index)),
		)
		.sort((a, b) => b.index - a.index); // Process from end to start

	// Add links with footnote references
	for (const match of sortedMatches) {
		// Find the original index of this match in the matches array
		const originalIndex = matches.findIndex(
			(m) => m.index === match.index && m.keyword === match.keyword,
		);
		const id = createKeywordId(match.keyword, originalIndex);

		const metadata = keywordMetadata[match.keyword];
		if (!metadata?.link) continue;

		const footnoteIndex = footnoteIndexMap.get(id);
		if (!footnoteIndex) continue;

		const linkText = text.slice(
			match.index,
			match.index + match.keyword.length,
		);
		const markdown = `[${linkText}](${metadata.link})[^${footnoteIndex}]`;
		result =
			result.slice(0, match.index) +
			markdown +
			result.slice(match.index + match.keyword.length);
	}

	return result;
}

export function generateFootnotesSection(footnotes: Footnote[]) {
	if (footnotes.length === 0) return "";

	return `\n\n---\n\n${footnotes
		.map((footnote, index) => `[^${index + 1}]: ${footnote.reason}`)
		.join("\n")}\n`;
}
