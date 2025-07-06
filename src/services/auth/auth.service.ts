import type { Session } from "next-auth";
import { auth } from "@/auth";
import { Errors } from "@/lib/errors/types";
import { BaseService } from "@/services/base/base.service";

/**
 * 认证服务
 * 处理用户认证和会话管理
 */
export class AuthService extends BaseService {
	protected readonly serviceName = "AuthService";

	// 会话缓存，避免重复调用
	private sessionCache: {
		session: Session | null;
		timestamp: number;
	} | null = null;

	// 缓存有效期（5分钟）
	private readonly CACHE_TTL = 5 * 60 * 1000;

	/**
	 * 获取当前用户会话
	 */
	async getSession(): Promise<Session | null> {
		// 检查缓存
		if (this.sessionCache) {
			const elapsed = Date.now() - this.sessionCache.timestamp;
			if (elapsed < this.CACHE_TTL) {
				this.log("info", "Returning cached session");
				return this.sessionCache.session;
			}
		}

		return this.measurePerformance("getSession", async () => {
			try {
				const session = await auth();

				// 更新缓存
				this.sessionCache = {
					session,
					timestamp: Date.now(),
				};

				this.log("info", "Session retrieved", {
					hasSession: !!session,
					userEmail: session?.user?.email,
				});

				return session;
			} catch (error) {
				this.log("error", "Failed to get session", error);
				// 认证服务出错时不抛出异常，返回 null
				return null;
			}
		});
	}

	/**
	 * 要求用户已登录，否则抛出异常
	 */
	async requireAuth(): Promise<Session> {
		const session = await this.getSession();

		if (!session) {
			this.log("warn", "Authentication required but no session found");
			throw Errors.unauthorized("请先登录");
		}

		return session;
	}

	/**
	 * 检查用户是否已认证
	 */
	async isAuthenticated(): Promise<boolean> {
		const session = await this.getSession();
		return !!session;
	}

	/**
	 * 清除会话缓存
	 */
	clearCache(): void {
		this.sessionCache = null;
		this.log("info", "Session cache cleared");
	}

	/**
	 * 获取用户信息
	 */
	async getUser() {
		const session = await this.getSession();
		return session?.user || null;
	}

	/**
	 * 检查用户是否有特定权限
	 */
	async hasPermission(_permission: string): Promise<boolean> {
		const session = await this.getSession();

		if (!session) {
			return false;
		}

		// TODO: 实现权限检查逻辑
		// 目前简单返回已登录即有权限
		return true;
	}
}
