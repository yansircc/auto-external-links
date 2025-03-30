import { PlunkClient } from "@/lib/plunk";
import { redis } from "@/server/kv";
import { catchError } from "@/utils";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import type { EmailConfig } from "next-auth/providers/email";

if (!process.env.AUTH_SECRET) {
	throw new Error("AUTH_SECRET 环境变量未设置");
}

/**
 * 认证提供商配置
 * 使用 Plunk 发送验证邮件
 * 完全支持 Edge Runtime
 */
const providers: Provider[] = [
	{
		id: "plunk",
		name: "Email",
		type: "email",
		maxAge: 24 * 60 * 60, // 24 小时
		sendVerificationRequest,
	} satisfies EmailConfig,
];

/**
 * 触发用户注册事件，由 Plunk 自动发送验证邮件
 * @param params - 验证邮件参数
 * @throws {Error} 当发送验证邮件失败时抛出错误
 */
async function sendVerificationRequest(params: {
	identifier: string;
	url: string;
}) {
	const { identifier: email, url } = params;
	const { host } = new URL(url);
	console.log("[auth] Sending verification request", { email, url, host });

	const isProd = process.env.NODE_ENV === "production";

	const [error] = catchError(
		async () => {
			if (isProd) {
				await PlunkClient.getInstance().trackEvent({
					event: "user-signup",
					email,
					data: {
						verificationUrl: url,
						host,
						registeredAt: new Date().toISOString(),
					},
				});
			}
			return { success: true };
		},
		(error) => new Error("发送验证邮件失败", { cause: error }),
	);

	if (error) {
		console.error("[auth] Failed to send verification request", error);
		throw error;
	}
}

/**
 * 完整的认证配置
 * 使用 Upstash Redis 作为数据库，支持 Edge Runtime
 */
export const config: NextAuthConfig = {
	providers,
	adapter: UpstashRedisAdapter(redis),
	pages: {
		signIn: "/login",
		error: "/auth/error",
		verifyRequest: "/verify-request",
	},
};
