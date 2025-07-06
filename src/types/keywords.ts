import type { CompleteKeyword } from "@/actions/schema";
import type { SerperResponse } from "@/lib/serper/schema";

/**
 * 关键词元数据（扩展版，包含搜索结果）
 */
export interface KeywordMetadata extends CompleteKeyword {
	alternatives: {
		preferred: SerperResponse["organic"];
		regular: SerperResponse["organic"];
	};
}

/**
 * 关键词在文本中的匹配信息
 */
export interface KeywordMatch {
	id: string;
	keyword: string;
	start: number;
	end: number;
}

/**
 * 关键词分析结果
 */
export interface KeywordAnalysisResult {
	keywords: string[];
	metadata: Record<string, KeywordMetadata>;
	usage: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}

/**
 * 处理后的关键词结果（包含文本和匹配信息）
 */
export interface ProcessedKeywordResult {
	success: boolean;
	error?: {
		code: string;
		message: string;
	};
	data?: {
		text: string;
		matches: KeywordMatch[];
		keywords: string[];
		metadata: Record<string, KeywordMetadata>;
		usage: KeywordAnalysisResult["usage"];
	};
}

/**
 * 关键词搜索请求
 */
export interface KeywordSearchRequest {
	keyword: string;
	query: string;
}

/**
 * 选中的关键词信息
 */
export interface SelectedKeyword {
	id: string;
	keyword: string;
	metadata: KeywordMetadata;
}
