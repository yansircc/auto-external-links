import NextAuth from "next-auth";
import { config } from "@/server/auth/edge";

/**
 * 主认证配置
 */
export const { auth, signIn, signOut } = NextAuth(config);

// 导出配置供其他地方使用
export const authConfig = config;
