import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface APISettings {
	apiKey: string | null;
	baseUrl: string;
	model: string;
	provider: "openai" | "custom";
}

interface APISettingsStore extends APISettings {
	// Actions
	setAPIKey: (key: string | null) => void;
	setBaseUrl: (url: string) => void;
	setModel: (model: string) => void;
	setProvider: (provider: "openai" | "custom") => void;
	clearSettings: () => void;
	hasAPIKey: () => boolean;
}

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

export const useAPISettingsStore = create<APISettingsStore>()(
	persist(
		(set, get) => ({
			// Initial state
			apiKey: null,
			baseUrl: DEFAULT_OPENAI_BASE_URL,
			model: DEFAULT_MODEL,
			provider: "openai",

			// Actions
			setAPIKey: (key) => set({ apiKey: key }),
			setBaseUrl: (url) => set({ baseUrl: url }),
			setModel: (model) => set({ model: model }),
			setProvider: (provider) => {
				if (provider === "openai") {
					set({
						provider,
						baseUrl: DEFAULT_OPENAI_BASE_URL,
						model: DEFAULT_MODEL,
					});
				} else {
					set({ provider });
				}
			},
			clearSettings: () =>
				set({
					apiKey: null,
					baseUrl: DEFAULT_OPENAI_BASE_URL,
					model: DEFAULT_MODEL,
					provider: "openai",
				}),
			hasAPIKey: () => !!get().apiKey,
		}),
		{
			name: "api-settings-storage",
			partialize: (state) => ({
				apiKey: state.apiKey,
				baseUrl: state.baseUrl,
				model: state.model,
				provider: state.provider,
			}),
		},
	),
);
