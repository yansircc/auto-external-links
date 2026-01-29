import { useCallback } from "react";
import { generateRecommendation } from "@/actions/recommendation";
import { useAPISettingsStore } from "@/stores/api-settings";
import {
	keywordEditorSelectors,
	useKeywordEditorStore,
} from "@/stores/keyword-editor";
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

			// 在文本中查找关键词的所有位置
			const allPositions: Array<{ start: number; end: number; text: string }> =
				[];
			let searchIndex = 0;

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

				allPositions.push({
					start: foundIndex,
					end: foundIndex + keyword.length,
					text: actualKeyword,
				});

				searchIndex = foundIndex + keyword.length;
			}

			// 如果文本中没有找到匹配项
			if (allPositions.length === 0) return false;

			if (existingKeyword) {
				// 关键词已存在，检查是否有新的匹配位置或未选中的匹配项

				// 找出现有的匹配项
				const existingMatches = matches.filter(
					(m) => m.keyword.toLowerCase() === keyword.toLowerCase(),
				);
				const existingPositions = new Set(
					existingMatches.map((m) => `${m.start}-${m.end}`),
				);

				// 找出新的位置（在文本中找到但不在 matches 中）
				const newPositions = allPositions.filter(
					(pos) => !existingPositions.has(`${pos.start}-${pos.end}`),
				);

				// 找出未选中的匹配项
				const currentSelectedIds =
					useKeywordEditorStore.getState().selectedKeywordIds;
				const unselectedMatches = existingMatches.filter(
					(m) => !currentSelectedIds.has(m.id),
				);

				// 如果既没有新位置，也没有未选中的匹配项，返回失败
				if (newPositions.length === 0 && unselectedMatches.length === 0) {
					return false;
				}

				// 添加新的匹配项
				const newMatches: KeywordMatch[] = [];
				let instanceIndex = existingMatches.length;

				for (const pos of newPositions) {
					const id = `${pos.text}-${instanceIndex}`;
					newMatches.push({
						id,
						keyword: pos.text,
						start: pos.start,
						end: pos.end,
					});
					instanceIndex++;
				}

				// 更新状态
				const updatedMatches =
					newMatches.length > 0
						? [...matches, ...newMatches].sort((a, b) => a.start - b.start)
						: matches;

				// 选中所有新添加的和之前未选中的匹配项
				const selectedIds = new Set([
					...Array.from(currentSelectedIds),
					...newMatches.map((m) => m.id),
					...unselectedMatches.map((m) => m.id),
				]);

				setMatches(updatedMatches);
				setSelectedKeywordIds(selectedIds);

				return true;
			}

			// 关键词不存在，执行完整的添加流程

			// 检查关键词总数是否已达到上限（20个）
			const selectedKeywordsCount = keywordEditorSelectors.getSelectedKeywords(
				useKeywordEditorStore.getState(),
			).length;
			if (selectedKeywordsCount >= 20) {
				console.warn("已达到关键词数量上限（20个）");
				return false;
			}

			// 创建所有匹配项
			const newMatches: KeywordMatch[] = allPositions.map((pos, index) => ({
				id: `${pos.text}-${index}`,
				keyword: pos.text,
				start: pos.start,
				end: pos.end,
			}));

			// 使用 AI 生成上下文感知的推荐语
			// 获取最新的 API settings，确保使用 hydrated 后的值
			const currentSettings = useAPISettingsStore.getState();
			const recommendationResult = await generateRecommendation(
				text,
				keyword,
				currentSettings.apiKey || undefined,
				currentSettings.baseUrl || undefined,
				currentSettings.model || undefined,
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
