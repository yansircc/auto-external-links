import { createKeywordId } from "@/lib/keywords";
import { type Footnote, type RenderOptions } from "../core/types";

export function renderLinkedText({
  text,
  matches,
  keywordMetadata,
  selectedKeywordIds,
  footnoteIndexMap,
}: RenderOptions) {
  let lastIndex = 0;
  const elements: JSX.Element[] = [];

  matches.forEach((match, matchIndex) => {
    const id = createKeywordId(match.keyword, matchIndex);
    // Only process selected keywords
    if (!selectedKeywordIds.has(id)) {
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${matchIndex}`}>
            {text.slice(lastIndex, match.index + match.keyword.length)}
          </span>,
        );
        lastIndex = match.index + match.keyword.length;
      }
      return;
    }

    // Add normal text before the keyword
    if (match.index > lastIndex) {
      elements.push(
        <span key={`text-${matchIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>,
      );
    }

    // Add linked keyword with footnote
    const metadata = keywordMetadata[match.keyword];
    if (!metadata?.link) return;

    const footnoteIndex = footnoteIndexMap.get(id);
    if (!footnoteIndex) return;

    elements.push(
      <span
        key={`link-${id}`}
        id={`link-${id}`}
        className="group inline-flex items-start"
      >
        <a
          href={metadata.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80"
          title={metadata.title ?? undefined}
        >
          {text.slice(match.index, match.index + match.keyword.length)}
        </a>
        <a
          href={`#footnote-${footnoteIndex}`}
          className="ml-0.5 text-xs text-muted-foreground no-underline group-hover:text-primary"
          aria-label={`See footnote ${footnoteIndex}`}
        >
          [{footnoteIndex}]
        </a>
      </span>,
    );

    lastIndex = match.index + match.keyword.length;
  });

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
}: Omit<RenderOptions, "footnoteIndexMap">) {
  let result = text;
  const sortedMatches = [...matches]
    .filter((match, index) =>
      selectedKeywordIds.has(createKeywordId(match.keyword, index)),
    )
    .sort((a, b) => b.index - a.index); // Process from end to start

  // Add links
  sortedMatches.forEach((match) => {
    const metadata = keywordMetadata[match.keyword];
    if (!metadata?.link) return;

    const linkText = text.slice(
      match.index,
      match.index + match.keyword.length,
    );
    const markdown = `[${linkText}](${metadata.link})`;
    result =
      result.slice(0, match.index) +
      markdown +
      result.slice(match.index + match.keyword.length);
  });

  return result;
}

export function generateMarkdownWithFootnotes({
  text,
  matches,
  keywordMetadata,
  selectedKeywordIds,
  footnoteIndexMap,
}: RenderOptions) {
  let result = text;
  const sortedMatches = [...matches]
    .filter((match, index) =>
      selectedKeywordIds.has(createKeywordId(match.keyword, index)),
    )
    .sort((a, b) => b.index - a.index); // Process from end to start

  // Add links with footnote references
  sortedMatches.forEach((match) => {
    // Find the original index of this match in the matches array
    const originalIndex = matches.findIndex(
      (m) => m.index === match.index && m.keyword === match.keyword,
    );
    const id = createKeywordId(match.keyword, originalIndex);

    const metadata = keywordMetadata[match.keyword];
    if (!metadata?.link) return;

    const footnoteIndex = footnoteIndexMap.get(id);
    if (!footnoteIndex) return;

    const linkText = text.slice(
      match.index,
      match.index + match.keyword.length,
    );
    const markdown = `[${linkText}](${metadata.link})[^${footnoteIndex}]`;
    result =
      result.slice(0, match.index) +
      markdown +
      result.slice(match.index + match.keyword.length);
  });

  return result;
}

export function generateFootnotesSection(footnotes: Footnote[]) {
  if (footnotes.length === 0) return "";

  return (
    "\n\n---\n\n" +
    footnotes
      .map((footnote, index) => `[^${index + 1}]: ${footnote.reason}`)
      .join("\n") +
    "\n"
  );
}
