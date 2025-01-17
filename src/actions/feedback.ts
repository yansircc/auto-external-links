"use server";

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
  const apiKey = process.env.PLUNK_API_KEY;
  const toEmail = process.env.FEEDBACK_RECEIVER_EMAIL;

  if (!apiKey || !toEmail) {
    throw new Error("邮件服务配置缺失");
  }

  try {
    const response = await fetch("https://api.useplunk.com/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: toEmail,
        subject: "网站反馈",
        body: `
反馈内容：${data.message}

${data.email ? `用户邮箱：${data.email}` : "用户未提供邮箱"}
        `.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error("发送失败");
    }

    return { success: true };
  } catch (error) {
    console.error("发送反馈邮件失败:", error);
    throw new Error("发送失败");
  }
}
