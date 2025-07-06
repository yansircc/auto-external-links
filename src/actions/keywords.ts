"use server";

import { createOpenAI, openai } from "@ai-sdk/openai";
import { generateObject, type LanguageModel } from "ai";
import { z } from "zod";
import { auth } from "@/auth";
import { env } from "@/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { searchGoogle } from "@/lib/serper";
import type { SerperResponse } from "@/lib/serper/schema";
import { catchError } from "@/utils";
import { aiGeneratedKeywordSchema, type CompleteKeyword } from "./schema";

/**
 * 关键词分析响应
 */
interface KeywordsAnalysisResponse {
	error?: {
		code: "RATE_LIMITED" | "AI_ERROR";
		message: string;
	};
	data?: {
		keywords: CompleteKeyword[];
		usage: {
			promptTokens: number;
			completionTokens: number;
			totalTokens: number;
		};
	};
}

/**
 * 创建动态的关键词数组模式
 */
function createDynamicKeywordsSchema(keywordCount: number) {
	return z.object({
		keywords: z
			.array(aiGeneratedKeywordSchema)
			.min(Math.min(keywordCount, 2))
			.max(keywordCount)
			.describe(
				`Extract exactly ${keywordCount} most important keywords/phrases from the text. Each keyword should be unique and valuable for SEO.`,
			),
	});
}

/**
 * 计算推荐的关键词数量
 * 每1000字符推荐2个关键词，最少2个，最多20个
 */
function calculateKeywordCount(text: string): number {
	const charCount = text.length;
	const calculatedCount = Math.floor(charCount / 1000) * 2;
	const keywordCount = Math.max(2, Math.min(20, calculatedCount));
	return keywordCount;
}

/**
 * 分析文本获取关键词
 */
export async function getKeywords(
	text: string,
	fingerprint?: string,
	existingKeywordCount = 0,
	userApiKey?: string,
	userBaseUrl?: string,
	userModel?: string,
): Promise<KeywordsAnalysisResponse> {
	// 1. 检查用户是否已登录
	const session = await auth();
	const isAuthenticated = !!session?.user;

	// 2. 如果未登录且没有提供用户 API key，检查是否超出访问限制
	if (!isAuthenticated && !userApiKey) {
		const { remaining } = await checkRateLimit(fingerprint, false);
		if (remaining <= 0) {
			return {
				error: {
					code: "RATE_LIMITED",
					message:
						"未注册用户每日使用次数有限，请登录后继续使用或设置您自己的 API Key",
				},
			};
		}
	}

	// 3. 计算推荐的关键词数量，考虑已有的关键词
	const baseRecommendedCount = calculateKeywordCount(text);
	const availableSlots = Math.max(0, 20 - existingKeywordCount);
	const recommendedKeywordCount = Math.min(
		baseRecommendedCount,
		availableSlots,
	);

	// 如果没有可用的空位，直接返回
	if (recommendedKeywordCount === 0) {
		return {
			error: {
				code: "AI_ERROR",
				message: "已达到关键词数量上限（20个），无法添加更多关键词",
			},
		};
	}

	const dynamicSchema = createDynamicKeywordsSchema(recommendedKeywordCount);

	// 4. 配置 AI 模型
	let aiModel: LanguageModel;
	if (userApiKey) {
		// 使用用户提供的 API key
		const customOpenAI = createOpenAI({
			apiKey: userApiKey,
			baseURL: userBaseUrl,
		});
		aiModel = customOpenAI(userModel || "gpt-4o-mini");
	} else if (env.OPENAI_API_KEY) {
		// 使用服务器端的 API key
		aiModel = openai(userModel || "gpt-4o-mini");
	} else {
		// 没有可用的 API key
		return {
			error: {
				code: "AI_ERROR",
				message: "请先设置您的 OpenAI API Key",
			},
		};
	}

	// 5. 继续原有的关键词分析逻辑
	const [error, result] = await catchError(
		generateObject({
			model: aiModel,
			system: `
    You are a SEO expert, you need to:
    1. Select exactly ${recommendedKeywordCount} most valuable keywords/phrases from the text (never select from the heading or title)
    2. For each keyword:
      - Extract the exact keyword or phrase from the text (maintain original case and format). Each should be unique, never repeat.
      - Generate a search query in question form to find the best external link
      - Provide a brief convincing reason for the reader why they should explore the resource link
    
    IMPORTANT: You MUST extract exactly ${recommendedKeywordCount} keywords, no more, no less.`,
			prompt: text,
			schema: dynamicSchema,
		}),
		(error) => new Error("分析文本失败", { cause: error }),
	);

	// 6. 如果分析成功且用户未登录，增加使用次数
	if (!error && !isAuthenticated && !userApiKey) {
		// 只有在使用服务器端 API key 时才计算使用次数
		await checkRateLimit(fingerprint, true);
	}

	if (error) {
		console.error("关键词分析失败:", error);
		return {
			error: {
				code: "AI_ERROR",
				message: `关键词分析失败: ${error.cause || "未知错误"}`,
			},
		};
	}

	// 将 AI 生成的关键词转换为完整格式
	const completeKeywords: CompleteKeyword[] = result.object.keywords.map(
		(keyword) => ({
			...keyword,
			link: null,
			title: null,
		}),
	);

	return {
		data: {
			keywords: completeKeywords,
			usage: {
				promptTokens: result.usage.promptTokens,
				completionTokens: result.usage.completionTokens,
				totalTokens: result.usage.totalTokens,
			},
		},
	};
}

/**
 * 链接搜索结果
 */
interface LinkSearchResult {
	link: string;
	title: string;
	alternatives: {
		preferred: SerperResponse["organic"];
		regular: SerperResponse["organic"];
	};
}

/**
 * 为关键词获取外部链接
 * @param keywords 关键词列表（需包含 keyword 和 query）
 * @param blacklist 黑名单域名列表
 * @param preferredSites 偏好站点列表
 * @returns 关键词到链接的映射
 */
export async function fetchLinksForKeywords(
	keywords: Array<Pick<CompleteKeyword, "keyword" | "query">>,
	blacklist: string[],
	preferredSites: string[],
): Promise<Record<string, LinkSearchResult>> {
	const linkMap: Record<string, LinkSearchResult> = {};

	// 并行搜索所有关键词
	await Promise.all(
		keywords.map(async ({ keyword, query }) => {
			const [error, results] = await catchError(
				searchGoogle(query, preferredSites),
			);
			if (error || !results?.length) return;

			// 合并所有搜索结果
			const allResults = results.flat();

			// 过滤搜索结果
			const filteredResults = allResults.filter((item) => {
				try {
					const domain = new URL(item.link).hostname.replace(/^www\./, "");
					return !blacklist.includes(domain);
				} catch {
					return false;
				}
			});

			// 分离偏好站点和普通站点
			const [preferred, regular] = filteredResults.reduce<
				[SerperResponse["organic"], SerperResponse["organic"]]
			>(
				(acc, item) => {
					try {
						const domain = new URL(item.link).hostname.replace(/^www\./, "");
						if (preferredSites.includes(domain)) {
							return [[...acc[0], item], acc[1]];
						}
						return [acc[0], [...acc[1], item]];
					} catch {
						return acc;
					}
				},
				[[], []],
			);

			// 选择最佳链接
			const bestLink = preferred[0] ?? regular[0];
			if (bestLink) {
				linkMap[keyword] = {
					link: bestLink.link,
					title: bestLink.title,
					alternatives: {
						preferred,
						regular,
					},
				};
			}
		}),
	);

	return linkMap;
}
