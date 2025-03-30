import { getTranslations } from "next-intl/server";

// 定义设置对话框的消息类型
export interface SettingsMessages {
	dialog: {
		title: string;
		searchTitle: string;
		searchDescription: string;
		preferredTitle: string;
		blacklistTitle: string;
	};
	blacklist: {
		input: {
			placeholder: string;
			add: string;
		};
		list: {
			remove: string;
			empty: string;
		};
	};
	preferred: {
		input: {
			placeholder: string;
			add: string;
		};
		list: {
			remove: string;
			empty: string;
		};
		maxLimit: string;
		message: string;
	};
}

export async function getSettingsMessages(): Promise<SettingsMessages> {
	const dialogT = await getTranslations("settings.dialog");
	const blacklistT = await getTranslations("settings.blacklist");
	const preferredT = await getTranslations("settings.preferred");

	return {
		dialog: {
			title: dialogT("title"),
			searchTitle: dialogT("searchTitle"),
			searchDescription: dialogT("searchDescription"),
			preferredTitle: dialogT("preferredTitle"),
			blacklistTitle: dialogT("blacklistTitle"),
		},
		blacklist: {
			input: {
				placeholder: blacklistT("input.placeholder"),
				add: blacklistT("input.add"),
			},
			list: {
				remove: blacklistT("list.remove"),
				empty: blacklistT("list.empty"),
			},
		},
		preferred: {
			input: {
				placeholder: preferredT("input.placeholder"),
				add: preferredT("input.add"),
			},
			list: {
				remove: preferredT("list.remove"),
				empty: preferredT("list.empty"),
			},
			maxLimit: preferredT("maxLimit"),
			message: preferredT("message"),
		},
	};
}
