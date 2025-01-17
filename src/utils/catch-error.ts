/**
 * 捕获 Promise 的错误
 * @param promise 要捕获的 Promise
 * @returns 返回一个 Promise，如果 Promise 成功，则返回 [undefined, T]，如果 Promise 失败，则返回 [Error]
 */
export function catchError<T>(
  promise: Promise<T>,
): Promise<[undefined, T] | [Error]> {
  return promise
    .then((data) => [undefined, data] as [undefined, T])
    .catch((error) => {
      console.error(error);
      return [error];
    });
}
