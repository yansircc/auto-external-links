import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		// AI Configuration
		OPENAI_API_KEY: z.string(),
		DEEPSEEK_API_KEY: z.string(),
		// Tools Configuration
		SERPER_API_KEY: z.string(),
		// Auth Configuration
		AUTH_SECRET: z.string(),
		AUTH_TRUST_HOST: z.string(),
		NEXTAUTH_URL: z.string(),
		// Email Configuration
		PLUNK_API_KEY: z.string(),
		ADMIN_EMAIL: z.string(),
		EMAIL_SERVER: z.string(),
		// Redis Configuration
		UPSTASH_REDIS_URL: z.string(),
		UPSTASH_REDIS_TOKEN: z.string(),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
		SERPER_API_KEY: process.env.SERPER_API_KEY,
		AUTH_SECRET: process.env.AUTH_SECRET,
		AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		PLUNK_API_KEY: process.env.PLUNK_API_KEY,
		ADMIN_EMAIL: process.env.ADMIN_EMAIL,
		EMAIL_SERVER: process.env.EMAIL_SERVER,
		UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
		UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
	 * `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});
