export type AppErrorCode =
  | 'AUTH_REQUIRED'
  | 'CONFIG_LOAD_FAILED'
  | 'INSUFFICIENT_CREDITS'
  | 'NETWORK_ERROR'
  | 'NETWORK_TIMEOUT'
  | 'STORAGE_ERROR'
  | 'UNKNOWN';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;
  readonly retryable: boolean;
  readonly metadata?: Record<string, unknown>;

  constructor(
    code: AppErrorCode,
    message: string,
    options: {
      cause?: unknown;
      retryable?: boolean;
      metadata?: Record<string, unknown>;
    } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = options.cause;
    this.retryable = options.retryable ?? false;
    this.metadata = options.metadata;
  }
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  if (typeof err === 'string' && err.trim()) return err;
  return fallback;
}

export function toAppError(
  err: unknown,
  fallbackCode: AppErrorCode = 'UNKNOWN',
  fallbackMessage = 'Something went wrong. Please try again.',
): AppError {
  if (err instanceof AppError) return err;
  return new AppError(fallbackCode, getErrorMessage(err, fallbackMessage), {
    cause: err,
    retryable: fallbackCode === 'NETWORK_ERROR' || fallbackCode === 'NETWORK_TIMEOUT',
  });
}

export function isAppErrorCode(err: unknown, code: AppErrorCode): boolean {
  return err instanceof AppError && err.code === code;
}
