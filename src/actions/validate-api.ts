"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, type LanguageModel } from "ai";
import { env } from "@/env";
import { catchError } from "@/utils";

/**
 * 验证 API 配置
 * @param apiKey API Key
 * @param baseUrl Base URL (可选)
 * @param model 模型名称
 * @returns 验证结果
 */
export async function validateAPIConfiguration(
	apiKey?: string,
	baseUrl?: string,
	model?: string,
): Promise<{
	success: boolean;
	message: string;
	details?: {
		provider: string;
		model: string;
		responseTime: number;
	};
}> {
	const startTime = Date.now();

	try {
		// 配置 AI 模型
		let aiModel: LanguageModel;
		let provider = "OpenAI";

		if (apiKey) {
			// 使用用户提供的 API key
			if (baseUrl && baseUrl !== "https://api.openai.com/v1") {
				provider = "第三方服务";
			}
			const customOpenAI = createOpenAI({
				apiKey,
				baseURL: baseUrl,
			});
			aiModel = customOpenAI(model || "gpt-4o-mini");
		} else if (env.OPENAI_API_KEY) {
			// 使用服务器端的 API key（仅用于测试，实际不应该这样）
			return {
				success: false,
				message: "请使用您自己的 API Key 进行验证",
			};
		} else {
			return {
				success: false,
				message: "请先设置 API Key",
			};
		}

		// 发送一个简单的测试请求
		const [error] = await catchError(
			generateText({
				model: aiModel,
				prompt: "Say 'Hello' in one word",
				maxTokens: 10,
			}),
		);

		if (error) {
			// 分析错误类型
			const errorMessage = error.message || error.toString();

			if (
				errorMessage.includes("401") ||
				errorMessage.includes("Unauthorized")
			) {
				return {
					success: false,
					message: "API Key 无效，请检查是否正确",
				};
			}

			if (errorMessage.includes("404")) {
				return {
					success: false,
					message: `模型 "${model || "gpt-4o-mini"}" 不存在，请检查模型名称`,
				};
			}

			if (errorMessage.includes("429")) {
				return {
					success: false,
					message: "API 请求频率限制，请稍后再试",
				};
			}

			if (
				errorMessage.includes("ENOTFOUND") ||
				errorMessage.includes("ECONNREFUSED")
			) {
				return {
					success: false,
					message: "无法连接到 API 服务器，请检查 Base URL",
				};
			}

			return {
				success: false,
				message: `验证失败: ${errorMessage}`,
			};
		}

		const responseTime = Date.now() - startTime;

		return {
			success: true,
			message: "API 配置验证成功！",
			details: {
				provider,
				model: model || "gpt-4o-mini",
				responseTime,
			},
		};
	} catch (error) {
		console.error("API 验证失败:", error);
		return {
			success: false,
			message: "验证过程中发生未知错误",
		};
	}
}
