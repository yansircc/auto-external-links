"use client";

import { useState } from "react";
import {
  type FormData,
  type KeywordMatch,
  type KeywordMetadata,
} from "@/components/keyword-editor/schema";
import { getKeywords, fetchLinksForKeywords } from "@/actions/keywords";
import { KeywordEditor } from "@/components/keyword-editor/editor";
import { findKeywordsInText } from "@/lib/keywords";
import { getUniqueSelectedKeywords } from "@/lib/keywords";
import { loadBlacklist } from "@/lib/blacklist";
import { SiteHeader } from "@/components/layout/site-header";

export default function Home() {
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

  // 处理表单提交
  async function handleSubmit(data: FormData) {
    try {
      setIsLoading(true);
      const result = await getKeywords(data.text);
      if (!result.object) return;

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

      // 获取选中的关键词和查询数据
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

      // 获取黑名单和链接
      const blacklist = loadBlacklist();
      const linkMap = await fetchLinksForKeywords(keywordsForSearch, blacklist);

      // 更新元数据
      setKeywordMetadata((prev) => {
        const next = { ...prev };
        Object.entries(linkMap).forEach(([keyword, { link, title }]) => {
          if (next[keyword]) {
            next[keyword] = { ...next[keyword], link, title };
          }
        });
        return next;
      });

      // 设置为有链接状态
      setHasLinks(true);
    } catch (error) {
      console.error("Failed to fetch links:", error);
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
