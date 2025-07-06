import type { EmailConfig } from "next-auth/providers/email";

/**
 * Edge-compatible email provider for NextAuth
 * Bypasses nodemailer to work in Edge Runtime
 */
export function EdgeEmailProvider(options: {
	from?: string;
	maxAge?: number;
	sendVerificationRequest: EmailConfig["sendVerificationRequest"];
}): EmailConfig {
	return {
		id: "email",
		type: "email",
		name: "Email",
		server: undefined as any, // Bypassed - we use custom sendVerificationRequest
		from: options.from ?? "NextAuth <no-reply@example.com>",
		maxAge: options.maxAge ?? 24 * 60 * 60,
		sendVerificationRequest: options.sendVerificationRequest,
		options: {},
	};
}