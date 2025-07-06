import { env } from "@/env";

/**
 * Plunk 邮件服务客户端
 * @see https://docs.useplunk.com/
 */
export class PlunkClient {
	private readonly apiKey: string;
	private static instance: PlunkClient;

	private constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	/**
	 * 获取 PlunkClient 实例
	 * @returns PlunkClient 实例
	 */
	public static getInstance(): PlunkClient {
		if (!PlunkClient.instance) {
			const apiKey = env.PLUNK_API_KEY;
			PlunkClient.instance = new PlunkClient(apiKey);
		}
		return PlunkClient.instance;
	}

	/**
	 * 发送邮件
	 * @param params - 邮件参数
	 * @returns 发送结果
	 */
	public async sendEmail(params: {
		to: string;
		subject: string;
		body: string;
		reply?: string;
	}): Promise<{ success: boolean }> {
		const response = await fetch("https://api.useplunk.com/v1/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify(params),
		});

		if (!response.ok) {
			throw new Error("邮件发送失败");
		}

		return { success: true };
	}

	/**
	 * 追踪用户事件
	 * @param params - 事件参数
	 * @returns 追踪结果
	 */
	public async trackEvent(params: {
		event:
			| "user-registered"
			| "email-verified"
			| "password-reset-requested"
			| "user-signup"
			| "user-login";
		email: string;
		data?: Record<string, string | number | boolean>;
	}): Promise<{ success: boolean }> {
		const response = await fetch("https://api.useplunk.com/v1/track", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify(params),
		});

		if (!response.ok) {
			throw new Error("事件追踪失败");
		}

		return { success: true };
	}
}
