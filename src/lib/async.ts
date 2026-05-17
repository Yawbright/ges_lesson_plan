import { AppError, type AppErrorCode } from './appError';

export function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs: number,
  message = `Request timed out after ${Math.round(timeoutMs / 1000)} seconds. Please try again.`,
  code: AppErrorCode = 'NETWORK_TIMEOUT',
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new AppError(code, message, { retryable: true }));
    }, timeoutMs);

    Promise.resolve(promise)
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function createAbortError(message = 'Request cancelled.') {
  return new AppError('NETWORK_ERROR', message, { retryable: true });
}
