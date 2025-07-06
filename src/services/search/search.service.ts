import { Errors } from "@/lib/errors/types";
import { searchGoogle } from "@/lib/serper";
import type { SerperResponse } from "@/lib/serper/schema";
import { BaseService } from "@/services/base/base.service";
import type { LinkSearchResult, SearchOptions } from "@/types/search";

/**
 * 搜索服务
 * 负责为关键词查找相关链接
 */
export class SearchService extends BaseService {
	protected readonly serviceName = "SearchService";

	/**
	 * 为多个关键词批量搜索链接
	 */
	async searchMultiple(
		keywords: Array<{ keyword: string; query: string }>,
		options: SearchOptions,
	): Promise<Record<string, LinkSearchResult>> {
		this.log("info", "Starting batch search", {
			keywordCount: keywords.length,
			hasBlacklist: options.blacklist.length > 0,
			hasPreferred: options.preferredSites.length > 0,
		});

		const results = await this.measurePerformance("batchSearch", async () => {
			const searchPromises = keywords.map(({ keyword, query }) =>
				this.searchSingle(keyword, query, options)
					.then((result) => ({ keyword, result }))
					.catch((error) => {
						this.log("warn", `Search failed for keyword: ${keyword}`, error);
						return { keyword, result: null };
					}),
			);

			const searchResults = await Promise.allSettled(searchPromises);

			const linkMap: Record<string, LinkSearchResult> = {};

			searchResults.forEach((result) => {
				if (result.status === "fulfilled" && result.value.result) {
					linkMap[result.value.keyword] = result.value.result;
				}
			});

			return linkMap;
		});

		this.log("info", "Batch search completed", {
			totalKeywords: keywords.length,
			successfulSearches: Object.keys(results).length,
		});

		return results;
	}

	/**
	 * 为单个关键词搜索链接
	 */
	private async searchSingle(
		keyword: string,
		query: string,
		options: SearchOptions,
	): Promise<LinkSearchResult | null> {
		try {
			// 使用重试机制进行搜索
			const searchResults = await this.retry(
				() => searchGoogle(query, options.preferredSites),
				{
					maxAttempts: 2,
					delay: 1000,
				},
			);

			if (!searchResults || searchResults.length === 0) {
				this.log("warn", "No search results found", { keyword, query });
				return null;
			}

			// 合并所有搜索结果
			const allResults = searchResults.flat();

			// 过滤和分类结果
			const { preferred, regular } = this.filterAndCategorizeResults(
				allResults,
				options,
			);

			// 选择最佳链接
			const bestLink = preferred[0] ?? regular[0];

			if (!bestLink) {
				this.log("warn", "No suitable link found after filtering", {
					keyword,
					query,
					totalResults: allResults.length,
					blacklistFiltered:
						allResults.length - (preferred.length + regular.length),
				});
				return null;
			}

			return {
				link: bestLink.link,
				title: bestLink.title,
				alternatives: {
					preferred,
					regular,
				},
			};
		} catch (error) {
			this.log("error", "Search failed", { keyword, query, error });

			if (error instanceof Error && error.message.includes("rate limit")) {
				throw Errors.searchService("搜索服务达到速率限制");
			}

			throw Errors.searchService(error);
		}
	}

	/**
	 * 过滤和分类搜索结果
	 */
	private filterAndCategorizeResults(
		results: SerperResponse["organic"],
		options: SearchOptions,
	): {
		preferred: SerperResponse["organic"];
		regular: SerperResponse["organic"];
	} {
		const { blacklist, preferredSites } = options;

		// 先过滤黑名单
		const filteredResults = results.filter((item) => {
			const domain = this.extractDomain(item.link);
			return domain && !blacklist.includes(domain);
		});

		// 分离偏好站点和普通站点
		const preferred: SerperResponse["organic"] = [];
		const regular: SerperResponse["organic"] = [];

		filteredResults.forEach((item) => {
			const domain = this.extractDomain(item.link);
			if (domain && preferredSites.includes(domain)) {
				preferred.push(item);
			} else {
				regular.push(item);
			}
		});

		return { preferred, regular };
	}

	/**
	 * 从 URL 提取域名
	 */
	private extractDomain(url: string): string | null {
		try {
			const { hostname } = new URL(url);
			return hostname.replace(/^www\./, "");
		} catch {
			this.log("warn", "Invalid URL encountered", { url });
			return null;
		}
	}

	/**
	 * 验证搜索选项
	 */
	validateOptions(options: SearchOptions): void {
		if (!Array.isArray(options.blacklist)) {
			throw Errors.invalidInput("blacklist", "必须是数组");
		}

		if (!Array.isArray(options.preferredSites)) {
			throw Errors.invalidInput("preferredSites", "必须是数组");
		}
	}
}
