"use client";

import { useEffect } from "react";
import { type EditorMessages } from "./core/messages";
import { KeywordEditor } from "@/components/keyword-editor/editor";
import { useFingerprint } from "../fingerprint/use-fingerprint";
import { useKeywordEditorStore } from "@/stores/keyword-editor";
import { useSitePreferencesStore } from "@/stores/site-preferences";

/**
 * 关键词编辑器容器组件
 * 处理状态管理和用户交互逻辑
 */
export function KeywordEditorContainer({
  messages,
}: {
  messages: EditorMessages;
}) {
  const fingerprint = useFingerprint();
  const { handleSubmit, setPreferredSites } = useKeywordEditorStore();
  const { preferredSites } = useSitePreferencesStore();

  // 同步偏好站点到编辑器状态
  useEffect(() => {
    setPreferredSites(preferredSites.map((site) => site.domain));
  }, [preferredSites, setPreferredSites]);

  return (
    <KeywordEditor
      messages={messages}
      onSubmit={(data) => handleSubmit(data, fingerprint ?? undefined)}
    />
  );
}
