"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSitePreferencesStore } from "@/stores/site-preferences";
import type { SettingsMessages } from "./messages";

interface PreferredSitesManagerProps {
	messages: SettingsMessages["preferred"];
}

export function PreferredSitesManager({
	messages,
}: PreferredSitesManagerProps) {
	const [url, setUrl] = useState("");
	const { preferredSites, addToPreferredSites, removeFromPreferredSites } =
		useSitePreferencesStore();

	// 添加域名到偏好网站
	function handleAdd(e: React.FormEvent) {
		e.preventDefault();
		if (!url.trim()) return;
		if (preferredSites.length >= 3) {
			alert(messages.maxLimit);
			return;
		}

		addToPreferredSites(url.trim());
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
				<Button type="submit" disabled={preferredSites.length >= 3}>
					{messages.input.add}
				</Button>
			</form>

			{preferredSites.length > 0 ? (
				<ul className="space-y-2">
					{preferredSites.map((entry) => (
						<li
							key={entry.domain}
							className="flex items-center justify-between rounded-lg border bg-card p-2 text-card-foreground"
						>
							<span className="text-sm">{entry.domain}</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => removeFromPreferredSites(entry.domain)}
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

			{preferredSites.length > 0 && (
				<p className="text-muted-foreground text-xs">{messages.message}</p>
			)}
		</div>
	);
}
