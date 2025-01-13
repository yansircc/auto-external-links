"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { type KeywordMatch, type KeywordMetadata } from "@/app/schema";
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

  // 渲染带链接的文本
  function renderLinkedText() {
    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    matches.forEach((match, matchIndex) => {
      const id = createKeywordId(match.keyword, matchIndex);
      // 只处理选中的关键词
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

      // 添加普通文本
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${matchIndex}`}>
            {text.slice(lastIndex, match.index)}
          </span>,
        );
      }

      // 添加带链接的关键词
      const metadata = keywordMetadata[match.keyword];
      if (!metadata) return;

      if (metadata.link) {
        elements.push(
          <a
            key={`link-${id}`}
            href={metadata.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
            title={metadata.title ?? undefined}
          >
            {text.slice(match.index, match.index + match.keyword.length)}
          </a>,
        );
      } else {
        elements.push(
          <span key={`text-${id}`}>
            {text.slice(match.index, match.index + match.keyword.length)}
          </span>,
        );
      }

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

  // 生成 Markdown 格式的文本
  function generateMarkdown() {
    let result = text;
    const sortedMatches = [...matches]
      .filter((match, index) =>
        selectedKeywordIds.has(createKeywordId(match.keyword, index)),
      )
      .sort((a, b) => b.index - a.index); // 从后向前处理，避免位置变化

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

  // 复制 Markdown 文本
  async function copyToClipboard() {
    const markdown = generateMarkdown();
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative rounded-lg border bg-card p-4 text-card-foreground">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={() => void copyToClipboard()}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        <span className="sr-only">复制 Markdown</span>
      </Button>
      <div className="space-y-1 whitespace-pre-wrap text-sm">
        {renderLinkedText()}
      </div>
    </div>
  );
}
