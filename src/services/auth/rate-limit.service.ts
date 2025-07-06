import { Errors } from "@/lib/errors/types";
import { checkRateLimit } from "@/lib/rate-limit";
import { BaseService } from "@/services/base/base.service";

/**
 * 限流配置
 */
interface RateLimitConfig {
	maxRequests: number;
	windowMs: number;
}

/**
 * 限流结果
 */
interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt?: Date;
}

/**
 * 速率限制服务
 * 处理未认证用户的访问限制
 */
export class RateLimitService extends BaseService {
	protected readonly serviceName = "RateLimitService";

	// 默认限制：每天3次
	private readonly defaultConfig: RateLimitConfig = {
		maxRequests: 3,
		windowMs: 24 * 60 * 60 * 1000, // 24小时
	};

	/**
	 * 检查是否允许访问
	 */
	async checkLimit(fingerprint?: string): Promise<RateLimitResult> {
		if (!fingerprint) {
			this.log("warn", "No fingerprint provided for rate limiting");
			return {
				allowed: false,
				remaining: 0,
			};
		}

		return this.measurePerformance("checkRateLimit", async () => {
			try {
				const { remaining } = await checkRateLimit(fingerprint, false);

				const allowed = remaining > 0;

				this.log("info", "Rate limit check", {
					fingerprint: `${fingerprint.substring(0, 8)}...`, // 只记录部分指纹
					allowed,
					remaining,
				});

				return {
					allowed,
					remaining,
					resetAt: allowed ? undefined : this.calculateResetTime(),
				};
			} catch (error) {
				this.log("error", "Rate limit check failed", error);
				// 出错时默认拒绝访问
				return {
					allowed: false,
					remaining: 0,
				};
			}
		});
	}

	/**
	 * 增加使用次数
	 */
	async increment(fingerprint?: string): Promise<void> {
		if (!fingerprint) {
			this.log("warn", "Cannot increment without fingerprint");
			return;
		}

		try {
			await checkRateLimit(fingerprint, true);

			this.log("info", "Rate limit incremented", {
				fingerprint: `${fingerprint.substring(0, 8)}...`,
			});
		} catch (error) {
			this.log("error", "Failed to increment rate limit", error);
			// 增加失败不影响主流程
		}
	}

	/**
	 * 验证并可能抛出限流错误
	 */
	async enforceLimit(fingerprint?: string): Promise<void> {
		// 开发环境下跳过限流
		if (process.env.NODE_ENV === "development") {
			this.log("info", "Rate limit bypassed in development");
			return;
		}

		const result = await this.checkLimit(fingerprint);

		if (!result.allowed) {
			this.log("warn", "Rate limit exceeded", {
				fingerprint: `${fingerprint?.substring(0, 8)}...`,
				resetAt: result.resetAt,
			});

			throw Errors.rateLimited(result.resetAt);
		}
	}

	/**
	 * 获取用户的使用统计
	 */
	async getUsageStats(fingerprint?: string): Promise<{
		used: number;
		limit: number;
		remaining: number;
		resetAt: Date;
	}> {
		if (!fingerprint) {
			return {
				used: this.defaultConfig.maxRequests,
				limit: this.defaultConfig.maxRequests,
				remaining: 0,
				resetAt: this.calculateResetTime(),
			};
		}

		const { remaining } = await this.checkLimit(fingerprint);
		const used = this.defaultConfig.maxRequests - remaining;

		return {
			used,
			limit: this.defaultConfig.maxRequests,
			remaining,
			resetAt: this.calculateResetTime(),
		};
	}

	/**
	 * 计算重置时间（下一个午夜）
	 */
	private calculateResetTime(): Date {
		const now = new Date();
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);
		return tomorrow;
	}

	/**
	 * 获取限流配置
	 */
	getConfig(): RateLimitConfig {
		return { ...this.defaultConfig };
	}
}
