import { findKeywordsInText } from "@/lib/keywords";
import { AuthService } from "@/services/auth/auth.service";
import { RateLimitService } from "@/services/auth/rate-limit.service";
import { BaseService } from "@/services/base/base.service";
import { SearchService } from "@/services/search/search.service";
import type { ProcessedKeywordResult } from "@/types/keywords";
import type { SearchOptions } from "@/types/search";
import { KeywordAnalysisService } from "./keyword-analysis.service";

/**
 * 关键词服务主类
 * 协调各个子服务完成完整的关键词分析和链接生成流程
 */
export class KeywordService extends BaseService {
	protected readonly serviceName = "KeywordService";

	private readonly analysisService: KeywordAnalysisService;
	private readonly searchService: SearchService;
	private readonly authService: AuthService;
	private readonly rateLimitService: RateLimitService;

	constructor() {
		super();
		this.analysisService = new KeywordAnalysisService();
		this.searchService = new SearchService();
		this.authService = new AuthService();
		this.rateLimitService = new RateLimitService();
	}

	/**
	 * 分析文本并提取关键词
	 * 包含认证和限流检查
	 */
	async analyzeText(
		text: string,
		fingerprint?: string,
	): Promise<ProcessedKeywordResult> {
		this.log("info", "Starting keyword analysis", {
			textLength: text.length,
			hasFingerprint: !!fingerprint,
		});

		return this.measurePerformance("analyzeTextWithAuth", async () => {
			// 1. 检查认证状态
			const isAuthenticated = await this.authService.isAuthenticated();

			// 2. 未认证用户需要检查限流
			if (!isAuthenticated) {
				await this.rateLimitService.enforceLimit(fingerprint);
			}

			try {
				// 3. 执行关键词分析
				const analysisResult = await this.analysisService.analyzeText(text);

				// 4. 验证结果
				this.analysisService.validateResult(analysisResult);

				// 5. 查找关键词在文本中的位置
				const matches = findKeywordsInText(text, analysisResult.keywords);

				// 6. 分析成功，未认证用户增加使用次数
				if (!isAuthenticated) {
					await this.rateLimitService.increment(fingerprint);
				}

				// 7. 返回处理后的结果
				return {
					success: true,
					data: {
						text,
						matches,
						keywords: analysisResult.keywords,
						metadata: analysisResult.metadata,
						usage: analysisResult.usage,
					},
				};
			} catch (error) {
				this.log("error", "Keyword analysis failed", error);
				throw error;
			}
		});
	}

	/**
	 * 为关键词批量获取链接
	 */
	async fetchLinksForKeywords(
		keywords: Array<{ keyword: string; query: string }>,
		searchOptions: SearchOptions,
	): Promise<Record<string, any>> {
		this.log("info", "Fetching links for keywords", {
			keywordCount: keywords.length,
			hasBlacklist: searchOptions.blacklist.length > 0,
			hasPreferred: searchOptions.preferredSites.length > 0,
		});

		return this.measurePerformance("fetchLinks", async () => {
			// 验证搜索选项
			this.searchService.validateOptions(searchOptions);

			// 执行批量搜索
			const searchResults = await this.searchService.searchMultiple(
				keywords,
				searchOptions,
			);

			this.log("info", "Link fetching completed", {
				requestedKeywords: keywords.length,
				foundLinks: Object.keys(searchResults).length,
			});

			return searchResults;
		});
	}

	/**
	 * 获取用户的使用统计
	 */
	async getUsageStats(fingerprint?: string) {
		const isAuthenticated = await this.authService.isAuthenticated();

		if (isAuthenticated) {
			return {
				isAuthenticated: true,
				unlimited: true,
			};
		}

		const stats = await this.rateLimitService.getUsageStats(fingerprint);

		return {
			isAuthenticated: false,
			unlimited: false,
			...stats,
		};
	}

	/**
	 * 检查服务健康状态
	 */
	async healthCheck(): Promise<{
		healthy: boolean;
		services: Record<string, boolean>;
	}> {
		const checks = await Promise.allSettled([
			this.authService.getSession(),
			this.rateLimitService.getConfig(),
		]);

		const services = {
			auth: checks[0].status === "fulfilled",
			rateLimit: checks[1].status === "fulfilled",
		};

		return {
			healthy: Object.values(services).every((v) => v),
			services,
		};
	}
}
