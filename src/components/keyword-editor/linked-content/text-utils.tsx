import type { JSX } from "react";
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

	for (const match of matches) {
		const id = match.id;
		// Only process selected keywords
		if (!selectedKeywordIds.has(id)) {
			if (match.start > lastIndex) {
				elements.push(
					<span key={`text-skip-${match.start}`}>
						{text.slice(lastIndex, match.end)}
					</span>,
				);
				lastIndex = match.end;
			}
			continue;
		}

		// Add normal text before the keyword
		if (match.start > lastIndex) {
			elements.push(
				<span key={`text-before-${match.start}`}>
					{text.slice(lastIndex, match.start)}
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
					{text.slice(match.start, match.end)}
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

		lastIndex = match.end;
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
		.filter((match) => selectedKeywordIds.has(match.id))
		.sort((a, b) => b.start - a.start); // Process from end to start

	// Add links
	for (const match of sortedMatches) {
		const metadata = keywordMetadata[match.keyword];
		if (!metadata?.link) continue;

		const linkText = text.slice(match.start, match.end);
		const markdown = `[${linkText}](${metadata.link})`;
		result = result.slice(0, match.start) + markdown + result.slice(match.end);
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
		.filter((match) => selectedKeywordIds.has(match.id))
		.sort((a, b) => b.start - a.start); // Process from end to start

	// Add links with footnote references
	for (const match of sortedMatches) {
		const id = match.id;

		const metadata = keywordMetadata[match.keyword];
		if (!metadata?.link) continue;

		const footnoteIndex = footnoteIndexMap.get(id);
		if (!footnoteIndex) continue;

		const linkText = text.slice(match.start, match.end);
		const markdown = `[${linkText}](${metadata.link})[^${footnoteIndex}]`;
		result = result.slice(0, match.start) + markdown + result.slice(match.end);
	}

	return result;
}

export function generateFootnotesSection(footnotes: Footnote[]) {
	if (footnotes.length === 0) return "";

	return `\n\n---\n\n${footnotes
		.map((footnote, index) => `[^${index + 1}]: ${footnote.reason}`)
		.join("\n")}\n`;
}
