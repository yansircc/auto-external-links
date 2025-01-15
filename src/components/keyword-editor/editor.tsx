"use client";

import { type KeywordEditorProps } from "./core/types";
import { EditorForm } from "./editor-form";
import { KeywordPreview } from "./keyword-preview";
import { LinkedContent } from "./linked-content";
import { AnimatePresence } from "framer-motion";
import { Brain, Link2, Sparkles, Wand2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('keyword-editor');
  return (
    <div className="space-y-6">
      {/* Marketing Header */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t('header.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('header.description')}
        </p>
      </div>

      {/* Editor Container */}
      <Card>
        <CardHeader>
          <CardTitle>{t('form.title')}</CardTitle>
          <CardDescription>
            {isEditing
              ? t('form.description')
              : hasLinks
                ? t('linked-content.description')
                : t('preview.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <EditorForm
                key="form"
                text={text}
                isLoading={isLoading}
                onSubmit={onSubmit}
              />
            ) : hasLinks ? (
              <LinkedContent
                key="linked"
                text={text}
                matches={matches}
                keywordMetadata={keywordMetadata}
                selectedKeywordIds={selectedKeywordIds}
              />
            ) : (
              <KeywordPreview
                key="preview"
                text={text}
                matches={matches}
                keywordMetadata={keywordMetadata}
                selectedKeywordIds={selectedKeywordIds}
                isLoading={isLoading}
                onToggleKeyword={onToggleKeyword}
                onConfirm={onConfirm}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Features List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-none bg-muted/50 shadow-none">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-1">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">{t('features.ai.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>{t('features.ai.description')}</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-muted/50 shadow-none">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-1">
                <Link2 className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">{t('features.links.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>{t('features.links.description')}</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-muted/50 shadow-none">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-1">
                <Wand2 className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">{t('features.optimization.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>{t('features.optimization.description')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
