"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { EditorLayout, EditorActions } from "../core/editor-layout";
import { Footnotes } from "./footnotes";
import { type LinkedContentProps } from "../core/types";
import { useFootnotes } from "./use-footnotes";
import { renderLinkedText } from "./text-utils";
import { useCopy } from "./use-copy";

export function LinkedContent({
  text,
  matches,
  keywordMetadata: initialKeywordMetadata,
  selectedKeywordIds,
  messages,
}: LinkedContentProps) {
  const [keywordMetadata, setKeywordMetadata] = useState(
    initialKeywordMetadata,
  );

  const { footnotes, footnoteIndexMap } = useFootnotes(
    matches,
    selectedKeywordIds,
    keywordMetadata,
  );

  const [{ copiedSimple, copiedWithFootnotes }, { copyToClipboard }] = useCopy(
    {
      text,
      matches,
      keywordMetadata,
      selectedKeywordIds,
      footnoteIndexMap,
      messages,
    },
    footnotes,
  );

  // 处理链接切换
  function handleLinkChange(id: string, link: string, title: string) {
    const keyword = id.slice(0, id.lastIndexOf("-"));
    const metadata = keywordMetadata[keyword];
    if (!metadata) return;

    setKeywordMetadata((prev) => ({
      ...prev,
      [keyword]: {
        ...metadata,
        link,
        title,
        alternatives: metadata.alternatives,
      },
    }));
  }

  return (
    <div className="space-y-8">
      <EditorLayout>
        <div className="whitespace-pre-wrap text-sm">
          {renderLinkedText({
            text,
            matches,
            keywordMetadata,
            selectedKeywordIds,
            footnoteIndexMap,
            onLinkChange: handleLinkChange,
            messages,
          })}
        </div>
        <Footnotes footnotes={footnotes} messages={messages} />
      </EditorLayout>

      <EditorActions>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void copyToClipboard(false)}
            disabled={copiedSimple}
          >
            {copiedSimple ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {messages.copied}
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                {messages.copyMarkdown}
              </>
            )}
          </Button>
          <Button
            variant="default"
            onClick={() => void copyToClipboard(true)}
            disabled={copiedWithFootnotes}
          >
            {copiedWithFootnotes ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {messages.copied}
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                {messages.copyMarkdownWithFootnotes}
              </>
            )}
          </Button>
        </div>
      </EditorActions>
    </div>
  );
}
