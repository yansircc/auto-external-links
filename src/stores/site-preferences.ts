import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BlacklistEntry } from "@/lib/blacklist";
import type { PreferredSite } from "@/lib/preferred-sites";

interface SitePreferencesState {
	// 状态
	blacklist: BlacklistEntry[];
	preferredSites: PreferredSite[];

	// 黑名单操作
	addToBlacklist: (url: string) => void;
	removeFromBlacklist: (domain: string) => void;

	// 偏好站点操作
	addToPreferredSites: (url: string) => void;
	removeFromPreferredSites: (domain: string) => void;
}

function extractDomain(url: string) {
	try {
		const domain = new URL(url.startsWith("http") ? url : `https://${url}`)
			.hostname;
		return domain.replace(/^www\./, "");
	} catch {
		return url.toLowerCase();
	}
}

export const useSitePreferencesStore = create<SitePreferencesState>()(
	persist(
		(set) => ({
			// 初始状态
			blacklist: [],
			preferredSites: [],

			// 黑名单操作
			addToBlacklist: (url) =>
				set((state) => {
					const domain = extractDomain(url);
					if (state.blacklist.some((entry) => entry.domain === domain)) {
						return state;
					}
					return {
						blacklist: [
							...state.blacklist,
							{ domain, addedAt: new Date().toISOString() },
						],
					};
				}),

			removeFromBlacklist: (domain) =>
				set((state) => ({
					blacklist: state.blacklist.filter((entry) => entry.domain !== domain),
				})),

			// 偏好站点操作
			addToPreferredSites: (url) =>
				set((state) => {
					if (state.preferredSites.length >= 3) {
						return state;
					}
					const domain = extractDomain(url);
					if (state.preferredSites.some((entry) => entry.domain === domain)) {
						return state;
					}
					return {
						preferredSites: [
							...state.preferredSites,
							{ domain, addedAt: new Date().toISOString() },
						],
					};
				}),

			removeFromPreferredSites: (domain) =>
				set((state) => ({
					preferredSites: state.preferredSites.filter(
						(entry) => entry.domain !== domain,
					),
				})),
		}),
		{
			name: "site-preferences",
		},
	),
);
