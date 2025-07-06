import { create } from "zustand";
import type { KeywordMatch, KeywordMetadata } from "@/types/keywords";

/**
 * 编辑器模式
 */
export type EditorMode = "editing" | "preview" | "linked";

/**
 * 关键词编辑器状态
 */
interface KeywordEditorState {
	// ========== 纯状态数据 ==========
	text: string;
	matches: KeywordMatch[];
	keywordMetadata: Record<string, KeywordMetadata>;
	selectedKeywordIds: Set<string>;
	isLoading: boolean;
	mode: EditorMode;
	hasLinks: boolean;
	preferredSites: string[];
	shouldAnimateLogo: boolean;

	// ========== 纯状态更新方法 ==========
	// 基础 setters
	setText: (text: string) => void;
	setMatches: (matches: KeywordMatch[]) => void;
	setKeywordMetadata: (metadata: Record<string, KeywordMetadata>) => void;
	setSelectedKeywordIds: (ids: Set<string>) => void;
	setIsLoading: (isLoading: boolean) => void;
	setMode: (mode: EditorMode) => void;
	setHasLinks: (hasLinks: boolean) => void;
	setPreferredSites: (sites: string[]) => void;
	setShouldAnimateLogo: (should: boolean) => void;

	// 状态操作方法
	toggleKeyword: (id: string) => void;
	selectAllKeywords: () => void;
	deselectAllKeywords: () => void;
	updateKeywordLink: (keyword: string, link: string, title: string) => void;
	updateKeywordMetadata: (
		keyword: string,
		metadata: Partial<KeywordMetadata>,
	) => void;
	addUserKeyword: (keyword: string) => void;

	// 批量更新方法
	resetToInitialState: () => void;
	updateAnalysisResult: (params: {
		text: string;
		matches: KeywordMatch[];
		metadata: Record<string, KeywordMetadata>;
	}) => void;
	updateLinksResult: (metadata: Record<string, KeywordMetadata>) => void;
}

/**
 * 初始状态
 */
const initialState = {
	text: "",
	matches: [],
	keywordMetadata: {},
	selectedKeywordIds: new Set<string>(),
	isLoading: false,
	mode: "editing" as EditorMode,
	hasLinks: false,
	preferredSites: [],
	shouldAnimateLogo: false,
};

/**
 * 关键词编辑器 Store（纯状态管理版本）
 */
export const useKeywordEditorStore = create<KeywordEditorState>((set, get) => ({
	// ========== 初始状态 ==========
	...initialState,

	// ========== 基础 Setters ==========
	setText: (text) => set({ text }),
	setMatches: (matches) => set({ matches }),
	setKeywordMetadata: (metadata) => set({ keywordMetadata: metadata }),
	setSelectedKeywordIds: (ids) => set({ selectedKeywordIds: ids }),
	setIsLoading: (isLoading) => set({ isLoading }),
	setMode: (mode) => set({ mode }),
	setHasLinks: (hasLinks) => set({ hasLinks }),
	setPreferredSites: (sites) => set({ preferredSites: sites }),
	setShouldAnimateLogo: (should) => set({ shouldAnimateLogo: should }),

	// ========== 状态操作方法 ==========
	toggleKeyword: (id) => {
		set((state) => {
			const next = new Set(state.selectedKeywordIds);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return { selectedKeywordIds: next };
		});
	},

	selectAllKeywords: () => {
		const { matches } = get();
		const allIds = new Set(matches.map((m) => m.id));
		set({ selectedKeywordIds: allIds });
	},

	deselectAllKeywords: () => {
		set({ selectedKeywordIds: new Set() });
	},

	updateKeywordLink: (keyword, link, title) => {
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
		});
	},

	updateKeywordMetadata: (keyword, partialMetadata) => {
		set((state) => {
			const metadata = state.keywordMetadata[keyword];
			if (!metadata) return state;

			return {
				keywordMetadata: {
					...state.keywordMetadata,
					[keyword]: {
						...metadata,
						...partialMetadata,
					},
				},
			};
		});
	},

	addUserKeyword: (keyword) => {
		if (!keyword.trim()) return;

		const { text, matches, keywordMetadata } = get();

		// 检查关键词是否已存在（大小写不敏感）
		const existingKeyword = Object.keys(keywordMetadata).find(
			(k) => k.toLowerCase() === keyword.toLowerCase(),
		);
		if (existingKeyword) return;

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
			const actualKeyword = text.slice(foundIndex, foundIndex + keyword.length);

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
		if (newMatches.length === 0) return;

		// 创建默认元数据
		const newMetadata: KeywordMetadata = {
			query: `What is ${keyword}?`,
			reason: `Learn more about ${keyword}`,
			link: null,
			title: null,
			alternatives: { preferred: [], regular: [] },
		};

		// 更新状态
		set({
			matches: [...matches, ...newMatches].sort((a, b) => a.start - b.start),
			keywordMetadata: {
				...keywordMetadata,
				[keyword]: newMetadata,
			},
			// 自动选中新添加的关键词
			selectedKeywordIds: new Set([
				...Array.from(get().selectedKeywordIds),
				...newMatches.map((m) => m.id),
			]),
		});
	},

	// ========== 批量更新方法 ==========
	resetToInitialState: () => {
		set(initialState);
	},

	updateAnalysisResult: ({ text, matches, metadata }) => {
		set({
			text,
			matches,
			keywordMetadata: metadata,
			mode: "preview",
			isLoading: false,
		});
	},

	updateLinksResult: (metadata) => {
		set({
			keywordMetadata: metadata,
			hasLinks: true,
			mode: "linked",
			shouldAnimateLogo: true,
			isLoading: false,
		});
	},
}));

// ========== Store Selectors ==========
export const keywordEditorSelectors = {
	// 获取选中的关键词
	getSelectedKeywords: (state: KeywordEditorState) => {
		const uniqueKeywords = new Set<string>();

		state.matches.forEach((match) => {
			if (state.selectedKeywordIds.has(match.id)) {
				uniqueKeywords.add(match.keyword);
			}
		});

		return Array.from(uniqueKeywords);
	},

	// 获取带元数据的选中关键词
	getSelectedKeywordsWithMetadata: (state: KeywordEditorState) => {
		const selectedKeywords = keywordEditorSelectors.getSelectedKeywords(state);

		return selectedKeywords
			.map((keyword) => ({
				keyword,
				metadata: state.keywordMetadata[keyword],
			}))
			.filter((item) => item.metadata);
	},

	// 检查是否有选中的关键词
	hasSelectedKeywords: (state: KeywordEditorState) => {
		return state.selectedKeywordIds.size > 0;
	},

	// 获取可以生成链接的关键词
	getLinkableKeywords: (state: KeywordEditorState) => {
		return keywordEditorSelectors
			.getSelectedKeywordsWithMetadata(state)
			.filter((item) => item.metadata?.query);
	},
};
