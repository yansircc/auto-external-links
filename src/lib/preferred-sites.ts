const STORAGE_KEY = "preferred-sites";

export interface PreferredSite {
  domain: string;
}

// 加载偏好网站列表
export function loadPreferredSites(): PreferredSite[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as PreferredSite[];
  } catch {
    return [];
  }
}

// 添加网站到偏好列表
export function addToPreferredSites(domain: string): PreferredSite[] {
  const sites = loadPreferredSites();

  // 检查是否已存在
  if (sites.some((site) => site.domain === domain)) {
    return sites;
  }

  // 检查是否超过限制
  if (sites.length >= 3) {
    return sites;
  }

  const updatedSites = [...sites, { domain }];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSites));
  return updatedSites;
}

// 从偏好列表中移除网站
export function removeFromPreferredSites(domain: string): PreferredSite[] {
  const sites = loadPreferredSites();
  const updatedSites = sites.filter((site) => site.domain !== domain);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSites));
  return updatedSites;
}

// 获取所有偏好网站域名
export function getPreferredSiteDomains(): string[] {
  return loadPreferredSites().map((site) => site.domain);
}
