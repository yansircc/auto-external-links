import { fetchLinksForKeywords, getKeywords } from "@/actions/keywords";
import type {
	FormData,
	KeywordMatch,
	KeywordMetadata,
} from "@/components/keyword-editor/core/schema";
import {
	showAnalysisError,
	showServerError,
	showValidationError,
} from "@/components/keyword-editor/core/toast-handler";
import { findKeywordsInText, getUniqueSelectedKeywords } from "@/lib/keywords";
import { useSitePreferencesStore } from "@/stores/site-preferences";
import { create } from "zustand";

interface KeywordEditorState {
	// 状态
	text: string;
	matches: KeywordMatch[];
	keywordMetadata: Record<string, KeywordMetadata>;
	selectedKeywordIds: Set<string>;
	isLoading: boolean;
	isEditing: boolean;
	hasLinks: boolean;
	preferredSites: string[];
	shouldAnimateLogo: boolean;

	// 动作
	setText: (text: string) => void;
	setMatches: (matches: KeywordMatch[]) => void;
	setKeywordMetadata: (metadata: Record<string, KeywordMetadata>) => void;
	toggleKeyword: (id: string) => void;
	setIsLoading: (isLoading: boolean) => void;
	setIsEditing: (isEditing: boolean) => void;
	setHasLinks: (hasLinks: boolean) => void;
	setPreferredSites: (sites: string[]) => void;
	setShouldAnimateLogo: (should: boolean) => void;
	updateKeywordLink: (keyword: string, link: string, title: string) => void;

	// 复合动作
	handleSubmit: (data: FormData, fingerprint?: string) => Promise<void>;
	handleConfirm: () => Promise<void>;
	handleEditClick: () => void;
	handleNewAnalysis: () => void;
}

export const useKeywordEditorStore = create<KeywordEditorState>((set, get) => ({
	// 初始状态
	text: "",
	matches: [],
	keywordMetadata: {},
	selectedKeywordIds: new Set(),
	isLoading: false,
	isEditing: true,
	hasLinks: false,
	preferredSites: [],
	shouldAnimateLogo: false,

	// 基础动作
	setText: (text) => set({ text }),
	setMatches: (matches) => set({ matches }),
	setKeywordMetadata: (metadata) => set({ keywordMetadata: metadata }),
	toggleKeyword: (id) =>
		set((state) => {
			const next = new Set(state.selectedKeywordIds);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return { selectedKeywordIds: next };
		}),
	setIsLoading: (isLoading) => set({ isLoading }),
	setIsEditing: (isEditing) => set({ isEditing }),
	setHasLinks: (hasLinks) => set({ hasLinks }),
	setPreferredSites: (sites) => set({ preferredSites: sites }),
	setShouldAnimateLogo: (should) => set({ shouldAnimateLogo: should }),
	updateKeywordLink: (keyword, link, title) =>
		set((state) => {
			const metadata = state.keywordMetadata[keyword];
			if (!metadata) return state;

			return {
				keywordMetadata: {
					...state.keywordMetadata,
					[keyword]: {
						...metadata,
						link,
						title,
					},
				},
			};
		}),

	// 复合动作
	handleSubmit: async (data, fingerprint) => {
		const {
			setIsLoading,
			setText,
			setMatches,
			setKeywordMetadata,
			setIsEditing,
			setShouldAnimateLogo,
		} = get();

		setIsLoading(true);
		setShouldAnimateLogo(false);

		try {
			const result = await getKeywords(data.text, fingerprint);
			if (result.error) {
				showAnalysisError(
					result.error,
					() => void get().handleSubmit(data, fingerprint),
				);
				return;
			}

			if (!result.data) {
				showServerError("服务器返回了无效的数据");
				return;
			}

			// 创建关键词到元数据的映射
			const metadata: Record<string, KeywordMetadata> = {};
			const keywords = result.data.object.keywords.map((item) => {
				const { keyword, ...rest } = item;
				metadata[keyword] = rest;
				return keyword;
			});

			// 查找关键词在文本中的位置
			const matches = findKeywordsInText(data.text, keywords);

			// 更新状态
			setText(data.text);
			setMatches(matches);
			setKeywordMetadata(metadata);
			setIsEditing(false);
		} catch (error) {
			console.error("分析文本失败:", error);
			showServerError(
				"服务器错误，请稍后重试",
				() => void get().handleSubmit(data, fingerprint),
			);
		} finally {
			setIsLoading(false);
		}
	},

	handleConfirm: async () => {
		const {
			selectedKeywordIds,
			keywordMetadata,
			preferredSites,
			setIsLoading,
			setKeywordMetadata,
			setHasLinks,
			setShouldAnimateLogo,
		} = get();

		setIsLoading(true);

		try {
			const selectedKeywords = getUniqueSelectedKeywords(selectedKeywordIds);
			const keywordsForSearch = selectedKeywords
				.map((keyword) => {
					const metadata = keywordMetadata[keyword];
					if (!metadata?.query) return null;
					return { keyword, query: metadata.query };
				})
				.filter((item): item is NonNullable<typeof item> => item !== null);

			if (keywordsForSearch.length === 0) {
				showValidationError("至少需要选择一个关键词");
				return;
			}

			const { blacklist } = useSitePreferencesStore.getState();
			const blacklistDomains = blacklist.map((entry) => entry.domain);
			const linkMap = await fetchLinksForKeywords(
				keywordsForSearch,
				blacklistDomains,
				preferredSites,
			);

			const newMetadata = { ...keywordMetadata };
			for (const [keyword, { link, title, alternatives }] of Object.entries(
				linkMap,
			)) {
				if (newMetadata[keyword]) {
					newMetadata[keyword] = {
						...newMetadata[keyword],
						link,
						title,
						alternatives,
					};
				}
			}
			setKeywordMetadata(newMetadata);
			setHasLinks(true);
			setShouldAnimateLogo(true);
		} catch (error) {
			console.error("获取链接失败:", error);
			showServerError("请稍后重试");
		} finally {
			setIsLoading(false);
		}
	},

	handleEditClick: () => {
		set({ isEditing: true, hasLinks: false, shouldAnimateLogo: false });
	},

	handleNewAnalysis: () => {
		set({
			text: "",
			matches: [],
			keywordMetadata: {},
			selectedKeywordIds: new Set(),
			isEditing: true,
			hasLinks: false,
			shouldAnimateLogo: false,
		});
	},
}));
