/**
 * Standardized error codes and definitions for API responses
 * Used by all edge functions to return consistent, machine-readable errors
 */

export interface ApiErrorDefinition {
  code: string;
  httpStatus: number;
  retryable: boolean;
  description: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
  details?: Record<string, unknown>;
}

export const ERROR_CODES = {
  // Client/Validation Errors (4xx)
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    httpStatus: 400,
    retryable: false,
    description: 'Request validation failed',
  },
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    httpStatus: 400,
    retryable: false,
    description: 'Invalid input parameters',
  },
  AUTH_REQUIRED: {
    code: 'AUTH_REQUIRED',
    httpStatus: 401,
    retryable: false,
    description: 'Authentication required',
  },
  AUTH_FAILED: {
    code: 'AUTH_FAILED',
    httpStatus: 401,
    retryable: false,
    description: 'Authentication failed',
  },
  INSUFFICIENT_CREDITS: {
    code: 'INSUFFICIENT_CREDITS',
    httpStatus: 402,
    retryable: false,
    description: 'Insufficient credits for this operation',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    httpStatus: 403,
    retryable: false,
    description: 'Access denied',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    httpStatus: 404,
    retryable: false,
    description: 'Resource not found',
  },

  // Rate Limiting (429)
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    httpStatus: 429,
    retryable: true,
    description: 'Rate limit exceeded',
  },

  // Server Errors (5xx)
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    httpStatus: 500,
    retryable: true,
    description: 'Internal server error',
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    httpStatus: 500,
    retryable: true,
    description: 'Network communication failed',
  },
  NETWORK_TIMEOUT: {
    code: 'NETWORK_TIMEOUT',
    httpStatus: 504,
    retryable: true,
    description: 'Request timeout',
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    httpStatus: 503,
    retryable: true,
    description: 'Service temporarily unavailable',
  },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    httpStatus: 500,
    retryable: true,
    description: 'Database operation failed',
  },
  EXTERNAL_SERVICE_ERROR: {
    code: 'EXTERNAL_SERVICE_ERROR',
    httpStatus: 502,
    retryable: true,
    description: 'External service failed',
  },

  // AI/Generation Specific
  GENERATION_FAILED: {
    code: 'GENERATION_FAILED',
    httpStatus: 500,
    retryable: true,
    description: 'Content generation failed',
  },
  PARSING_FAILED: {
    code: 'PARSING_FAILED',
    httpStatus: 400,
    retryable: false,
    description: 'Failed to parse uploaded file',
  },
  AI_UNAVAILABLE: {
    code: 'AI_UNAVAILABLE',
    httpStatus: 503,
    retryable: true,
    description: 'AI service not configured or unavailable',
  },
};

/**
 * Format an error response with proper structure
 */
export function formatErrorResponse(
  def: ApiErrorDefinition,
  message: string,
  details?: Record<string, unknown>,
): { body: ApiErrorResponse; status: number } {
  return {
    body: {
      code: def.code,
      message,
      retryable: def.retryable,
      retryAfterMs: def.retryable ? 1000 : undefined,
      details,
    },
    status: def.httpStatus,
  };
}

/**
 * Helper to create error response JSON
 */
export function createErrorJson(
  def: ApiErrorDefinition,
  message: string,
  details?: Record<string, unknown>,
) {
  const response = formatErrorResponse(def, message, details);
  return {
    json: response.body,
    status: response.status,
  };
}
