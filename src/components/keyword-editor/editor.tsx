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
    <div className="space-y-6">
      {/* Marketing Header */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-semibold">智能外链优化</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          自动分析文本中的关键词，为您推荐最相关的外部链接，提升SEO效果
        </p>
      </div>

      {/* Editor Container */}
      <Card>
        <CardHeader>
          <CardTitle>文本编辑器</CardTitle>
          <CardDescription>
            {isEditing
              ? "请输入要分析的英文文本"
              : hasLinks
                ? "点击链接可以预览，复制后可直接使用"
                : "点击关键词可以选择是否添加外链"}
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
              <CardTitle className="text-sm font-medium">智能分析</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>AI驱动的关键词识别，准确把握文章重点</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-muted/50 shadow-none">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-1">
                <Link2 className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">优质外链</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>自动匹配高质量相关链接，提升文章价值</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-muted/50 shadow-none">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-1">
                <Wand2 className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">一键优化</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>快速生成优化后的Markdown文本，随时复制使用</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
