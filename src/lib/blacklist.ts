const STORAGE_KEY = "link-blacklist";

export interface BlacklistEntry {
  domain: string;
  addedAt: string; // ISO date string
  reason?: string;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.toLowerCase();
  } catch {
    // If URL is invalid, try to extract domain using regex
    const match = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/.exec(
      url.toLowerCase(),
    );
    return match?.[1] ?? url.toLowerCase();
  }
}

/**
 * Load blacklist from localStorage
 */
export function loadBlacklist(): BlacklistEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as BlacklistEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * Save blacklist to localStorage
 */
export function saveBlacklist(entries: BlacklistEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Add a domain to blacklist
 */
export function addToBlacklist(url: string, reason?: string): BlacklistEntry[] {
  const domain = extractDomain(url);
  const entries = loadBlacklist();

  // Check if domain already exists
  if (!entries.some((entry) => entry.domain === domain)) {
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
export function isBlacklisted(url: string): boolean {
  const domain = extractDomain(url);
  return loadBlacklist().some((entry) => entry.domain === domain);
}

/**
 * Filter out blacklisted URLs from search results
 */
export function filterBlacklistedLinks<T extends { link: string | null }>(
  items: T[],
): T[] {
  return items.filter((item) => !item.link || !isBlacklisted(item.link));
}
