import { getTranslations } from "next-intl/server";

export interface FeedbackMessages {
	title: string;
	description: string;
	message: {
		label: string;
		placeholder: string;
		min: string;
		max: string;
	};
	email: {
		label: string;
		placeholder: string;
		invalid: string;
	};
	submit: string;
	submitting: string;
	errors: {
		submit: string;
	};
}

export async function getFeedbackMessages(): Promise<FeedbackMessages> {
	const t = await getTranslations("feedback");

	// 预先获取所有需要的翻译
	return {
		title: t("title"),
		description: t("description"),
		message: {
			label: t("message.label"),
			placeholder: t("message.placeholder"),
			min: t("message.min"),
			max: t("message.max"),
		},
		email: {
			label: t("email.label"),
			placeholder: t("email.placeholder"),
			invalid: t("email.invalid"),
		},
		submit: t("submit"),
		submitting: t("submitting"),
		errors: {
			submit: t("errors.submit"),
		},
	};
}
