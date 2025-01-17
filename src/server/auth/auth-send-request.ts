import { PlunkClient } from "@/lib/plunk";
import { catchError } from "@/utils";

/**
 * 触发用户注册事件，由 Plunk 自动发送验证邮件
 * @param params - 验证邮件参数
 */
export async function sendVerificationRequest({
  identifier: email,
  url,
}: {
  identifier: string;
  url: string;
}) {
  const plunkClient = PlunkClient.getInstance();

  const [error] = await catchError(
    plunkClient.trackEvent({
      event: "user-signup",
      email,
      data: {
        verificationUrl: url,
      },
    }),
  );

  if (error) {
    console.error("触发注册事件失败:", error);
    throw new Error("验证邮件发送失败");
  }
}
