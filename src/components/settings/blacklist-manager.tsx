"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSitePreferencesStore } from "@/stores/site-preferences";
import type { SettingsMessages } from "./messages";

interface BlacklistManagerProps {
	messages: SettingsMessages["blacklist"];
}

export function BlacklistManager({ messages }: BlacklistManagerProps) {
	const [url, setUrl] = useState("");
	const { blacklist, addToBlacklist, removeFromBlacklist } =
		useSitePreferencesStore();

	// 添加域名到黑名单
	function handleAdd(e: React.FormEvent) {
		e.preventDefault();
		if (!url.trim()) return;

		addToBlacklist(url.trim());
		setUrl("");
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
				<Button type="submit">{messages.input.add}</Button>
			</form>

			{blacklist.length > 0 ? (
				<ul className="space-y-2">
					{blacklist.map((entry) => (
						<li
							key={entry.domain}
							className="flex items-center justify-between rounded-lg border bg-card p-2 text-card-foreground"
						>
							<span className="text-sm">{entry.domain}</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => removeFromBlacklist(entry.domain)}
								aria-label={messages.list.remove}
							>
								<Trash2 className="h-4 w-4" />
								<span className="sr-only">{messages.list.remove}</span>
							</Button>
						</li>
					))}
				</ul>
			) : (
				<p className="text-muted-foreground text-sm">{messages.list.empty}</p>
			)}
		</div>
	);
}
