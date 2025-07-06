"use client";

import { useCallback, useMemo } from "react";
import { fetchLinksForKeywords, getKeywords } from "@/actions/keywords";
import { getUsageStats } from "@/actions/usage";
import type { FormData } from "@/components/keyword-editor/core/schema";
import { useToast } from "@/hooks/use-toast";
import { ErrorHandler } from "@/lib/errors/handler";
import {
	keywordEditorSelectors,
	useKeywordEditorStore,
} from "@/stores/keyword-editor";
import { useSitePreferencesStore } from "@/stores/site-preferences";

/**
 * 关键词分析业务逻辑 Hook
 * 处理关键词分析和链接生成的完整流程
 */
export function useKeywordAnalysis() {
	const { toast } = useToast();

	// Store 状态和方法
	const store = useKeywordEditorStore();
	const {
		isLoading,
		mode,
		selectedKeywordIds,
		keywordMetadata,
		setIsLoading,
		updateAnalysisResult,
		updateLinksResult,
		setMode,
		resetToInitialState,
	} = store;

	// 站点偏好设置
	const { blacklist, preferredSites } = useSitePreferencesStore();

	// 选中的关键词
	const selectedKeywords = useMemo(
		() => keywordEditorSelectors.getSelectedKeywords(store),
		[store],
	);

	const linkableKeywords = useMemo(
		() => keywordEditorSelectors.getLinkableKeywords(store),
		[store],
	);

	/**
	 * 分析文本
	 */
	const analyzeText = useCallback(
		async (data: FormData, fingerprint?: string) => {
			setIsLoading(true);

			try {
				// 获取当前已有的关键词数量
				const currentKeywordCount = Object.keys(keywordMetadata).length;

				// Call server action with existing keyword count
				const result = await getKeywords(
					data.text,
					fingerprint,
					currentKeywordCount,
				);

				if (result.error) {
					const errorMessage = result.error.message || "分析失败，请稍后重试";
					toast({
						title: "分析失败",
						description: errorMessage,
						variant: "destructive",
					});
					return;
				}

				if (!result.data) {
					throw new Error("分析失败：未返回数据");
				}

				// Process the result to get matches
				const { findKeywordsInText } = await import("@/lib/keywords");
				const newKeywords = result.data.object.keywords.map((k) => k.keyword);

				// 合并现有关键词和新关键词
				const existingKeywords = Object.keys(keywordMetadata);
				const allKeywords = [...new Set([...existingKeywords, ...newKeywords])];
				const matches = findKeywordsInText(data.text, allKeywords);

				// Build metadata - 保留现有的元数据并添加新的
				const metadata: Record<string, any> = { ...keywordMetadata };
				for (const keyword of result.data.object.keywords) {
					// 只添加新的关键词元数据，不覆盖已有的
					if (!metadata[keyword.keyword]) {
						metadata[keyword.keyword] = {
							query: keyword.query,
							reason: keyword.reason,
							link: null,
							title: null,
							alternatives: { preferred: [], regular: [] },
						};
					}
				}

				// 更新 Store
				updateAnalysisResult({
					text: data.text,
					matches,
					metadata,
				});

				// 显示成功提示
				const newKeywordCount = newKeywords.length;
				const totalKeywordCount = Object.keys(metadata).length;
				toast({
					title: "分析完成",
					description: `新增 ${newKeywordCount} 个关键词，共 ${totalKeywordCount} 个关键词`,
				});
			} catch (error) {
				const errorMessage = ErrorHandler.getMessage(error);
				const errorCode = ErrorHandler.normalize(error).code;

				// 特殊处理限流错误
				if (errorCode === "RATE_LIMITED") {
					toast({
						title: "使用次数限制",
						description: errorMessage,
						variant: "destructive",
					});
				} else {
					toast({
						title: "分析失败",
						description: errorMessage,
						variant: "destructive",
					});
				}

				ErrorHandler.log(error, {
					action: "analyzeText",
					textLength: data.text.length,
				});
			} finally {
				setIsLoading(false);
			}
		},
		[setIsLoading, updateAnalysisResult, toast],
	);

	/**
	 * 为选中的关键词获取链接
	 */
	const fetchLinks = useCallback(async () => {
		if (linkableKeywords.length === 0) {
			toast({
				title: "请选择关键词",
				description: "至少需要选择一个关键词来生成链接",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);

		try {
			const keywordsForSearch = linkableKeywords
				.map(({ keyword, metadata }) => ({
					keyword,
					query: metadata?.query || "",
				}))
				.filter((item) => item.query);

			const searchOptions = {
				blacklist: blacklist.map((entry) => entry.domain),
				preferredSites: preferredSites.map((site) => site.domain),
			};

			const linkMap = await fetchLinksForKeywords(
				keywordsForSearch,
				searchOptions.blacklist,
				searchOptions.preferredSites,
			);

			// 合并链接结果到现有元数据
			const updatedMetadata = { ...keywordMetadata };

			Object.entries(linkMap).forEach(([keyword, linkResult]) => {
				if (updatedMetadata[keyword]) {
					updatedMetadata[keyword] = {
						...updatedMetadata[keyword],
						...linkResult,
					};
				}
			});

			// 更新 Store
			updateLinksResult(updatedMetadata);

			// 显示结果
			const foundCount = Object.keys(linkMap).length;
			if (foundCount > 0) {
				toast({
					title: "链接生成完成",
					description: `成功为 ${foundCount} 个关键词找到链接`,
				});
			} else {
				toast({
					title: "未找到合适的链接",
					description: "请尝试调整关键词或搜索设置",
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
				keywordCount: linkableKeywords.length,
			});
		} finally {
			setIsLoading(false);
		}
	}, [
		linkableKeywords,
		keywordMetadata,
		blacklist,
		preferredSites,
		setIsLoading,
		updateLinksResult,
		toast,
	]);

	/**
	 * 返回编辑模式
	 */
	const backToEdit = useCallback(() => {
		setMode("editing");
	}, [setMode]);

	/**
	 * 开始新的分析
	 */
	const startNewAnalysis = useCallback(() => {
		resetToInitialState();
	}, [resetToInitialState]);

	return {
		// 状态
		isLoading,
		mode,
		selectedKeywords,
		hasSelectedKeywords: selectedKeywordIds.size > 0,
		canFetchLinks: linkableKeywords.length > 0,

		// 方法
		analyzeText,
		fetchLinks,
		backToEdit,
		startNewAnalysis,
		getUsageStats,
	};
}
