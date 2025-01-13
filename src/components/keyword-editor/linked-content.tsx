"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { KeywordMatch, KeywordMetadata } from "@/app/schema";
import { createKeywordId } from "@/lib/keywords";

interface LinkedContentProps {
  text: string;
  matches: KeywordMatch[];
  keywordMetadata: Record<string, KeywordMetadata>;
  selectedKeywordIds: Set<string>;
}

export function LinkedContent({
  text,
  matches,
  keywordMetadata,
  selectedKeywordIds,
}: LinkedContentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const markdown = generateMarkdown(
      text,
      matches,
      keywordMetadata,
      selectedKeywordIds,
    );
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter matches to only include selected keywords
  const selectedMatches = matches.filter((match) => {
    const id = createKeywordId(match.keyword, match.index);
    return selectedKeywordIds.has(id);
  });

  // Calculate offset for each paragraph
  const paragraphs = text.split("\n");
  let currentOffset = 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 p-6"
    >
      <motion.div
        className="prose prose-sm dark:prose-invert max-w-none"
        layout
      >
        {paragraphs.map((paragraph, i) => {
          // Filter matches that belong to this paragraph
          const paragraphMatches = selectedMatches
            .filter((match) => {
              const matchPosition = match.index;
              const paragraphStart = currentOffset;
              const paragraphEnd = currentOffset + paragraph.length;
              return (
                matchPosition >= paragraphStart && matchPosition < paragraphEnd
              );
            })
            .map((match) => ({
              ...match,
              // Adjust index relative to paragraph
              index: match.index - currentOffset,
            }));

          // Update offset for next paragraph
          currentOffset += paragraph.length + 1; // +1 for the newline

          return (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="whitespace-pre-wrap"
            >
              {renderLinkedText(paragraph, paragraphMatches, keywordMetadata)}
            </motion.p>
          );
        })}
      </motion.div>

      <motion.div className="flex justify-end" layout>
        <Button
          onClick={handleCopy}
          className="shadow-sm transition-all hover:shadow-md"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              已复制
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              复制 Markdown
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}

function renderLinkedText(
  text: string,
  matches: KeywordMatch[],
  metadata: Record<string, KeywordMetadata>,
) {
  const segments: JSX.Element[] = [];
  let lastIndex = 0;

  // Sort matches by index to process them in order
  const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

  sortedMatches.forEach((match, matchIndex) => {
    const { link, title } = metadata[match.keyword] ?? {};

    // Add text before the keyword
    if (match.index > lastIndex) {
      segments.push(
        <span key={`text-${matchIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>,
      );
    }

    // Add the linked keyword
    segments.push(
      <motion.a
        key={`link-${matchIndex}`}
        href={link ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        className="text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
        title={title ?? undefined}
      >
        {match.keyword}
      </motion.a>,
    );

    lastIndex = match.index + match.keyword.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push(<span key="text-end">{text.slice(lastIndex)}</span>);
  }

  return segments;
}

function generateMarkdown(
  text: string,
  matches: KeywordMatch[],
  metadata: Record<string, KeywordMetadata>,
  selectedKeywordIds: Set<string>,
): string {
  // Filter matches to only include selected keywords
  const selectedMatches = matches.filter((match) => {
    const id = createKeywordId(match.keyword, match.index);
    return selectedKeywordIds.has(id);
  });

  let markdown = text;
  const sortedMatches = [...selectedMatches].sort((a, b) => b.index - a.index);

  sortedMatches.forEach((match) => {
    const { link, title } = metadata[match.keyword] ?? {};
    if (!link) return;

    const before = markdown.slice(0, match.index);
    const after = markdown.slice(match.index + match.keyword.length);
    markdown = `${before}[${match.keyword}](${link}${title ? ` "${title}"` : ""})${after}`;
  });

  return markdown;
}
