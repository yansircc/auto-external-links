"use client";

import { useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useKeywordEditorStore } from "@/stores/keyword-editor";

/**
 * 证据目标选择管理 Hook
 */
export function useKeywordSelection() {
	const { toast } = useToast();

	const {
		matches,
		selectedTargetIds,
		targetMetadata,
		toggleTarget,
		selectAllTargets,
		deselectAllTargets,
		updateTargetLink,
		removeTargetLink,
	} = useKeywordEditorStore();

	const selectionStats = useMemo(() => {
		const totalTargets = matches.length;
		const selectedCount = selectedTargetIds.size;
		const isAllSelected = selectedCount === totalTargets && totalTargets > 0;
		const isPartiallySelected =
			selectedCount > 0 && selectedCount < totalTargets;

		return {
			totalTargets,
			selectedCount,
			isAllSelected,
			isPartiallySelected,
		};
	}, [matches, selectedTargetIds]);

	const toggleSelectAll = useCallback(() => {
		if (selectionStats.isAllSelected) {
			deselectAllTargets();
			toast({
				description: "已取消所有选择",
			});
		} else {
			selectAllTargets();
			toast({
				description: `已选择所有 ${selectionStats.totalTargets} 个证据目标`,
			});
		}
	}, [selectionStats, selectAllTargets, deselectAllTargets, toast]);

	const handleToggleTarget = useCallback(
		(id: string) => {
			toggleTarget(id);
		},
		[toggleTarget],
	);

	const isTargetSelected = useCallback(
		(id: string) => selectedTargetIds.has(id),
		[selectedTargetIds],
	);

	const switchTargetLink = useCallback(
		(targetId: string, link: string, title: string) => {
			updateTargetLink(targetId, link, title);

			toast({
				description: "已切换证据目标链接",
			});
		},
		[updateTargetLink, toast],
	);

	const removeTargetLinkHandler = useCallback(
		(targetId: string) => {
			removeTargetLink(targetId);

			toast({
				description: "已移除证据目标链接",
			});
		},
		[removeTargetLink, toast],
	);

	const getTargetLinkOptions = useCallback(
		(targetId: string) => {
			const metadata = targetMetadata[targetId];
			if (!metadata?.alternatives) return [];

			const { neutral, preferred, regular } = metadata.alternatives;
			const allOptions = [...neutral, ...preferred, ...regular];

			return allOptions.filter((option) => option.link !== metadata.link);
		},
		[targetMetadata],
	);

	const getTargetLinkInfo = useCallback(
		(targetId: string) => {
			const metadata = targetMetadata[targetId];
			if (!metadata?.link || !metadata?.title) return null;

			return {
				link: metadata.link,
				title: metadata.title,
				hasAlternatives:
					(metadata.alternatives?.neutral?.length ?? 0) +
						(metadata.alternatives?.preferred?.length ?? 0) +
						(metadata.alternatives?.regular?.length ?? 0) >
					1,
			};
		},
		[targetMetadata],
	);

	return {
		matches,
		selectedTargetIds,
		selectionStats,
		toggleSelectAll,
		handleToggleTarget,
		isTargetSelected,
		switchTargetLink,
		removeTargetLink: removeTargetLinkHandler,
		getTargetLinkOptions,
		getTargetLinkInfo,
	};
}
