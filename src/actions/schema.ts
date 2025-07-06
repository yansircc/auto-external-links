/**
 * 关键词工具的类型定义
 */

import { z } from "zod";

/**
 * AI 生成关键词时的基础字段
 */
export const aiGeneratedKeywordSchema = z.object({
	keyword: z
		.string()
		.min(1)
		.describe(
			"Keyword from the original text, should be exactly the same, including case and format.",
		),
	query: z
		.string()
		.min(1)
		.describe(
			"Used to search for the best external link on Google, should be a question.",
		),
	reason: z
		.string()
		.describe(
			"Convince the reader to explore this link behind the keyword or phrase, around 150 characters.",
		),
});

/**
 * 完整的关键词信息（包含链接信息）
 */
export const completeKeywordSchema = aiGeneratedKeywordSchema.extend({
	link: z.string().url().nullable(),
	title: z.string().nullable(),
});

// 类型导出
export type AIGeneratedKeyword = z.infer<typeof aiGeneratedKeywordSchema>;
export type CompleteKeyword = z.infer<typeof completeKeywordSchema>;
