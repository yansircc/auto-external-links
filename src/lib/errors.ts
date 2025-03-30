/**
 * 自定义错误基类
 * 确保错误可以被正确序列化
 */
export class AppError extends Error {
	readonly code: string;

	constructor(message: string, code: string) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			code: this.code,
		};
	}
}

/**
 * 访问限制错误
 */
export class RateLimitError extends AppError {
	constructor(message: string) {
		super(message, "RATE_LIMITED");
	}
}
