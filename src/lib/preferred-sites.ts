import { catchError } from "@/utils/catch-error";

const STORAGE_KEY = "preferred-sites";

export interface PreferredSite {
	domain: string;
}

/**
 * 加载偏好网站列表
 * @returns PreferredSite[] 偏好网站列表
 */
export function loadPreferredSites(): PreferredSite[] {
	if (typeof window === "undefined") return [];

	const [error, data] = catchError(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? (JSON.parse(stored) as PreferredSite[]) : [];
	});

	if (error) {
		console.error("加载偏好网站失败:", error);
		return [];
	}

	return data;
}

/**
 * 添加网站到偏好列表
 * @param domain - 要添加的域名
 * @returns PreferredSite[] 更新后的偏好网站列表
 */
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

	const [error] = catchError(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSites));
	});

	if (error) {
		console.error("保存偏好网站失败:", error);
		return sites; // 保存失败时返回原列表
	}

	return updatedSites;
}

/**
 * 从偏好列表中移除网站
 * @param domain - 要移除的域名
 * @returns PreferredSite[] 更新后的偏好网站列表
 */
export function removeFromPreferredSites(domain: string): PreferredSite[] {
	const sites = loadPreferredSites();
	const updatedSites = sites.filter((site) => site.domain !== domain);

	const [error] = catchError(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSites));
	});

	if (error) {
		console.error("保存偏好网站失败:", error);
		return sites; // 保存失败时返回原列表
	}

	return updatedSites;
}

/**
 * 获取所有偏好网站域名
 * @returns string[] 偏好网站域名列表
 */
export function getPreferredSiteDomains(): string[] {
	return loadPreferredSites().map((site) => site.domain);
}
