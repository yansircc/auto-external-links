/**
 * 搜索工具 Schema 定义
 * @path src/ai/tools/search/schema.ts
 */

import { z } from "zod";

// 参数 Schema
export const searchParamSchema = z.object({
	query: z
		.string()
		.min(1, "搜索关键词不能为空")
		.max(100, "搜索关键词过长")
		.describe("要搜索的关键词，必须使用英文"),
});

// Serper API 响应 Schema
const siteLink = z.object({
	title: z.string(),
	link: z.string().url(),
});

const organicResult = z.object({
	title: z.string(),
	link: z.string().url(),
	snippet: z.string().optional(),
	sitelinks: z.array(siteLink).optional(),
	position: z.number(),
});

const peopleAlsoAsk = z.object({
	question: z.string(),
	snippet: z.string().optional(),
	title: z.string(),
	link: z.string().url(),
});

export const serperResponseSchema = z.object({
	knowledgeGraph: z
		.object({
			title: z.string(),
			type: z.string().optional(),
			website: z.string().url().optional(),
			imageUrl: z.string().url().optional(),
			description: z.string().optional(),
			descriptionSource: z.string().optional(),
			descriptionLink: z.string().url().optional(),
			attributes: z.record(z.string()).optional(),
		})
		.optional(),
	organic: z.array(organicResult),
	peopleAlsoAsk: z.array(peopleAlsoAsk).optional(),
	relatedSearches: z
		.array(
			z.object({
				query: z.string(),
			}),
		)
		.optional(),
});

// 结果 Schema
export const searchResultSchema = z.object({
	query: z.string(),
	knowledgeGraph: z
		.object({
			title: z.string(),
			description: z.string().optional(),
			imageUrl: z.string().url().optional(),
			attributes: z.record(z.string()).optional(),
		})
		.optional(),
	topResults: z.array(
		z.object({
			title: z.string(),
			link: z.string().url(),
			snippet: z.string().optional(),
			position: z.number(),
		}),
	),
	relatedQuestions: z
		.array(
			z.object({
				question: z.string(),
				answer: z.string().optional(),
			}),
		)
		.optional(),
	relatedSearches: z.array(z.string()).optional(),
});

// 导出类型
export type SearchParams = z.infer<typeof searchParamSchema>;
export type SerperResponse = z.infer<typeof serperResponseSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;

// 验证函数
export const validateSerperResponse = (data: unknown): SerperResponse => {
	return serperResponseSchema.parse(data);
};

export const validateSearchResult = (data: unknown): SearchResult => {
	return searchResultSchema.parse(data);
};
