"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Check, Loader2 } from "lucide-react";
import { type KeywordMatch, type KeywordMetadata } from "@/app/schema";

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
  // 创建关键词 ID
  function createKeywordId(keyword: string, index: number) {
    return `${keyword}-${index}`;
  }

  // 渲染高亮文本
  function renderHighlightedText() {
    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    matches.forEach((match, matchIndex) => {
      const id = createKeywordId(match.keyword, matchIndex);
      const isSelected = selectedKeywordIds.has(id);
      const metadata = keywordMetadata[match.keyword];

      // 添加匹配前的文本
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${matchIndex}`}>
            {text.slice(lastIndex, match.index)}
          </span>,
        );
      }

      // 添加带有工具提示的关键词
      elements.push(
        <Tooltip key={`keyword-${matchIndex}`}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onToggleKeyword(id)}
              className={`mx-0.5 rounded px-1 py-0.5 ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {match.keyword}
              {isSelected && <Check className="ml-1 inline h-3 w-3" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>搜索词：{metadata?.query}</p>
            <p>推荐原因：{metadata?.reason}</p>
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
    <TooltipProvider>
      <div className="space-y-4">
        <div className="whitespace-pre-wrap rounded-md border p-4">
          {renderHighlightedText()}
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isLoading || selectedKeywordIds.size === 0}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : (
              "确认选择"
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
