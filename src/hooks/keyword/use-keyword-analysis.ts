"use client";

import { useCallback, useMemo, useState } from "react";
import type { FormData } from "@/components/keyword-editor/core/schema";
import { useToast } from "@/hooks/use-toast";
import { ErrorHandler } from "@/lib/errors/handler";
import { KeywordService } from "@/services/keyword/keyword.service";
import {
	keywordEditorSelectors,
	useKeywordEditorStore,
} from "@/stores/keyword-editor-v2";
import { useSitePreferencesStore } from "@/stores/site-preferences";

/**
 * 关键词分析业务逻辑 Hook
 * 处理关键词分析和链接生成的完整流程
 */
export function useKeywordAnalysis() {
	const { toast } = useToast();
	const [keywordService] = useState(() => new KeywordService());

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
				const result = await keywordService.analyzeText(data.text, fingerprint);

				if (!result.success || !result.data) {
					const errorMessage = result.error?.message || "分析失败，请稍后重试";
					toast({
						title: "分析失败",
						description: errorMessage,
						variant: "destructive",
					});
					return;
				}

				// 更新 Store
				updateAnalysisResult({
					text: result.data.text,
					matches: result.data.matches,
					metadata: result.data.metadata,
				});

				// 显示成功提示
				toast({
					title: "分析完成",
					description: `找到 ${result.data.keywords.length} 个关键词`,
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
		[keywordService, setIsLoading, updateAnalysisResult, toast],
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

			const linkMap = await keywordService.fetchLinksForKeywords(
				keywordsForSearch,
				searchOptions,
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
		keywordService,
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

	/**
	 * 获取使用统计
	 */
	const getUsageStats = useCallback(
		async (fingerprint?: string) => {
			try {
				return await keywordService.getUsageStats(fingerprint);
			} catch (error) {
				ErrorHandler.log(error, { action: "getUsageStats" });
				return null;
			}
		},
		[keywordService],
	);

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
