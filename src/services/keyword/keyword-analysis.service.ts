import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { aiGeneratedKeywordSchema } from "@/actions/schema";
import { AppError, Errors } from "@/lib/errors/types";
import { BaseService } from "@/services/base/base.service";
import type { KeywordAnalysisResult, KeywordMetadata } from "@/types/keywords";

/**
 * 关键词分析服务
 * 负责从文本中提取关键词并生成搜索建议
 */
export class KeywordAnalysisService extends BaseService {
	protected readonly serviceName = "KeywordAnalysisService";

	/**
	 * AI 提取的关键词结构
	 */
	private readonly keywordResponseSchema = z.object({
		keywords: z
			.array(aiGeneratedKeywordSchema)
			.min(1)
			.max(3)
			.describe(
				"The most important keywords information extracted from the original text",
			),
	});

	/**
	 * 分析文本并提取关键词
	 */
	async analyzeText(text: string): Promise<KeywordAnalysisResult> {
		this.log("info", "Starting text analysis", { textLength: text.length });

		return this.measurePerformance("analyzeText", async () => {
			try {
				const result = await this.extractKeywordsFromAI(text);
				const transformedResult = this.transformAIResult(result);

				this.log("info", "Text analysis completed", {
					keywordCount: transformedResult.keywords.length,
					usage: transformedResult.usage,
				});

				return transformedResult;
			} catch (error) {
				this.log("error", "Text analysis failed", error);

				if (error instanceof AppError) {
					throw error;
				}

				throw Errors.aiService(error);
			}
		});
	}

	/**
	 * 调用 AI 服务提取关键词
	 */
	private async extractKeywordsFromAI(text: string) {
		try {
			const result = await generateObject({
				model: openai("gpt-4o-mini"),
				system: `
You are a SEO expert, you need to:
1. Select 1~3 most valuable keywords/phrases from the text(never select from the heading or title)
2. For each keyword:
   - Extract the exact keyword or phrase from the text (maintain original case and format). Each should be unique, never repeat.
   - Generate a search query in question form to find the best external link
   - Provide a brief convincing reason for the reader why they should explore the resource link`,
				prompt: text,
				schema: this.keywordResponseSchema,
			});

			return result;
		} catch (error) {
			if (error instanceof Error) {
				// 检查是否是速率限制错误
				if (error.message.includes("rate limit")) {
					throw Errors.rateLimited();
				}

				// 检查是否是 token 限制错误
				if (error.message.includes("maximum context length")) {
					throw Errors.invalidInput("text", "文本过长，请缩短后重试");
				}
			}

			throw error;
		}
	}

	/**
	 * 转换 AI 响应为统一格式
	 */
	private transformAIResult(aiResult: {
		object: { keywords: z.infer<typeof aiGeneratedKeywordSchema>[] };
		finishReason: string;
		usage: {
			promptTokens: number;
			completionTokens: number;
			totalTokens: number;
		};
	}): KeywordAnalysisResult {
		const keywords = aiResult.object.keywords.map((item) => item.keyword);

		const metadata: Record<string, KeywordMetadata> = {};
		aiResult.object.keywords.forEach((item) => {
			metadata[item.keyword] = {
				keyword: item.keyword,
				query: item.query,
				reason: item.reason,
				link: null,
				title: null,
				alternatives: {
					preferred: [],
					regular: [],
				},
			};
		});

		return {
			keywords,
			metadata,
			usage: {
				promptTokens: aiResult.usage.promptTokens,
				completionTokens: aiResult.usage.completionTokens,
				totalTokens: aiResult.usage.totalTokens,
			},
		};
	}

	/**
	 * 验证分析结果
	 */
	validateResult(result: KeywordAnalysisResult): void {
		if (!result.keywords || result.keywords.length === 0) {
			throw Errors.aiResponseInvalid({
				message: "未能从文本中提取关键词",
				result,
			});
		}

		// 确保每个关键词都有对应的元数据
		for (const keyword of result.keywords) {
			if (!result.metadata[keyword]) {
				throw Errors.aiResponseInvalid({
					message: `关键词 "${keyword}" 缺少元数据`,
					result,
				});
			}
		}
	}
}
