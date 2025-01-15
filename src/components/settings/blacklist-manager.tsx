"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import {
  type BlacklistEntry,
  loadBlacklist,
  addToBlacklist,
  removeFromBlacklist,
} from "@/lib/blacklist";
import { useTranslations } from "next-intl";

export function BlacklistManager() {
  const [url, setUrl] = useState("");
  const [entries, setEntries] = useState<BlacklistEntry[]>(() =>
    loadBlacklist(),
  );
  const t = useTranslations('settings.blacklist');

  // 添加域名到黑名单
  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    const updatedEntries = addToBlacklist(url.trim());
    setEntries(updatedEntries);
    setUrl("");
  }

  // 从黑名单中移除域名
  function handleRemove(domain: string) {
    const updatedEntries = removeFromBlacklist(domain);
    setEntries(updatedEntries);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t('input.placeholder')}
          className="flex-1"
        />
        <Button type="submit">{t('input.add')}</Button>
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
                aria-label={t('list.remove')}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">{t('list.remove')}</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('list.empty')}
        </p>
      )}
    </div>
  );
}
