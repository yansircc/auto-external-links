import { handlers } from "@/server/auth";

export const { GET, POST } = handlers;

// 使用 Node.js runtime 以支持数据库和邮件功能
export const runtime = "nodejs";
