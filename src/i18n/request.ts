/**
 * @description 获取国际化请求配置
 * @returns {Promise<{ locale: string; messages: Record<string, string> }>} 返回语言环境和消息配置
 */
import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "@/lib/locale";
import { timeZone } from "./config";

interface LocaleMessages {
	default: Record<string, string>;
}

export default getRequestConfig(async () => {
	const locale = await getUserLocale();

	return {
		locale,
		timeZone,
		messages: ((await import(`./messages/${locale}.json`)) as LocaleMessages)
			.default,
	};
});
