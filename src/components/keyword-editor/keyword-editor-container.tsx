"use client";

import { useState, useEffect } from "react";
import {
  type FormData,
  type KeywordMatch,
  type KeywordMetadata,
} from "@/components/keyword-editor/core/schema";
import { getKeywords, fetchLinksForKeywords } from "@/actions/keywords";
import { KeywordEditor } from "@/components/keyword-editor/editor";
import { findKeywordsInText, getUniqueSelectedKeywords } from "@/lib/keywords";
import { loadBlacklist } from "@/lib/blacklist";
import { loadPreferredSites } from "@/lib/preferred-sites";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { catchError } from "@/utils";
import { type EditorMessages } from "./core/messages";
import { useFingerprint } from "../fingerprint/use-fingerprint";

/**
 * 关键词编辑器容器组件
 * 处理状态管理和用户交互逻辑
 */
export function KeywordEditorContainer({
  messages,
}: {
  messages: EditorMessages;
}) {
  const { toast } = useToast();
  const fingerprint = useFingerprint();
  const [text, setText] = useState("");
  const [matches, setMatches] = useState<KeywordMatch[]>([]);
  const [keywordMetadata, setKeywordMetadata] = useState<
    Record<string, KeywordMetadata>
  >({});
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [hasLinks, setHasLinks] = useState(false);
  const [preferredSites, setPreferredSites] = useState<string[]>([]);

  // 加载偏好站点
  useEffect(() => {
    setPreferredSites(loadPreferredSites().map((site) => site.domain));

    const handleStorageChange = () => {
      setPreferredSites(loadPreferredSites().map((site) => site.domain));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 处理表单提交
  async function handleSubmit(data: FormData) {
    setIsLoading(true);

    const [error, result] = await catchError(
      getKeywords(data.text, fingerprint ?? undefined),
    );

    if (error) {
      setIsLoading(false);
      console.error("分析文本失败:", error);
      toast({
        variant: "destructive",
        title: "分析失败",
        description: "服务器错误，请稍后重试",
      });
      return;
    }

    if (result.error) {
      setIsLoading(false);
      if (result.error.code === "RATE_LIMITED") {
        toast({
          variant: "destructive",
          title: "访问限制",
          description: result.error.message,
        });
        return;
      }

      toast({
        variant: "destructive",
        title: "分析失败",
        description: result.error.message,
        action: (
          <ToastAction altText="重试" onClick={() => handleSubmit(data)}>
            重试
          </ToastAction>
        ),
      });
      return;
    }

    if (!result.data) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "分析失败",
        description: "服务器返回了无效的数据",
      });
      return;
    }

    // 创建关键词到元数据的映射
    const metadata: Record<string, KeywordMetadata> = {};
    const keywords = result.data.object.keywords.map((item) => {
      const { keyword, ...rest } = item;
      metadata[keyword] = rest;
      return keyword;
    });

    // 查找关键词在文本中的位置
    const matches = findKeywordsInText(data.text, keywords);

    // 更新状态
    setText(data.text);
    setMatches(matches);
    setKeywordMetadata(metadata);
    setIsEditing(false);
    setIsLoading(false);
  }

  // 处理关键词切换
  function handleToggleKeyword(id: string) {
    setSelectedKeywordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // 处理确认选择
  async function handleConfirm() {
    setIsLoading(true);

    const selectedKeywords = getUniqueSelectedKeywords(selectedKeywordIds);
    const keywordsForSearch = selectedKeywords
      .map((keyword) => {
        const metadata = keywordMetadata[keyword];
        if (!metadata?.query) return null;
        return { keyword, query: metadata.query };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (keywordsForSearch.length === 0) {
      toast({
        variant: "destructive",
        title: "请选择关键词",
        description: "至少需要选择一个关键词",
      });
      setIsLoading(false);
      return;
    }

    const blacklist = loadBlacklist();
    const [error, linkMap] = await catchError(
      fetchLinksForKeywords(keywordsForSearch, blacklist, preferredSites),
    );

    if (error) {
      console.error("获取链接失败:", error);
      toast({
        variant: "destructive",
        title: "获取链接失败",
        description: "请稍后重试",
      });
      setIsLoading(false);
      return;
    }

    setKeywordMetadata((prev) => {
      const next = { ...prev };
      Object.entries(linkMap).forEach(
        ([keyword, { link, title, alternatives }]) => {
          if (next[keyword]) {
            next[keyword] = {
              ...next[keyword],
              link,
              title,
              alternatives,
            };
          }
        },
      );
      return next;
    });

    setHasLinks(true);
    setIsLoading(false);
  }

  // 处理编辑点击
  function handleEditClick() {
    setIsEditing(true);
    setHasLinks(false);
  }

  // 处理新建分析
  function handleNewAnalysis() {
    setText("");
    setMatches([]);
    setKeywordMetadata({});
    setSelectedKeywordIds(new Set());
    setIsEditing(true);
    setHasLinks(false);
  }

  return (
    <KeywordEditor
      text={text}
      matches={matches}
      keywordMetadata={keywordMetadata}
      selectedKeywordIds={selectedKeywordIds}
      isLoading={isLoading}
      isEditing={isEditing}
      hasLinks={hasLinks}
      preferredSites={preferredSites}
      messages={messages}
      onSubmit={handleSubmit}
      onToggleKeyword={handleToggleKeyword}
      onConfirm={handleConfirm}
      onEditClick={handleEditClick}
      onNewAnalysis={handleNewAnalysis}
    />
  );
}
