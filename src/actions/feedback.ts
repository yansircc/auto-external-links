"use server";

import { env } from "@/env";
import { PlunkClient } from "@/lib/plunk";
import { catchError } from "@/utils";

interface FeedbackData {
	message: string;
	email?: string;
}

/**
 * 发送反馈邮件到指定邮箱
 * @param data - 包含反馈消息和可选的用户邮箱的数据对象
 * @returns 发送结果
 */
export async function sendFeedback(data: FeedbackData) {
	const toEmail = env.ADMIN_EMAIL;

	const [error, result] = await catchError(
		PlunkClient.getInstance().sendEmail({
			to: toEmail,
			subject: "Auto External Links网站反馈",
			reply: data.email,
			body: `
      ${data.email ? `用户邮箱：${data.email}` : "用户未提供邮箱\n\n"}
      反馈内容：${data.message}
      `.trim(),
		}),
		(error) => new Error("发送失败", { cause: error }),
	);

	if (error) {
		console.error("发送反馈邮件失败:", error.cause || error);
		throw error;
	}

	return result;
}
