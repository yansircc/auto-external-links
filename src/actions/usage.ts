"use server";

import { checkRateLimit } from "@/lib/rate-limit";

export async function getUsageStats(fingerprint?: string) {
	try {
		return await checkRateLimit(fingerprint, false);
	} catch (error) {
		console.error("Failed to get usage stats:", error);
		return null;
	}
}
