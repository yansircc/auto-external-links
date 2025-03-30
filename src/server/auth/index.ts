import { config } from "@/server/auth/config";
import NextAuth from "next-auth";
import { cache } from "react";

/**
 * Edge 兼容的认证实例
 * 用于全局认证，包括中间件、客户端组件和 API 路由
 * 使用 Upstash Redis 作为数据库，完全支持 Edge Runtime
 */
const { auth: uncachedAuth, signIn, signOut, handlers } = NextAuth(config);

// 使用 React cache 优化性能
const auth = cache(uncachedAuth);

export { auth, signIn, signOut, handlers, config };
