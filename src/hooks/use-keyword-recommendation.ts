import { useCallback } from "react";
import { generateRecommendation } from "@/actions/recommendation";
import { useAPISettingsStore } from "@/stores/api-settings";
import { useKeywordEditorStore } from "@/stores/keyword-editor";
import type { KeywordMatch, KeywordMetadata } from "@/types/keywords";

/**
 * Hook for adding keywords with context-aware recommendations
 */
export function useKeywordRecommendation() {
	const {
		text,
		matches,
		keywordMetadata,
		setMatches,
		setKeywordMetadata,
		setSelectedKeywordIds,
	} = useKeywordEditorStore();
	const { apiKey, baseUrl, model } = useAPISettingsStore();

	/**
	 * Add a keyword with context-aware metadata
	 */
	const addKeywordWithRecommendation = useCallback(
		async (keyword: string) => {
			if (!keyword.trim()) return false;

			// 检查关键词是否已存在（大小写不敏感）
			const existingKeyword = Object.keys(keywordMetadata).find(
				(k) => k.toLowerCase() === keyword.toLowerCase(),
			);
			if (existingKeyword) return false;

			// 检查关键词总数是否已达到上限（20个）
			if (Object.keys(keywordMetadata).length >= 20) {
				console.warn("已达到关键词数量上限（20个）");
				return false;
			}

			// 在文本中查找关键词的所有位置
			const newMatches: KeywordMatch[] = [];
			let searchIndex = 0;
			let instanceIndex = matches.filter(
				(m) => m.keyword.toLowerCase() === keyword.toLowerCase(),
			).length;

			while (true) {
				const foundIndex = text
					.toLowerCase()
					.indexOf(keyword.toLowerCase(), searchIndex);
				if (foundIndex === -1) break;

				// 获取实际匹配的文本（保持原始大小写）
				const actualKeyword = text.slice(
					foundIndex,
					foundIndex + keyword.length,
				);

				// 创建新的匹配项
				const id = `${actualKeyword}-${instanceIndex}`;
				newMatches.push({
					id,
					keyword: actualKeyword,
					start: foundIndex,
					end: foundIndex + keyword.length,
				});

				searchIndex = foundIndex + keyword.length;
				instanceIndex++;
			}

			// 如果没有找到匹配项，不添加
			if (newMatches.length === 0) return false;

			// 使用 AI 生成上下文感知的推荐语
			const recommendationResult = await generateRecommendation(
				text,
				keyword,
				apiKey || undefined,
				baseUrl || undefined,
				model || undefined,
			);

			if (recommendationResult.error || !recommendationResult.data) {
				// 如果 AI 生成失败，返回失败
				console.error(
					"Failed to generate recommendation:",
					recommendationResult.error,
				);
				return false;
			}

			const { query, reason } = recommendationResult.data;

			// 创建元数据 - 使用找到的第一个实际关键词作为 key
			const actualKeyword = newMatches[0]?.keyword || keyword;
			const newMetadata: KeywordMetadata = {
				keyword: actualKeyword,
				query,
				reason,
				link: null,
				title: null,
				alternatives: { preferred: [], regular: [] },
			};

			// 更新状态
			const updatedMatches = [...matches, ...newMatches].sort(
				(a, b) => a.start - b.start,
			);
			const updatedMetadata = {
				...keywordMetadata,
				[actualKeyword]: newMetadata,
			};

			// 获取当前选中的ID并添加新的
			const currentSelectedIds =
				useKeywordEditorStore.getState().selectedKeywordIds;
			const selectedIds = new Set([
				...Array.from(currentSelectedIds),
				...newMatches.map((m) => m.id),
			]);

			setMatches(updatedMatches);
			setKeywordMetadata(updatedMetadata);
			setSelectedKeywordIds(selectedIds);

			return true;
		},
		[
			text,
			matches,
			keywordMetadata,
			setMatches,
			setKeywordMetadata,
			setSelectedKeywordIds,
		],
	);

	return {
		addKeywordWithRecommendation,
	};
}
