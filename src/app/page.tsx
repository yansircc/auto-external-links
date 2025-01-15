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
import { SiteHeader } from "@/components/layout/site-header";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

export default function Home() {
  const { toast } = useToast();
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

  // Load preferred sites on mount and when localStorage changes
  useEffect(() => {
    setPreferredSites(loadPreferredSites().map((site) => site.domain));

    // Listen for storage changes
    const handleStorageChange = () => {
      setPreferredSites(loadPreferredSites().map((site) => site.domain));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 处理表单提交
  async function handleSubmit(data: FormData) {
    try {
      setIsLoading(true);
      const result = await getKeywords(data.text);
      if (!result.object) {
        throw new Error("Failed to analyze keywords");
      }

      // 创建关键词到元数据的映射
      const metadata: Record<string, KeywordMetadata> = {};
      const keywords = result.object.map((item) => {
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
    } catch (error) {
      console.error("Failed to analyze text:", error);
      toast({
        variant: "destructive",
        title: "分析失败",
        description: "大语言模型通病，可以多试几次",
        action: (
          <ToastAction altText="重试" onClick={() => handleSubmit(data)}>
            重试
          </ToastAction>
        ),
      });
    } finally {
      setIsLoading(false);
    }
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
    try {
      setIsLoading(true);

      const selectedKeywords = getUniqueSelectedKeywords(selectedKeywordIds);
      const keywordsForSearch = selectedKeywords
        .map((keyword) => {
          const metadata = keywordMetadata[keyword];
          if (!metadata?.query) return null;
          return {
            keyword,
            query: metadata.query,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (keywordsForSearch.length === 0) {
        throw new Error("No valid keywords selected");
      }

      const blacklist = loadBlacklist();
      const linkMap = await fetchLinksForKeywords(
        keywordsForSearch,
        blacklist,
        preferredSites,
      );

      setKeywordMetadata((prev) => {
        const next = { ...prev };
        Object.entries(linkMap).forEach(([keyword, { link, title }]) => {
          if (next[keyword]) {
            next[keyword] = { ...next[keyword], link, title };
          }
        });
        return next;
      });

      setHasLinks(true);
    } catch (error) {
      console.error("Failed to fetch links:", error);
      toast({
        variant: "destructive",
        title: "获取链接失败",
        description: "请稍后重试",
      });
    } finally {
      setIsLoading(false);
    }
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
    <>
      <SiteHeader onLogoClick={handleNewAnalysis} />
      <main className="flex-1">
        <div className="mt-14 w-full">
          <div className="mx-auto max-w-5xl px-4">
            <KeywordEditor
              text={text}
              matches={matches}
              keywordMetadata={keywordMetadata}
              selectedKeywordIds={selectedKeywordIds}
              isLoading={isLoading}
              isEditing={isEditing}
              hasLinks={hasLinks}
              preferredSites={preferredSites}
              onSubmit={handleSubmit}
              onToggleKeyword={handleToggleKeyword}
              onConfirm={handleConfirm}
              onEditClick={handleEditClick}
            />
          </div>
        </div>
      </main>
    </>
  );
}
