type Result<T, E = Error> = readonly [undefined, T] | readonly [E, undefined];

/**
 * 智能捕获同步或异步操作的错误并返回元组类型结果
 * @template T - 返回值类型
 * @template E - 错误类型，默认为 Error
 */
export function catchError<T, E extends Error = Error>(
	operation: () => T,
	errorHandler?: (error: unknown) => E,
): Result<T, E>;
export function catchError<T, E extends Error = Error>(
	operation: Promise<T>,
	errorHandler?: (error: unknown) => E,
): Promise<Result<T, E>>;
export function catchError<T, E extends Error = Error>(
	operation: Promise<T> | (() => T),
	errorHandler?: (error: unknown) => E,
): Promise<Result<T, E>> | Result<T, E> {
	// 统一的错误处理函数
	function handleError(error: unknown): readonly [E, undefined] {
		if (errorHandler) {
			return [errorHandler(error), undefined] as const;
		}
		return [
			(error instanceof Error ? error : new Error(String(error))) as E,
			undefined,
		] as const;
	}

	// 统一的成功处理函数
	function handleSuccess(data: T): readonly [undefined, T] {
		return [undefined, data] as const;
	}

	// 处理同步函数
	if (typeof operation === "function") {
		try {
			return handleSuccess(operation());
		} catch (error) {
			return handleError(error);
		}
	}

	// 处理 Promise
	return operation.then(handleSuccess).catch(handleError);
}
