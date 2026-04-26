import type { CompleteEvidenceTarget } from "@/actions/schema";
import type { SerperResponse } from "@/lib/serper/schema";

export type SourceCategory = "neutral" | "preferred" | "regular";
export type OrganicSearchResult = SerperResponse["organic"][number];

export interface EvidenceCandidate extends OrganicSearchResult {
	domain: string;
	sourceCategory: SourceCategory;
}

/**
 * 证据目标元数据（包含搜索结果）
 */
export interface EvidenceTargetMetadata extends CompleteEvidenceTarget {
	alternatives: {
		neutral: EvidenceCandidate[];
		preferred: EvidenceCandidate[];
		regular: EvidenceCandidate[];
	};
}

/**
 * 证据目标在文本中的匹配信息
 */
export interface EvidenceMatch {
	id: string;
	targetId: string;
	anchorText: string;
	start: number;
	end: number;
}

/**
 * 证据目标分析结果
 */
export interface EvidenceAnalysisResult {
	targets: EvidenceTargetMetadata[];
	metadata: Record<string, EvidenceTargetMetadata>;
	usage: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}
