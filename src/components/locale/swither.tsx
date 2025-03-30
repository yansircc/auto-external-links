import { getLocale, getTranslations } from "next-intl/server";
import LocaleSwitcherSelect from "./swither-select";

export default async function LocaleSwitcher() {
	const t = await getTranslations("locale-switcher");
	const locale = await getLocale();

	return (
		<LocaleSwitcherSelect
			defaultValue={locale}
			items={[
				{
					value: "en",
					label: t("en"),
				},
				{
					value: "zh",
					label: t("zh"),
				},
			]}
			label={t("label")}
		/>
	);
}
