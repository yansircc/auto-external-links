import { type KeywordMatch, type KeywordMetadata } from "./schema";

export interface KeywordEditorProps {
  text: string;
  matches: KeywordMatch[];
  keywordMetadata: Record<string, KeywordMetadata>;
  selectedKeywordIds: Set<string>;
  isLoading: boolean;
  isEditing: boolean;
  hasLinks: boolean;
  onSubmit: (data: { text: string }) => Promise<void>;
  onToggleKeyword: (id: string) => void;
  onConfirm: () => Promise<void>;
  onEditClick: () => void;
}

export interface RenderOptions {
  text: string;
  matches: KeywordMatch[];
  keywordMetadata: Record<string, KeywordMetadata>;
  selectedKeywordIds: Set<string>;
  footnoteIndexMap: Map<string, number>;
}

export interface Footnote {
  keyword: string;
  reason: string;
  link: string;
  referenceIds: string[]; // Store all IDs that reference this footnote
}

export interface LinkedContentProps {
  text: string;
  matches: KeywordMatch[];
  keywordMetadata: Record<string, KeywordMetadata>;
  selectedKeywordIds: Set<string>;
}
