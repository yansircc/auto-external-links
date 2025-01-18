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
import { type SettingsMessages } from "./messages";

interface PreferredSitesManagerProps {
  messages: SettingsMessages["preferred"];
}

export function PreferredSitesManager({
  messages,
}: PreferredSitesManagerProps) {
  const [url, setUrl] = useState("");
  const [entries, setEntries] = useState<PreferredSite[]>(() =>
    loadPreferredSites(),
  );

  // 添加域名到偏好网站
  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    if (entries.length >= 3) {
      alert(messages.maxLimit);
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
          placeholder={messages.input.placeholder}
          className="flex-1"
        />
        <Button type="submit" disabled={entries.length >= 3}>
          {messages.input.add}
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
                aria-label={messages.list.remove}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">{messages.list.remove}</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{messages.list.empty}</p>
      )}

      {entries.length > 0 && (
        <p className="text-xs text-muted-foreground">{messages.message}</p>
      )}
    </div>
  );
}
