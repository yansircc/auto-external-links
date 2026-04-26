/**
 * 证据目标工具的类型定义
 */

import { z } from "zod";

/**
 * AI 生成证据目标时的基础字段
 */
export const aiGeneratedEvidenceTargetSchema = z.object({
	anchorText: z
		.string()
		.min(1)
		.describe(
			"Exact text from the article where the supporting link should be attached.",
		),
	claim: z
		.string()
		.min(1)
		.describe("The unsupported or weakly supported claim in the article."),
	evidenceGap: z
		.string()
		.min(1)
		.describe("Why this claim needs external evidence."),
	queries: z
		.array(z.string().min(1))
		.min(1)
		.max(3)
		.describe(
			"English Google queries that can find neutral supporting evidence for the claim.",
		),
	reason: z
		.string()
		.describe(
			"Short citation note explaining how the source supports the claim.",
		),
});

/**
 * 完整的证据目标信息（包含链接信息）
 */
export const completeEvidenceTargetSchema =
	aiGeneratedEvidenceTargetSchema.extend({
		id: z.string(),
		query: z.string(),
		link: z.string().url().nullable(),
		title: z.string().nullable(),
	});

// 类型导出
export type AIGeneratedEvidenceTarget = z.infer<
	typeof aiGeneratedEvidenceTargetSchema
>;
export type CompleteEvidenceTarget = z.infer<
	typeof completeEvidenceTargetSchema
>;
