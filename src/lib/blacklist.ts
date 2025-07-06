const STORAGE_KEY = "link-blacklist";

import { catchError } from "@/utils";

export interface BlacklistEntry {
	domain: string;
	addedAt: string;
	reason?: string;
}

/**
 * 从 URL 中提取域名
 * @param url - 需要提取域名的 URL
 * @returns 提取出的域名（小写）
 */
function extractDomain(url: string): string {
	const [error, hostname] = catchError(() => new URL(url).hostname);

	if (!error && hostname) {
		return hostname.toLowerCase();
	}

	// URL 无效时，使用正则表达式提取域名
	const match = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/.exec(
		url.toLowerCase(),
	);
	return match?.[1] ?? url.toLowerCase();
}

/**
 * Get all possible domain variations
 * e.g., for "docs.example.com":
 * ["docs.example.com", "example.com"]
 */
function getDomainVariations(domain: string): string[] {
	const parts = domain.split(".");
	const variations: string[] = [];

	// Add the full domain first
	variations.push(domain);

	// If we have more than 2 parts (e.g., docs.example.com),
	// also add the main domain (example.com)
	if (parts.length > 2) {
		variations.push(parts.slice(-2).join("."));
	}

	return variations;
}

/**
 * Check if a domain matches any blacklisted domain
 */
function isDomainBlacklisted(
	domain: string,
	blacklist: BlacklistEntry[],
): boolean {
	const targetDomain = domain.toLowerCase();

	// Get all variations of the target domain
	const targetVariations = getDomainVariations(targetDomain);

	// Check if any blacklisted domain is a parent of our target domain
	return blacklist.some((entry) => {
		const blacklistedDomain = entry.domain.toLowerCase();

		// Check if the blacklisted domain matches any variation
		// or if the target domain is a subdomain of the blacklisted domain
		return targetVariations.some(
			(variation) =>
				variation === blacklistedDomain ||
				targetDomain.endsWith(`.${blacklistedDomain}`),
		);
	});
}

/**
 * 从 localStorage 加载黑名单
 */
export function loadBlacklist(): BlacklistEntry[] {
	if (typeof window === "undefined") return [];

	const [error, data] = catchError(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? (JSON.parse(stored) as BlacklistEntry[]) : [];
	});

	if (error) {
		console.error("加载黑名单失败:", error);
		return [];
	}

	return data;
}

/**
 * 保存黑名单到 localStorage
 */
export function saveBlacklist(entries: BlacklistEntry[]): void {
	if (typeof window === "undefined") return;

	const [error] = catchError(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
	});

	if (error) {
		console.error("保存黑名单失败:", error);
	}
}

/**
 * 添加域名到黑名单
 */
export function addToBlacklist(url: string, reason?: string): BlacklistEntry[] {
	const domain = extractDomain(url);
	const entries = loadBlacklist();

	// 检查域名或其变体是否已存在
	if (!isDomainBlacklisted(domain, entries)) {
		entries.push({
			domain,
			addedAt: new Date().toISOString(),
			reason,
		});
		saveBlacklist(entries);
	}

	return entries;
}

/**
 * Remove a domain from blacklist
 */
export function removeFromBlacklist(domain: string): BlacklistEntry[] {
	const entries = loadBlacklist().filter(
		(entry) => entry.domain !== domain.toLowerCase(),
	);
	saveBlacklist(entries);
	return entries;
}

/**
 * Check if a URL is blacklisted
 */
export function isBlacklisted(
	url: string,
	blacklist: BlacklistEntry[],
): boolean {
	const domain = extractDomain(url);
	return isDomainBlacklisted(domain, blacklist);
}

/**
 * Filter out blacklisted URLs from search results
 */
export function filterBlacklistedLinks<T extends { link: string | null }>(
	items: T[],
	blacklist: BlacklistEntry[],
): T[] {
	return items.filter(
		(item) => !item.link || !isBlacklisted(item.link, blacklist),
	);
}
