"use client";

import { useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useKeywordEditorStore } from "@/stores/keyword-editor";

/**
 * 关键词选择管理 Hook
 * 处理关键词的选择、切换链接等操作
 */
export function useKeywordSelection() {
	const { toast } = useToast();

	const {
		matches,
		selectedKeywordIds,
		keywordMetadata,
		toggleKeyword,
		selectAllKeywords,
		deselectAllKeywords,
		updateKeywordLink,
	} = useKeywordEditorStore();

	/**
	 * 计算选中状态
	 */
	const selectionStats = useMemo(() => {
		const totalKeywords = new Set(matches.map((m) => m.keyword)).size;
		const selectedCount = selectedKeywordIds.size;
		const isAllSelected =
			selectedCount === matches.length && matches.length > 0;
		const isPartiallySelected =
			selectedCount > 0 && selectedCount < matches.length;

		return {
			totalKeywords,
			selectedCount,
			isAllSelected,
			isPartiallySelected,
		};
	}, [matches, selectedKeywordIds]);

	/**
	 * 切换全选状态
	 */
	const toggleSelectAll = useCallback(() => {
		if (selectionStats.isAllSelected) {
			deselectAllKeywords();
			toast({
				description: "已取消所有选择",
			});
		} else {
			selectAllKeywords();
			toast({
				description: `已选择所有 ${selectionStats.totalKeywords} 个关键词`,
			});
		}
	}, [selectionStats, selectAllKeywords, deselectAllKeywords, toast]);

	/**
	 * 切换单个关键词的选择状态
	 */
	const handleToggleKeyword = useCallback(
		(id: string) => {
			toggleKeyword(id);
		},
		[toggleKeyword],
	);

	/**
	 * 检查关键词是否被选中
	 */
	const isKeywordSelected = useCallback(
		(id: string) => {
			return selectedKeywordIds.has(id);
		},
		[selectedKeywordIds],
	);

	/**
	 * 切换关键词的链接
	 */
	const switchKeywordLink = useCallback(
		(keyword: string, link: string, title: string) => {
			updateKeywordLink(keyword, link, title);

			toast({
				description: `已切换 "${keyword}" 的链接`,
			});
		},
		[updateKeywordLink, toast],
	);

	/**
	 * 获取关键词的可用链接选项
	 */
	const getKeywordLinkOptions = useCallback(
		(keyword: string) => {
			const metadata = keywordMetadata[keyword];
			if (!metadata?.alternatives) return [];

			const { preferred, regular } = metadata.alternatives;
			const allOptions = [...preferred, ...regular];

			// 过滤掉当前选中的链接
			return allOptions.filter((option) => option.link !== metadata.link);
		},
		[keywordMetadata],
	);

	/**
	 * 获取关键词的当前链接信息
	 */
	const getKeywordLinkInfo = useCallback(
		(keyword: string) => {
			const metadata = keywordMetadata[keyword];
			if (!metadata?.link || !metadata?.title) return null;

			return {
				link: metadata.link,
				title: metadata.title,
				hasAlternatives:
					(metadata.alternatives?.preferred?.length ?? 0) +
						(metadata.alternatives?.regular?.length ?? 0) >
					1,
			};
		},
		[keywordMetadata],
	);

	return {
		// 状态
		matches,
		selectedKeywordIds,
		selectionStats,

		// 方法
		toggleSelectAll,
		handleToggleKeyword,
		isKeywordSelected,
		switchKeywordLink,
		getKeywordLinkOptions,
		getKeywordLinkInfo,
	};
}
