import { handlers } from "@/server/auth";

/**
 * API 路由处理器
 * 使用完整的认证配置（包含数据库适配器）
 */
export const { GET, POST } = handlers;

// 使用 Edge Runtime
export const runtime = "edge";
