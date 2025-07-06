import { env } from "@/env";

/**
 * 基础服务类，提供通用功能
 */
export abstract class BaseService {
	/**
	 * 服务名称，用于日志和监控
	 */
	protected abstract readonly serviceName: string;

	/**
	 * 记录日志
	 */
	protected log(
		level: "info" | "warn" | "error",
		message: string,
		data?: unknown,
	) {
		const timestamp = new Date().toISOString();
		const _logEntry = {
			timestamp,
			service: this.serviceName,
			level,
			message,
			data,
		};

		if (env.NODE_ENV === "development") {
			console.log(`[${this.serviceName}]`, message, data);
		}

		// TODO: 集成日志服务（如 Sentry、LogRocket 等）
	}

	/**
	 * 性能监控装饰器
	 */
	protected async measurePerformance<T>(
		operationName: string,
		operation: () => Promise<T>,
	): Promise<T> {
		const startTime = performance.now();

		try {
			const result = await operation();
			const duration = performance.now() - startTime;

			this.log("info", `${operationName} completed`, { duration });

			return result;
		} catch (error) {
			const duration = performance.now() - startTime;

			this.log("error", `${operationName} failed`, {
				duration,
				error: error instanceof Error ? error.message : "Unknown error",
			});

			throw error;
		}
	}

	/**
	 * 重试机制
	 */
	protected async retry<T>(
		operation: () => Promise<T>,
		options: {
			maxAttempts?: number;
			delay?: number;
			backoff?: boolean;
		} = {},
	): Promise<T> {
		const { maxAttempts = 3, delay = 1000, backoff = true } = options;

		let lastError: Error | undefined;

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error instanceof Error ? error : new Error("Unknown error");

				if (attempt < maxAttempts) {
					const waitTime = backoff ? delay * 2 ** (attempt - 1) : delay;
					await new Promise((resolve) => setTimeout(resolve, waitTime));
				}
			}
		}

		throw lastError || new Error("Operation failed after maximum attempts");
	}
}
