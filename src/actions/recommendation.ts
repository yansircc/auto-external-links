"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { catchError } from "@/utils";

const recommendationSchema = z.object({
	query: z
		.string()
		.describe("A search query in question form to find the best external link"),
	reason: z
		.string()
		.describe(
			"A compelling reason why the reader should explore this link, around 150 characters",
		),
});

/**
 * 为手动选择的关键词生成智能推荐语
 * @param text 原始文本内容
 * @param keyword 选中的关键词
 * @returns 包含查询和推荐理由的对象
 */
export async function generateRecommendation(
	text: string,
	keyword: string,
): Promise<{
	error?: string;
	data?: {
		query: string;
		reason: string;
	};
}> {
	const [error, result] = await catchError(
		generateObject({
			model: openai("gpt-4o-mini"),
			system: `You are a SEO expert. Given a text and a selected keyword/phrase from that text, you need to:
1. Generate a search query in question form to find the best external link for this keyword
2. Provide a brief convincing reason for the reader why they should explore the resource link

Consider the context of the keyword within the text to make the query and reason more relevant and compelling.`,
			prompt: `Text: ${text}\n\nSelected keyword: "${keyword}"`,
			schema: recommendationSchema,
		}),
		(error) => new Error("生成推荐语失败", { cause: error }),
	);

	if (error) {
		return {
			error: "生成推荐语失败，请稍后重试",
		};
	}

	return {
		data: result.object,
	};
}
