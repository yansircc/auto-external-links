"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type KeywordEditorProps } from "./types";
import { EditorForm } from "./editor-form";
import { KeywordPreview } from "./keyword-preview";
import { LinkedContent } from "./linked-content";

export function KeywordEditor({
  text,
  matches,
  keywordMetadata,
  selectedKeywordIds,
  isLoading,
  isEditing,
  hasLinks,
  onSubmit,
  onToggleKeyword,
  onConfirm,
  onNewAnalysis,
}: KeywordEditorProps) {
  return (
    <div className="relative space-y-4">
      {hasLinks && (
        <div className="absolute right-0 top-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onNewAnalysis}
          >
            <Plus className="mr-2 h-4 w-4" />
            新建分析
          </Button>
        </div>
      )}
      {isEditing ? (
        <EditorForm text={text} isLoading={isLoading} onSubmit={onSubmit} />
      ) : hasLinks ? (
        <LinkedContent
          text={text}
          matches={matches}
          keywordMetadata={keywordMetadata}
          selectedKeywordIds={selectedKeywordIds}
        />
      ) : (
        <KeywordPreview
          text={text}
          matches={matches}
          keywordMetadata={keywordMetadata}
          selectedKeywordIds={selectedKeywordIds}
          isLoading={isLoading}
          onToggleKeyword={onToggleKeyword}
          onConfirm={onConfirm}
        />
      )}
    </div>
  );
}
