"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server action for signing in with email
 * Used in App Router components
 */
export async function signIn(
	provider: string,
	options?: { email?: string; redirect?: boolean; redirectTo?: string },
) {
	const {
		email,
		redirect: shouldRedirect = true,
		redirectTo = "/",
	} = options || {};

	if (provider !== "email" && provider !== "plunk") {
		throw new Error(`Unsupported provider: ${provider}`);
	}

	if (!email) {
		throw new Error("Email is required for email provider");
	}

	// Get the current host
	const headersList = await headers();
	const host = headersList.get("host") || "localhost:3000";
	const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

	// Create the sign-in URL
	const baseUrl = `${protocol}://${host}`;
	const csrfTokenResponse = await fetch(`${baseUrl}/api/auth/csrf`);
	const { csrfToken } = await csrfTokenResponse.json();

	// Submit the sign-in request
	const signInResponse = await fetch(`${baseUrl}/api/auth/signin/email`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			email,
			csrfToken,
			callbackUrl: redirectTo,
			json: "true",
		}),
	});

	const result = await signInResponse.json();

	if (result.error) {
		throw new Error(result.error);
	}

	if (shouldRedirect) {
		redirect("/verify-request");
	}

	return result;
}
