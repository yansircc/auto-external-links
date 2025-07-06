import { z } from "zod";
import { env } from "@/env";
import { AppError, ErrorCode, Errors } from "./types";

/**
 * 错误处理器类
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Error handler utility class pattern
export class ErrorHandler {
	/**
	 * 将任意错误转换为 AppError
	 */
	static normalize(error: unknown): AppError {
		// 已经是 AppError
		if (error instanceof AppError) {
			return error;
		}

		// Zod 验证错误
		if (error instanceof z.ZodError) {
			const formattedErrors = error.errors.map((e) => ({
				path: e.path.join("."),
				message: e.message,
			}));

			return Errors.validation(formattedErrors);
		}

		// 标准 Error
		if (error instanceof Error) {
			// 检查是否是特定类型的错误
			if (error.message.includes("fetch failed")) {
				return Errors.network(error);
			}

			if (error.message.includes("timeout")) {
				return Errors.timeout("请求", 30000);
			}

			// 默认转换为内部错误
			return new AppError(error.message, ErrorCode.UNKNOWN_ERROR, 500, false, {
				originalError: error.message,
				stack: error.stack,
			});
		}

		// 字符串错误
		if (typeof error === "string") {
			return new AppError(error, ErrorCode.UNKNOWN_ERROR, 500, true);
		}

		// 未知类型
		return new AppError("发生未知错误", ErrorCode.UNKNOWN_ERROR, 500, false, {
			originalError: error,
		});
	}

	/**
	 * 安全地获取错误消息
	 */
	static getMessage(error: unknown): string {
		const appError = ErrorHandler.normalize(error);

		// 对于非操作性错误，在生产环境返回通用消息
		if (!appError.isOperational && env.NODE_ENV === "production") {
			return "服务器错误，请稍后重试";
		}

		return appError.message;
	}

	/**
	 * 获取适合客户端的错误响应
	 */
	static getClientResponse(error: unknown) {
		const appError = ErrorHandler.normalize(error);

		// 生产环境下，隐藏非操作性错误的细节
		if (!appError.isOperational && env.NODE_ENV === "production") {
			return {
				error: {
					message: "服务器错误，请稍后重试",
					code: ErrorCode.INTERNAL_ERROR,
				},
			};
		}

		return {
			error: {
				message: appError.message,
				code: appError.code,
				details: appError.details,
			},
		};
	}

	/**
	 * 记录错误（用于服务器端日志）
	 */
	static log(error: unknown, context?: Record<string, unknown>) {
		const appError = ErrorHandler.normalize(error);

		const logData = {
			timestamp: new Date().toISOString(),
			error: {
				name: appError.name,
				message: appError.message,
				code: appError.code,
				statusCode: appError.statusCode,
				isOperational: appError.isOperational,
				details: appError.details,
				stack: appError.stack,
			},
			context,
		};

		// 开发环境打印到控制台
		if (process.env.NODE_ENV === "development") {
			console.error("🚨 Error:", logData);
		}

		// TODO: 生产环境发送到日志服务
		// if (process.env.NODE_ENV === 'production') {
		//   await logService.error(logData);
		// }
	}

	/**
	 * 判断是否应该重试
	 */
	static shouldRetry(error: unknown): boolean {
		const appError = ErrorHandler.normalize(error);

		// 可重试的错误类型
		const retryableCodes = [
			ErrorCode.NETWORK_ERROR,
			ErrorCode.TIMEOUT,
			ErrorCode.SERVICE_UNAVAILABLE,
			ErrorCode.AI_SERVICE_ERROR,
			ErrorCode.SEARCH_SERVICE_ERROR,
		];

		return retryableCodes.includes(appError.code);
	}

	/**
	 * 创建用于 Server Actions 的错误包装器
	 */
	static wrapServerAction<T extends (...args: any[]) => Promise<any>>(
		actionName: string,
		action: T,
	): T {
		return (async (...args: Parameters<T>) => {
			try {
				return await action(...args);
			} catch (error) {
				ErrorHandler.log(error, { action: actionName, args });

				const clientResponse = ErrorHandler.getClientResponse(error);
				return clientResponse;
			}
		}) as T;
	}
}

/**
 * 用于 React 组件的错误边界工具
 */
export function isErrorWithMessage(
	error: unknown,
): error is { message: string } {
	return (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof (error as Record<string, unknown>).message === "string"
	);
}

/**
 * 错误恢复建议
 */
export function getErrorRecoveryAction(error: AppError): string | null {
	switch (error.code) {
		case ErrorCode.UNAUTHORIZED:
		case ErrorCode.SESSION_EXPIRED:
			return "请重新登录";

		case ErrorCode.RATE_LIMITED:
		case ErrorCode.QUOTA_EXCEEDED:
			return "请稍后再试";

		case ErrorCode.NETWORK_ERROR:
			return "请检查网络连接";

		case ErrorCode.VALIDATION_ERROR:
		case ErrorCode.INVALID_INPUT:
			return "请检查输入内容";

		default:
			return null;
	}
}
