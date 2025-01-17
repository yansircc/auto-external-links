import { type NextAuthConfig } from "next-auth";
import { providers } from "./providers";

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET 环境变量未设置");
}

/**
 * 基础认证配置
 * 包含共享的配置项，可以被其他配置扩展
 */
export const authConfig: NextAuthConfig = {
  providers,
  pages: {
    signIn: "/login",
    error: "/auth/error",
    verifyRequest: "/verify-request",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        session.user.id = token.id as string;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
};
