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

  // Check if domain or any of its variations already exist
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
function isBlacklisted(url: string, blacklist: BlacklistEntry[]): boolean {
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
