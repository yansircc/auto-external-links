import NextAuth from "next-auth";
import { config } from "@/server/auth/config";

/**
 * API 路由处理器
 * 使用完整的认证配置（包含数据库适配器）
 */
const handler = NextAuth(config);
export { handler as GET, handler as POST };

// Removed Edge Runtime to avoid compatibility issues
// NextAuth needs Node.js runtime for full functionality
