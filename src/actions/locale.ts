"use server";

import { cookies } from "next/headers";
import type { Locale } from "@/i18n/config";

const COOKIE_NAME = "NEXT_LOCALE";

export async function setUserLocale(locale: Locale) {
	(await cookies()).set(COOKIE_NAME, locale);
}
