"use client";

import { useCallback, useMemo } from "react";
import {
	analyzeEvidenceTargets,
	fetchLinksForEvidenceTargets,
} from "@/actions/keywords";
import { getUsageStats } from "@/actions/usage";
import type { FormData } from "@/components/keyword-editor/core/schema";
import { useToast } from "@/hooks/use-toast";
import { ErrorHandler } from "@/lib/errors/handler";
import { findEvidenceTargetsInText } from "@/lib/keywords";
import { useAPISettingsStore } from "@/stores/api-settings";
import {
	keywordEditorSelectors,
	useKeywordEditorStore,
} from "@/stores/keyword-editor";
import { useSitePreferencesStore } from "@/stores/site-preferences";

/**
 * 证据目标分析业务逻辑 Hook
 */
export function useKeywordAnalysis() {
	const { toast } = useToast();
	const store = useKeywordEditorStore();
	const {
		isLoading,
		mode,
		selectedTargetIds,
		targetMetadata,
		setIsLoading,
		updateAnalysisResult,
		updateLinksResult,
		setMode,
		resetToInitialState,
	} = store;
	const { blacklist, preferredSites } = useSitePreferencesStore();

	const selectedTargets = useMemo(
		() => keywordEditorSelectors.getSelectedTargets(store),
		[store],
	);

	const linkableTargets = useMemo(
		() => keywordEditorSelectors.getLinkableTargets(store),
		[store],
	);

	const analyzeText = useCallback(
		async (data: FormData, fingerprint?: string) => {
			setIsLoading(true);

			try {
				const currentSettings = useAPISettingsStore.getState();
				const currentApiKey = currentSettings.apiKey;
				const currentBaseUrl = currentSettings.baseUrl;
				const currentModel = currentSettings.model;

				const result = await analyzeEvidenceTargets(
					data.text,
					fingerprint,
					Object.keys(targetMetadata).length,
					currentApiKey || undefined,
					currentBaseUrl || undefined,
					currentModel || undefined,
				);

				if (result.error) {
					toast({
						title: "分析失败",
						description: result.error.message || "分析失败，请稍后重试",
						variant: "destructive",
					});
					return;
				}

				if (!result.data) {
					throw new Error("分析失败：未返回数据");
				}

				const metadata = { ...targetMetadata };
				for (const target of result.data.targets) {
					metadata[target.id] = {
						...target,
						alternatives: { neutral: [], preferred: [], regular: [] },
					};
				}

				const beforeCount =
					keywordEditorSelectors.getSelectedTargets(store).length;
				const matches = findEvidenceTargetsInText(
					data.text,
					Object.values(metadata),
				);

				updateAnalysisResult({
					text: data.text,
					matches,
					metadata,
				});

				const updatedStore = useKeywordEditorStore.getState();
				const afterCount =
					keywordEditorSelectors.getSelectedTargets(updatedStore).length;

				toast({
					title: "分析完成",
					description: `新增 ${afterCount - beforeCount} 个证据目标，共 ${updatedStore.selectedTargetIds.size} 处匹配`,
				});
			} catch (error) {
				const errorMessage = ErrorHandler.getMessage(error);
				const errorCode = ErrorHandler.normalize(error).code;

				toast({
					title: errorCode === "RATE_LIMITED" ? "使用次数限制" : "分析失败",
					description: errorMessage,
					variant: "destructive",
				});

				ErrorHandler.log(error, {
					action: "analyzeText",
					textLength: data.text.length,
				});
			} finally {
				setIsLoading(false);
			}
		},
		[setIsLoading, updateAnalysisResult, toast, targetMetadata],
	);

	const fetchLinks = useCallback(async () => {
		if (linkableTargets.length === 0) {
			toast({
				title: "请选择证据目标",
				description: "至少需要选择一个证据目标来生成链接",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);

		try {
			const targetsForSearch = linkableTargets
				.map(({ match, metadata }) => ({
					id: match.targetId,
					queries: metadata?.queries || [],
				}))
				.filter((item) => item.queries.length > 0);

			const linkMap = await fetchLinksForEvidenceTargets(
				targetsForSearch,
				blacklist.map((entry) => entry.domain),
				preferredSites.map((site) => site.domain),
			);

			const updatedMetadata = { ...targetMetadata };

			Object.entries(linkMap).forEach(([targetId, linkResult]) => {
				if (updatedMetadata[targetId]) {
					updatedMetadata[targetId] = {
						...updatedMetadata[targetId],
						...linkResult,
					};
				}
			});

			updateLinksResult(updatedMetadata);

			const foundCount = Object.keys(linkMap).length;
			if (foundCount > 0) {
				toast({
					title: "链接生成完成",
					description: `成功为 ${foundCount} 个证据目标找到链接`,
				});
			} else {
				toast({
					title: "未找到合适的链接",
					description: "请尝试调整证据目标或搜索设置",
					variant: "destructive",
				});
			}
		} catch (error) {
			const errorMessage = ErrorHandler.getMessage(error);

			toast({
				title: "获取链接失败",
				description: errorMessage,
				variant: "destructive",
			});

			ErrorHandler.log(error, {
				action: "fetchLinks",
				targetCount: linkableTargets.length,
			});
		} finally {
			setIsLoading(false);
		}
	}, [
		linkableTargets,
		targetMetadata,
		blacklist,
		preferredSites,
		setIsLoading,
		updateLinksResult,
		toast,
	]);

	const backToEdit = useCallback(() => {
		setMode("editing");
	}, [setMode]);

	const startNewAnalysis = useCallback(() => {
		resetToInitialState();
	}, [resetToInitialState]);

	return {
		isLoading,
		mode,
		selectedTargets,
		hasSelectedTargets: selectedTargetIds.size > 0,
		canFetchLinks: linkableTargets.length > 0,
		analyzeText,
		fetchLinks,
		backToEdit,
		startNewAnalysis,
		getUsageStats,
	};
}
