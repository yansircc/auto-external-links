"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Loader2 } from "lucide-react";
import { createKeywordId } from "@/lib/keywords";
import type { KeywordMatch, KeywordMetadata } from "@/app/schema";

interface KeywordPreviewProps {
  text: string;
  matches: KeywordMatch[];
  keywordMetadata: Record<string, KeywordMetadata>;
  selectedKeywordIds: Set<string>;
  isLoading: boolean;
  onToggleKeyword: (id: string) => void;
  onConfirm: () => Promise<void>;
}

export function KeywordPreview({
  text,
  matches,
  keywordMetadata,
  selectedKeywordIds,
  isLoading,
  onToggleKeyword,
  onConfirm,
}: KeywordPreviewProps) {
  // First, calculate offset for each paragraph
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
          const paragraphMatches = matches
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
              {renderHighlightedText(
                paragraph,
                paragraphMatches, // Pass only matches for this paragraph
                keywordMetadata,
                selectedKeywordIds,
                onToggleKeyword,
              )}
            </motion.p>
          );
        })}
      </motion.div>

      <motion.div className="flex justify-end" layout>
        <Button
          onClick={onConfirm}
          disabled={isLoading || selectedKeywordIds.size === 0}
          className="shadow-sm transition-all hover:shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              确认选择
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              确认选择
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}

function renderHighlightedText(
  text: string,
  matches: KeywordMatch[],
  metadata: Record<string, KeywordMetadata>,
  selectedIds: Set<string>,
  onToggle: (id: string) => void,
) {
  const segments: JSX.Element[] = [];
  let lastIndex = 0;

  // Sort matches by index to process them in order
  const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

  sortedMatches.forEach((match, matchIndex) => {
    const id = createKeywordId(match.keyword, match.index);
    const isSelected = selectedIds.has(id);

    // Add text before the keyword
    if (match.index > lastIndex) {
      segments.push(
        <span key={`text-${matchIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>,
      );
    }

    // Add the highlighted keyword
    segments.push(
      <Tooltip key={`keyword-${matchIndex}`}>
        <TooltipTrigger asChild>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`rounded px-1 ${
              isSelected
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => onToggle(id)}
          >
            {match.keyword}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{metadata[match.keyword]?.query}</p>
          <p className="text-sm text-muted-foreground">
            {metadata[match.keyword]?.reason}
          </p>
        </TooltipContent>
      </Tooltip>,
    );

    lastIndex = match.index + match.keyword.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push(<span key="text-end">{text.slice(lastIndex)}</span>);
  }

  return segments;
}
