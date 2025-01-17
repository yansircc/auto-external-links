import { PlunkClient } from "@/lib/plunk";

/**
 * 触发用户注册事件，由 Plunk 自动发送验证邮件
 * @param params - 验证邮件参数
 */
export async function sendVerificationRequest(params: {
  identifier: string;
  url: string;
}) {
  const { identifier: email, url } = params;
  const { host } = new URL(url);
  console.log("[auth] Sending verification request", { email, url, host });

  try {
    const plunkClient = PlunkClient.getInstance();
    // 触发 user-signup 事件，Plunk 会自动发送验证邮件
    await plunkClient.trackEvent({
      event: "user-signup",
      email,
      data: {
        verificationUrl: url,
        host,
        registeredAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[auth] Failed to send verification request", error);
    throw new Error("Failed to send verification email");
  }
}
