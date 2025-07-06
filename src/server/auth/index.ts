import type {
	GetServerSidePropsContext,
	NextApiRequest,
	NextApiResponse,
} from "next";
import { getServerSession } from "next-auth/next";
import { config } from "@/server/auth/config";

/**
 * 认证实例
 * 用于全局认证，包括中间件、客户端组件和 API 路由
 * 使用 Upstash Redis 作为数据库
 * Note: Currently using Node.js runtime due to Edge Runtime compatibility issues
 */

// Wrapper for getServerSession with our config
export async function auth(
	...args:
		| [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
		| [NextApiRequest, NextApiResponse]
		| []
) {
	return getServerSession(...args, config);
}

// Re-export config for use in route handlers
export { config };

// Export server actions
export { signIn } from "./actions";
