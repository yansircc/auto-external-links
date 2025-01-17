"use server";

import { PlunkClient } from "@/lib/plunk";

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
  const toEmail = process.env.FEEDBACK_RECEIVER_EMAIL;

  if (!toEmail) {
    throw new Error("接收反馈的邮箱未配置");
  }

  try {
    const plunkClient = PlunkClient.getInstance();
    return await plunkClient.sendEmail({
      to: toEmail,
      subject: "Auto External Links网站反馈",
      reply: data.email,
      body: `
      ${data.email ? `用户邮箱：${data.email}` : "用户未提供邮箱\n\n"}
      反馈内容：${data.message}
      `.trim(),
    });
  } catch (error) {
    console.error("发送反馈邮件失败:", error);
    throw new Error("发送失败");
  }
}
