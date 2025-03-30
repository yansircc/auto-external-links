import { getTranslations } from "next-intl/server";

export async function getMessages() {
	const [headerT, formT, previewT, linkedContentT, featuresT] =
		await Promise.all([
			getTranslations("keyword-editor.header"),
			getTranslations("keyword-editor.form"),
			getTranslations("keyword-editor.preview"),
			getTranslations("keyword-editor.linked-content"),
			getTranslations("keyword-editor.features"),
		]);

	// 组合所有翻译数据
	return {
		header: {
			title: headerT("title"),
			description: headerT("description"),
		},
		form: {
			title: formT("title"),
			description: formT("description"),
			placeholder: formT("placeholder"),
			analyze: formT("analyze"),
			analyzing: formT("analyzing"),
		},
		preview: {
			description: previewT("description"),
			confirm: previewT("confirm"),
			gettingLinks: previewT("gettingLinks"),
		},
		linkedContent: {
			description: linkedContentT("description"),
			copyMarkdown: linkedContentT("copyMarkdown"),
			copyMarkdownWithFootnotes: linkedContentT("copyMarkdownWithFootnotes"),
			copied: linkedContentT("copied"),
			footnotes: linkedContentT("footnotes"),
			preferred: linkedContentT("preferred"),
		},
		features: {
			ai: {
				title: featuresT("ai.title"),
				description: featuresT("ai.description"),
			},
			links: {
				title: featuresT("links.title"),
				description: featuresT("links.description"),
			},
			optimization: {
				title: featuresT("optimization.title"),
				description: featuresT("optimization.description"),
			},
		},
	};
}
