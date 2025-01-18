import { type NextAuthConfig } from "next-auth";
import { providers } from "./providers";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { redis } from "@/server/kv";

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET 环境变量未设置");
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

// 为了向后兼容，保留 authConfig 导出
export const authConfig = config;
