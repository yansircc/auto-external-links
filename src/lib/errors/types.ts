import { env } from "@/env";

/**
 * 错误代码枚举
 */
export enum ErrorCode {
	// 认证相关
	UNAUTHORIZED = "UNAUTHORIZED",
	FORBIDDEN = "FORBIDDEN",
	SESSION_EXPIRED = "SESSION_EXPIRED",

	// 限流相关
	RATE_LIMITED = "RATE_LIMITED",
	QUOTA_EXCEEDED = "QUOTA_EXCEEDED",

	// 验证相关
	VALIDATION_ERROR = "VALIDATION_ERROR",
	INVALID_INPUT = "INVALID_INPUT",

	// AI 相关
	AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
	AI_RESPONSE_INVALID = "AI_RESPONSE_INVALID",

	// 搜索相关
	SEARCH_SERVICE_ERROR = "SEARCH_SERVICE_ERROR",
	NO_RESULTS_FOUND = "NO_RESULTS_FOUND",

	// 系统相关
	INTERNAL_ERROR = "INTERNAL_ERROR",
	SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
	TIMEOUT = "TIMEOUT",
	NETWORK_ERROR = "NETWORK_ERROR",

	// 通用
	UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * 应用错误类
 */
export class AppError extends Error {
	public readonly code: ErrorCode;
	public readonly statusCode: number;
	public readonly details?: unknown;
	public readonly isOperational: boolean;

	constructor(
		message: string,
		code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
		statusCode: number = 500,
		isOperational: boolean = true,
		details?: unknown,
	) {
		super(message);

		this.name = "AppError";
		this.code = code;
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.details = details;

		// 保持原型链
		Object.setPrototypeOf(this, AppError.prototype);

		// 捕获堆栈跟踪
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AppError);
		}
	}

	/**
	 * 转换为可序列化的对象
	 */
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			code: this.code,
			statusCode: this.statusCode,
			details: this.details,
			stack: env.NODE_ENV === "development" ? this.stack : undefined,
		};
	}
}

/**
 * 预定义的错误工厂函数
 */
export const Errors = {
	// 认证错误
	unauthorized: (message = "未授权访问") =>
		new AppError(message, ErrorCode.UNAUTHORIZED, 401),

	forbidden: (message = "禁止访问") =>
		new AppError(message, ErrorCode.FORBIDDEN, 403),

	sessionExpired: () =>
		new AppError("会话已过期，请重新登录", ErrorCode.SESSION_EXPIRED, 401),

	// 限流错误
	rateLimited: (resetTime?: Date) =>
		new AppError(
			"请求过于频繁，请稍后再试",
			ErrorCode.RATE_LIMITED,
			429,
			true,
			{ resetTime },
		),

	quotaExceeded: (limit: number) =>
		new AppError(
			`已达到每日限额 (${limit} 次)`,
			ErrorCode.QUOTA_EXCEEDED,
			429,
			true,
			{ limit },
		),

	// 验证错误
	validation: (errors: unknown) =>
		new AppError("输入验证失败", ErrorCode.VALIDATION_ERROR, 400, true, errors),

	invalidInput: (field: string, reason?: string) =>
		new AppError(
			`无效的输入: ${field}${reason ? ` - ${reason}` : ""}`,
			ErrorCode.INVALID_INPUT,
			400,
			true,
			{ field, reason },
		),

	// AI 服务错误
	aiService: (originalError?: unknown) =>
		new AppError(
			"AI 服务暂时不可用",
			ErrorCode.AI_SERVICE_ERROR,
			503,
			true,
			originalError,
		),

	aiResponseInvalid: (response: unknown) =>
		new AppError("AI 响应格式无效", ErrorCode.AI_RESPONSE_INVALID, 502, true, {
			response,
		}),

	// 搜索错误
	searchService: (originalError?: unknown) =>
		new AppError(
			"搜索服务暂时不可用",
			ErrorCode.SEARCH_SERVICE_ERROR,
			503,
			true,
			originalError,
		),

	noResults: (query: string) =>
		new AppError(
			`未找到相关结果: ${query}`,
			ErrorCode.NO_RESULTS_FOUND,
			404,
			true,
			{ query },
		),

	// 系统错误
	internal: (originalError?: unknown) =>
		new AppError(
			"服务器内部错误",
			ErrorCode.INTERNAL_ERROR,
			500,
			false,
			originalError,
		),

	timeout: (operation: string, timeoutMs: number) =>
		new AppError(`操作超时: ${operation}`, ErrorCode.TIMEOUT, 504, true, {
			operation,
			timeoutMs,
		}),

	network: (originalError?: unknown) =>
		new AppError(
			"网络连接错误",
			ErrorCode.NETWORK_ERROR,
			503,
			true,
			originalError,
		),
};
