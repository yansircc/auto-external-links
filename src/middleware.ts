import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Public paths that don't require authentication
const _PUBLIC_PATHS = ["/", "/about", "/privacy", "/terms", "/api/auth"];

/**
 * Middleware function
 * Currently simplified to avoid auth issues with Edge Runtime
 */
export async function middleware(_request: NextRequest) {
	// For now, allow all requests to proceed
	// TODO: Re-implement auth check once Edge Runtime issues are resolved

	// Add security headers
	const response = NextResponse.next();
	response.headers.set(
		"Strict-Transport-Security",
		"max-age=31536000; includeSubDomains",
	);
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("Referrer-Policy", "origin-when-cross-origin");
	response.headers.set(
		"Permissions-Policy",
		"camera=(), microphone=(), geolocation=()",
	);

	return response;
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
