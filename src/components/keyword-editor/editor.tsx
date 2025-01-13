"use client";

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
}: KeywordEditorProps) {
  return (
    <div className="relative space-y-4">
      {isEditing ? (
        <EditorForm isLoading={isLoading} onSubmit={onSubmit} />
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
