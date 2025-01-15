"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import {
  type PreferredSite,
  loadPreferredSites,
  addToPreferredSites,
  removeFromPreferredSites,
} from "@/lib/preferred-sites";

export function PreferredSitesManager() {
  const [url, setUrl] = useState("");
  const [entries, setEntries] = useState<PreferredSite[]>(() =>
    loadPreferredSites(),
  );

  // 添加域名到偏好网站
  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    if (entries.length >= 3) {
      alert("最多只能添加3个偏好网站");
      return;
    }

    const updatedEntries = addToPreferredSites(url.trim());
    setEntries(updatedEntries);
    setUrl("");
  }

  // 从偏好网站中移除域名
  function handleRemove(domain: string) {
    const updatedEntries = removeFromPreferredSites(domain);
    setEntries(updatedEntries);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入偏好的网址 (例如: arxiv.org)"
          className="flex-1"
        />
        <Button type="submit" disabled={entries.length >= 3}>
          添加
        </Button>
      </form>

      {entries.length > 0 ? (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.domain}
              className="flex items-center justify-between rounded-lg border bg-card p-2 text-card-foreground"
            >
              <span className="text-sm">{entry.domain}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(entry.domain)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">删除</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">暂无偏好网站</p>
      )}

      {entries.length > 0 && (
        <p className="text-xs text-muted-foreground">
          搜索时会优先展示来自这些网站的结果
        </p>
      )}
    </div>
  );
}
