"use client";

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
  keywordMetadata,
  selectedKeywordIds,
}: LinkedContentProps) {
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
