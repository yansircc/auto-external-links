import type { EditorMessages } from "./messages";
import type { KeywordMatch, KeywordMetadata } from "./schema";

export interface KeywordEditorProps {
	text: string;
	matches: KeywordMatch[];
	keywordMetadata: Record<string, KeywordMetadata>;
	selectedKeywordIds: Set<string>;
	isLoading: boolean;
	isEditing: boolean;
	hasLinks: boolean;
	preferredSites: string[];
	messages: EditorMessages;
	onSubmit: (data: { text: string }) => Promise<void>;
	onToggleKeyword: (id: string) => void;
	onConfirm: () => Promise<void>;
	onEditClick: () => void;
	onNewAnalysis: () => void;
}

export interface RenderOptions {
	text: string;
	matches: KeywordMatch[];
	keywordMetadata: Record<string, KeywordMetadata>;
	selectedKeywordIds: Set<string>;
	footnoteIndexMap: Map<string, number>;
	messages: EditorMessages["linkedContent"];
}

export interface Footnote {
	keyword: string;
	reason: string;
	referenceIds: string[];
}

export interface LinkedContentProps {
	text: string;
	matches: KeywordMatch[];
	keywordMetadata: Record<string, KeywordMetadata>;
	selectedKeywordIds: Set<string>;
	messages: EditorMessages["linkedContent"];
}

export interface KeywordPreviewProps {
	text: string;
	matches: KeywordMatch[];
	keywordMetadata: Record<string, KeywordMetadata>;
	selectedKeywordIds: Set<string>;
	isLoading: boolean;
	messages: EditorMessages["preview"];
	onToggleKeyword: (id: string) => void;
	onConfirm: () => Promise<void>;
}

export interface EditorFormProps {
	text: string;
	isLoading: boolean;
	messages: EditorMessages["form"];
	onSubmit: (data: { text: string }) => Promise<void>;
}
