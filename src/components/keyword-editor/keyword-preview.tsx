"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { type KeywordMatch, type KeywordMetadata } from "./schema";
import { createKeywordId } from "@/lib/keywords";
import { EditorLayout, EditorActions } from "./editor-layout";

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
  // 渲染高亮文本
  function renderHighlightedText() {
    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    matches.forEach((match, matchIndex) => {
      const id = createKeywordId(match.keyword, matchIndex);

      // 添加普通文本
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${matchIndex}`}>
            {text.slice(lastIndex, match.index)}
          </span>,
        );
      }

      // 添加关键词
      const metadata = keywordMetadata[match.keyword];
      if (!metadata) return;

      elements.push(
        <Tooltip key={`tooltip-${id}`}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onToggleKeyword(id)}
              className={`rounded px-0.5 hover:bg-accent ${
                selectedKeywordIds.has(id)
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "bg-muted"
              }`}
            >
              {text.slice(match.index, match.index + match.keyword.length)}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" align="start">
            <div className="space-y-1">
              <p className="font-medium">{metadata.query}</p>
              <p className="text-xs text-muted-foreground">{metadata.reason}</p>
            </div>
          </TooltipContent>
        </Tooltip>,
      );

      lastIndex = match.index + match.keyword.length;
    });

    // 添加剩余文本
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">{text.slice(lastIndex, text.length)}</span>,
      );
    }

    return elements;
  }

  return (
    <div className="space-y-4">
      <EditorLayout>
        <TooltipProvider>
          <div className="whitespace-pre-wrap text-sm">
            {renderHighlightedText()}
          </div>
        </TooltipProvider>
      </EditorLayout>

      <EditorActions>
        <Button
          type="button"
          disabled={isLoading || selectedKeywordIds.size === 0}
          onClick={() => void onConfirm()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              获取链接中...
            </>
          ) : (
            "确认选择"
          )}
        </Button>
      </EditorActions>
    </div>
  );
}
