import { create } from "zustand";
import type { EvidenceMatch, EvidenceTargetMetadata } from "@/types/keywords";

/**
 * 编辑器模式
 */
export type EditorMode = "editing" | "preview" | "linked";

interface KeywordEditorState {
	text: string;
	matches: EvidenceMatch[];
	targetMetadata: Record<string, EvidenceTargetMetadata>;
	selectedTargetIds: Set<string>;
	isLoading: boolean;
	mode: EditorMode;
	hasLinks: boolean;
	preferredSites: string[];
	shouldAnimateLogo: boolean;

	setText: (text: string) => void;
	setMatches: (matches: EvidenceMatch[]) => void;
	setTargetMetadata: (metadata: Record<string, EvidenceTargetMetadata>) => void;
	setSelectedTargetIds: (ids: Set<string>) => void;
	setIsLoading: (isLoading: boolean) => void;
	setMode: (mode: EditorMode) => void;
	setHasLinks: (hasLinks: boolean) => void;
	setPreferredSites: (sites: string[]) => void;
	setShouldAnimateLogo: (should: boolean) => void;

	toggleTarget: (id: string) => void;
	selectAllTargets: () => void;
	deselectAllTargets: () => void;
	updateTargetLink: (targetId: string, link: string, title: string) => void;
	removeTargetLink: (targetId: string) => void;
	updateTargetMetadata: (
		targetId: string,
		metadata: Partial<EvidenceTargetMetadata>,
	) => void;

	resetToInitialState: () => void;
	updateAnalysisResult: (params: {
		text: string;
		matches: EvidenceMatch[];
		metadata: Record<string, EvidenceTargetMetadata>;
	}) => void;
	updateLinksResult: (metadata: Record<string, EvidenceTargetMetadata>) => void;
}

const initialState = {
	text: "",
	matches: [],
	targetMetadata: {},
	selectedTargetIds: new Set<string>(),
	isLoading: false,
	mode: "editing" as EditorMode,
	hasLinks: false,
	preferredSites: [],
	shouldAnimateLogo: false,
};

export const useKeywordEditorStore = create<KeywordEditorState>((set, get) => ({
	...initialState,

	setText: (text) => set({ text }),
	setMatches: (matches) => set({ matches }),
	setTargetMetadata: (metadata) => set({ targetMetadata: metadata }),
	setSelectedTargetIds: (ids) => set({ selectedTargetIds: ids }),
	setIsLoading: (isLoading) => set({ isLoading }),
	setMode: (mode) => set({ mode }),
	setHasLinks: (hasLinks) => set({ hasLinks }),
	setPreferredSites: (sites) => set({ preferredSites: sites }),
	setShouldAnimateLogo: (should) => set({ shouldAnimateLogo: should }),

	toggleTarget: (id) => {
		set((state) => {
			const next = new Set(state.selectedTargetIds);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return { selectedTargetIds: next };
		});
	},

	selectAllTargets: () => {
		const { matches } = get();
		set({ selectedTargetIds: new Set(matches.map((match) => match.targetId)) });
	},

	deselectAllTargets: () => {
		set({ selectedTargetIds: new Set() });
	},

	updateTargetLink: (targetId, link, title) => {
		set((state) => {
			const metadata = state.targetMetadata[targetId];
			if (!metadata) return state;

			return {
				targetMetadata: {
					...state.targetMetadata,
					[targetId]: {
						...metadata,
						link,
						title,
					},
				},
			};
		});
	},

	removeTargetLink: (targetId) => {
		set((state) => {
			const metadata = state.targetMetadata[targetId];
			if (!metadata) return state;

			return {
				targetMetadata: {
					...state.targetMetadata,
					[targetId]: {
						...metadata,
						link: null,
						title: null,
					},
				},
			};
		});
	},

	updateTargetMetadata: (targetId, partialMetadata) => {
		set((state) => {
			const metadata = state.targetMetadata[targetId];
			if (!metadata) return state;

			return {
				targetMetadata: {
					...state.targetMetadata,
					[targetId]: {
						...metadata,
						...partialMetadata,
					},
				},
			};
		});
	},

	resetToInitialState: () => {
		set(initialState);
	},

	updateAnalysisResult: ({ text, matches, metadata }) => {
		set({
			text,
			matches,
			targetMetadata: metadata,
			selectedTargetIds: new Set(matches.map((match) => match.targetId)),
			mode: "preview",
			isLoading: false,
		});
	},

	updateLinksResult: (metadata) => {
		set({
			targetMetadata: metadata,
			hasLinks: true,
			mode: "linked",
			shouldAnimateLogo: true,
			isLoading: false,
		});
	},
}));

export const keywordEditorSelectors = {
	getSelectedTargets: (state: KeywordEditorState) =>
		state.matches.filter((match) =>
			state.selectedTargetIds.has(match.targetId),
		),

	getSelectedTargetsWithMetadata: (state: KeywordEditorState) =>
		keywordEditorSelectors
			.getSelectedTargets(state)
			.map((match) => ({
				match,
				metadata: state.targetMetadata[match.targetId],
			}))
			.filter((item) => item.metadata),

	hasSelectedTargets: (state: KeywordEditorState) =>
		state.selectedTargetIds.size > 0,

	getLinkableTargets: (state: KeywordEditorState) =>
		keywordEditorSelectors
			.getSelectedTargetsWithMetadata(state)
			.filter((item) => (item.metadata?.queries.length ?? 0) > 0),
};
