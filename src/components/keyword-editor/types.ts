import {
  type FormData,
  type KeywordMatch,
  type KeywordMetadata,
} from "@/app/schema";

export interface KeywordEditorProps {
  text: string;
  matches: KeywordMatch[];
  keywordMetadata: Record<string, KeywordMetadata>;
  selectedKeywordIds: Set<string>;
  isLoading: boolean;
  isEditing: boolean;
  hasLinks: boolean;
  onSubmit: (data: FormData) => Promise<void>;
  onToggleKeyword: (id: string) => void;
  onConfirm: () => Promise<void>;
  onEditClick: () => void;
}
