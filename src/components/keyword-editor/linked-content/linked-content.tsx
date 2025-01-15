"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { EditorLayout, EditorActions } from "../core/editor-layout";
import { Footnotes } from "./footnotes";
import { type LinkedContentProps } from "../core/types";
import { useFootnotes } from "./use-footnotes";
import { renderLinkedText } from "./text-utils";
import { useCopy } from "./use-copy";
import { createKeywordId } from "@/lib/keywords";

export function LinkedContent({
  text,
  matches,
  keywordMetadata: initialKeywordMetadata,
  selectedKeywordIds,
}: LinkedContentProps) {
  const [keywordMetadata, setKeywordMetadata] = useState(
    initialKeywordMetadata,
  );

  // 添加调试日志
  useEffect(() => {
    console.log("LinkedContent metadata:", {
      initial: initialKeywordMetadata,
      current: keywordMetadata,
      selectedIds: Array.from(selectedKeywordIds),
    });
  }, [initialKeywordMetadata, keywordMetadata, selectedKeywordIds]);

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
    },
    footnotes,
  );

  // 处理链接切换
  function handleLinkChange(id: string, link: string, title: string) {
    const keyword = id.slice(0, id.lastIndexOf("-"));
    const metadata = keywordMetadata[keyword];
    if (!metadata) return;

    console.log("Changing link for keyword:", {
      id,
      keyword,
      oldLink: metadata.link,
      newLink: link,
      oldTitle: metadata.title,
      newTitle: title,
      alternatives: metadata.alternatives,
    });

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
          })}
        </div>
        <Footnotes footnotes={footnotes} />
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
                已复制
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                复制 Markdown
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
                已复制
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                复制 Markdown+脚注
              </>
            )}
          </Button>
        </div>
      </EditorActions>
    </div>
  );
}
