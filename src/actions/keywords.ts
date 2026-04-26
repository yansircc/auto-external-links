"use server";

import { createOpenAI, openai } from "@ai-sdk/openai";
import { generateObject, type LanguageModel } from "ai";
import { z } from "zod";
import { auth } from "@/auth";
import { env } from "@/env";
import { AUTO_EVIDENCE_TARGET_LIMIT } from "@/lib/evidence-targets";
import { createEvidenceTargetId } from "@/lib/keywords";
import { checkRateLimit } from "@/lib/rate-limit";
import { searchGoogle } from "@/lib/serper";
import type { SerperResponse } from "@/lib/serper/schema";
import type {
	EvidenceCandidate,
	EvidenceTargetMetadata,
	SourceCategory,
} from "@/types/keywords";
import { catchError } from "@/utils";
import {
	aiGeneratedEvidenceTargetSchema,
	type CompleteEvidenceTarget,
} from "./schema";

interface EvidenceAnalysisResponse {
	error?: {
		code: "RATE_LIMITED" | "AI_ERROR";
		message: string;
	};
	data?: {
		targets: CompleteEvidenceTarget[];
		usage: {
			promptTokens: number;
			completionTokens: number;
			totalTokens: number;
		};
	};
}

interface LinkSearchResult {
	link: string;
	title: string;
	alternatives: EvidenceTargetMetadata["alternatives"];
}

const NEUTRAL_DOMAIN_SUFFIXES = [
	".edu",
	".gov",
	".int",
	"wikipedia.org",
	"ncbi.nlm.nih.gov",
	"pubmed.ncbi.nlm.nih.gov",
	"who.int",
	"oecd.org",
	"worldbank.org",
	"imf.org",
	"nist.gov",
	"census.gov",
	"arxiv.org",
];

function createDynamicEvidenceSchema(targetCount: number) {
	return z.object({
		targets: z
			.array(aiGeneratedEvidenceTargetSchema)
			.min(Math.min(targetCount, 2))
			.max(targetCount)
			.describe(
				`Extract exactly ${targetCount} unsupported claims that need neutral external evidence.`,
			),
	});
}

/**
 * 每 1000 字符推荐 2 个证据目标，最少 2 个，最多自动上限
 */
function calculateTargetCount(text: string): number {
	const charCount = text.length;
	const calculatedCount = Math.floor(charCount / 1000) * 2;
	return Math.max(2, Math.min(AUTO_EVIDENCE_TARGET_LIMIT, calculatedCount));
}

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

function normalizeDomain(url: string): string | null {
	try {
		return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
	} catch {
		return null;
	}
}

function matchesDomain(domain: string, expectedDomain: string): boolean {
	return domain === expectedDomain || domain.endsWith(`.${expectedDomain}`);
}

function isNeutralDomain(domain: string): boolean {
	return NEUTRAL_DOMAIN_SUFFIXES.some((suffix) =>
		suffix.startsWith(".")
			? domain.endsWith(suffix)
			: matchesDomain(domain, suffix),
	);
}

function getSourceCategory(
	domain: string,
	preferredSites: string[],
): SourceCategory {
	if (isNeutralDomain(domain)) return "neutral";
	if (preferredSites.some((site) => matchesDomain(domain, site))) {
		return "preferred";
	}
	return "regular";
}

function isBlacklisted(domain: string, blacklist: string[]): boolean {
	return blacklist.some((blockedDomain) =>
		matchesDomain(domain, blockedDomain),
	);
}

function toEvidenceCandidate(
	item: SerperResponse["organic"][number],
	preferredSites: string[],
): EvidenceCandidate | null {
	const domain = normalizeDomain(item.link);
	if (!domain) return null;

	return {
		...item,
		domain,
		sourceCategory: getSourceCategory(domain, preferredSites),
	};
}

function rankCandidate(candidate: EvidenceCandidate): number {
	const sourceWeight = {
		neutral: 300,
		preferred: 200,
		regular: 100,
	}[candidate.sourceCategory];

	return sourceWeight - candidate.position;
}

function dedupeCandidates(
	candidates: EvidenceCandidate[],
): EvidenceCandidate[] {
	const seen = new Set<string>();
	const result: EvidenceCandidate[] = [];

	for (const candidate of candidates) {
		if (seen.has(candidate.link)) continue;
		seen.add(candidate.link);
		result.push(candidate);
	}

	return result;
}

function categorizeCandidates(candidates: EvidenceCandidate[]) {
	const sortedCandidates = [...candidates].sort(
		(a, b) => rankCandidate(b) - rankCandidate(a),
	);

	return {
		neutral: sortedCandidates.filter(
			(candidate) => candidate.sourceCategory === "neutral",
		),
		preferred: sortedCandidates.filter(
			(candidate) => candidate.sourceCategory === "preferred",
		),
		regular: sortedCandidates.filter(
			(candidate) => candidate.sourceCategory === "regular",
		),
	};
}

/**
 * 分析英文文章，找出需要证据支持的观点
 */
export async function analyzeEvidenceTargets(
	text: string,
	fingerprint?: string,
	existingTargetCount = 0,
	userApiKey?: string,
	userBaseUrl?: string,
	userModel?: string,
): Promise<EvidenceAnalysisResponse> {
	const session = await auth();
	const isAuthenticated = !!session?.user;

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

	const availableSlots = Math.max(
		0,
		AUTO_EVIDENCE_TARGET_LIMIT - existingTargetCount,
	);
	const recommendedTargetCount = Math.min(
		calculateTargetCount(text),
		availableSlots,
	);

	if (recommendedTargetCount === 0) {
		return {
			error: {
				code: "AI_ERROR",
				message: `已达到自动证据目标数量上限（${AUTO_EVIDENCE_TARGET_LIMIT}个），请手动添加更多目标`,
			},
		};
	}

	const aiModel = createAIModel(userApiKey, userBaseUrl, userModel);
	if (!aiModel) {
		return {
			error: {
				code: "AI_ERROR",
				message: "请先设置您的 OpenAI API Key",
			},
		};
	}

	const [error, result] = await catchError(
		generateObject({
			model: aiModel,
			system: `
You are an evidence editor for English Markdown articles.

Find claims that would be stronger with external support. Do not extract generic SEO keywords.

For each evidence target:
1. Identify one unsupported or weakly supported claim from the article.
2. Choose the exact anchorText from the article where a citation should be inserted.
3. Explain the evidenceGap.
4. Write 1-3 English Google queries that can find neutral support, preferring Wikipedia, papers, research labs, universities, government, and international institutions.
5. Write a structured citationNote, not a recommendation. The citationText must read like a scholarly footnote: state what the source supports, avoid promotional language, and include a limitation when the support is contextual rather than direct proof.

Avoid competitor/vendor resources unless the article directly discusses that entity.
Return exactly ${recommendedTargetCount} targets.`,
			prompt: text,
			schema: createDynamicEvidenceSchema(recommendedTargetCount),
		}),
		(error) => new Error("分析证据目标失败", { cause: error }),
	);

	if (!error && !isAuthenticated && !userApiKey) {
		await checkRateLimit(fingerprint, true);
	}

	if (error) {
		console.error("证据目标分析失败:", error);
		return {
			error: {
				code: "AI_ERROR",
				message: `证据目标分析失败: ${error.cause || "未知错误"}`,
			},
		};
	}

	const completeTargets = result.object.targets.map((target, index) => ({
		...target,
		id: createEvidenceTargetId(target.anchorText, existingTargetCount + index),
		query: target.queries[0] ?? target.claim,
		link: null,
		title: null,
	}));

	return {
		data: {
			targets: completeTargets,
			usage: {
				promptTokens: result.usage.promptTokens,
				completionTokens: result.usage.completionTokens,
				totalTokens: result.usage.totalTokens,
			},
		},
	};
}

/**
 * 为证据目标获取外部支持链接
 */
export async function fetchLinksForEvidenceTargets(
	targets: Array<Pick<CompleteEvidenceTarget, "id" | "queries">>,
	blacklist: string[],
	preferredSites: string[],
): Promise<Record<string, LinkSearchResult>> {
	const linkMap: Record<string, LinkSearchResult> = {};

	await Promise.all(
		targets.map(async ({ id, queries }) => {
			const searchResults = await Promise.all(
				queries.map(async (query) => {
					const [error, results] = await catchError(searchGoogle(query));
					if (error || !results?.length) return [];
					return results.flat();
				}),
			);

			const candidates = dedupeCandidates(
				searchResults
					.flat()
					.map((item) => toEvidenceCandidate(item, preferredSites))
					.filter((item): item is EvidenceCandidate => {
						if (!item) return false;
						return !isBlacklisted(item.domain, blacklist);
					}),
			);

			const alternatives = categorizeCandidates(candidates);
			const bestLink =
				alternatives.neutral[0] ??
				alternatives.preferred[0] ??
				alternatives.regular[0];

			if (!bestLink) return;

			linkMap[id] = {
				link: bestLink.link,
				title: bestLink.title,
				alternatives,
			};
		}),
	);

	return linkMap;
}
