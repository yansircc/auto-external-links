"use server";

import { signIn } from "@/auth";

export async function signInWithEmail(email: string) {
	try {
		await signIn("email", { email, redirect: true });
	} catch (error) {
		// NextAuth throws a redirect error when successful, which is expected
		if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
			throw error; // Re-throw redirect errors
		}

		// Only log and throw for actual errors
		console.error("Sign in error:", error);
		throw new Error("Failed to send login email");
	}
}
