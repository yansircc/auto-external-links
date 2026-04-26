"use server";

import { createOpenAI, openai } from "@ai-sdk/openai";
import { generateObject, type LanguageModel } from "ai";
import { z } from "zod";
import { env } from "@/env";
import { catchError } from "@/utils";

const evidenceRecommendationSchema = z.object({
	claim: z
		.string()
		.describe("The claim supported by the selected anchor text."),
	evidenceGap: z
		.string()
		.describe("Why this claim needs an external support source."),
	queries: z
		.array(z.string().min(1))
		.min(1)
		.max(3)
		.describe("English Google queries for neutral supporting evidence."),
	reason: z
		.string()
		.describe("Short citation note explaining why the source is useful."),
});

function createAIModel(
	userApiKey?: string,
	userBaseUrl?: string,
	userModel?: string,
): LanguageModel | null {
	if (userApiKey) {
		const customOpenAI = createOpenAI({
			apiKey: userApiKey,
			baseURL: userBaseUrl,
		});
		return customOpenAI(userModel || "gpt-4o-mini");
	}

	if (env.OPENAI_API_KEY) {
		return openai(userModel || "gpt-4o-mini");
	}

	return null;
}

/**
 * 为手动选择的证据锚点生成目标元数据
 */
export async function generateEvidenceRecommendation(
	text: string,
	anchorText: string,
	userApiKey?: string,
	userBaseUrl?: string,
	userModel?: string,
): Promise<{
	error?: string;
	data?: {
		claim: string;
		evidenceGap: string;
		queries: string[];
		reason: string;
	};
}> {
	const aiModel = createAIModel(userApiKey, userBaseUrl, userModel);
	if (!aiModel) {
		return {
			error: "请先设置您的 OpenAI API Key",
		};
	}

	const [error, result] = await catchError(
		generateObject({
			model: aiModel,
			system: `You are an evidence editor. Given an English article and a selected exact anchor text, identify the claim it belongs to and generate English Google queries for neutral support. Prefer Wikipedia, papers, research labs, universities, government, and international institutions. Avoid competitor/vendor resources unless they are directly relevant.`,
			prompt: `Article:\n${text}\n\nSelected anchor text: "${anchorText}"`,
			schema: evidenceRecommendationSchema,
		}),
		(error) => new Error("生成证据目标失败", { cause: error }),
	);

	if (error) {
		return {
			error: "生成证据目标失败，请稍后重试",
		};
	}

	return {
		data: result.object,
	};
}
