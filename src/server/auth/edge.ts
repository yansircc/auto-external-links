import { type NextAuthConfig } from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Edge 兼容的认证配置
 * 不包含数据库适配器和邮件功能，仅用于会话验证
 */
export const config: NextAuthConfig = {
  ...authConfig,
  providers: [], // Edge 环境下不需要 providers
};
