import type { SerperResponse } from "@/lib/serper/schema";

/**
 * 搜索选项
 */
export interface SearchOptions {
	blacklist: string[];
	preferredSites: string[];
}

/**
 * 链接搜索结果
 */
export interface LinkSearchResult {
	link: string;
	title: string;
	alternatives: {
		preferred: SerperResponse["organic"];
		regular: SerperResponse["organic"];
	};
}

/**
 * 批量搜索结果
 */
export type BatchSearchResult = Record<string, LinkSearchResult>;

/**
 * 搜索服务配置
 */
export interface SearchConfig {
	maxResults?: number;
	timeout?: number;
	retryAttempts?: number;
}
