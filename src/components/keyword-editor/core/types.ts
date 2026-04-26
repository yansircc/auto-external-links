import type { EditorMessages } from "./messages";
import type { EvidenceMatch, EvidenceTargetMetadata } from "./schema";

export interface KeywordEditorProps {
	text: string;
	matches: EvidenceMatch[];
	targetMetadata: Record<string, EvidenceTargetMetadata>;
	selectedTargetIds: Set<string>;
	isLoading: boolean;
	isEditing: boolean;
	hasLinks: boolean;
	preferredSites: string[];
	messages: EditorMessages;
	onSubmit: (data: { text: string }) => Promise<void>;
	onToggleTarget: (id: string) => void;
	onConfirm: () => Promise<void>;
	onEditClick: () => void;
	onNewAnalysis: () => void;
}

export interface RenderOptions {
	text: string;
	matches: EvidenceMatch[];
	targetMetadata: Record<string, EvidenceTargetMetadata>;
	selectedTargetIds: Set<string>;
	footnoteIndexMap: Map<string, number>;
	messages: EditorMessages["linkedContent"];
}

export interface Footnote {
	label: string;
	reason: string;
	referenceIds: string[];
}
