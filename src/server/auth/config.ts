import { type NextAuthConfig } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db";
import { sendVerificationRequest } from "./auth-send-request";

/**
 * 完整的认证配置
 * 包含数据库适配器，仅在非 Edge 环境使用
 */
const config: NextAuthConfig = {
  adapter: DrizzleAdapter(db),
  providers: [
    {
      id: "http-email",
      name: "Email",
      type: "email",
      maxAge: 60 * 60 * 24, // Email link will expire in 24 hours
      sendVerificationRequest,
    },
  ],
};

export { config };
