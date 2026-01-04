/**
 * Cuentica API Error Classes
 */

import type { ApiErrorDetail, ApiErrorResponse } from './types/common.js';

/**
 * Base error class for Cuentica API errors
 */
export class CuenticaError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'CuenticaError';
  }

  /**
   * Create error from API response
   */
  static fromResponse(status: number, body: unknown): CuenticaError {
    // Handle structured error response
    if (typeof body === 'object' && body !== null) {
      // Format: { error: { message, code, details } }
      if ('error' in body) {
        const errorBody = body as { error: { message?: string; code?: string; details?: unknown } };
        return new CuenticaError(
          errorBody.error.message || `HTTP ${status}`,
          status,
          errorBody.error.code,
          errorBody.error.details
        );
      }

      // Format: { message, errors: [...] }
      if ('message' in body) {
        const errorBody = body as ApiErrorResponse;
        const detailMessages = errorBody.errors
          ?.map((e: ApiErrorDetail) => `${e.field}: ${e.message}`)
          .join('; ');

        return new CuenticaError(
          detailMessages ? `${errorBody.message} - ${detailMessages}` : errorBody.message,
          status,
          undefined,
          errorBody.errors
        );
      }
    }

    return new CuenticaError(`HTTP ${status}`, status);
  }
}

/**
 * Configuration error (missing API token, etc.)
 */
export class CuenticaConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CuenticaConfigError';
  }
}

/**
 * Rate limit exceeded error
 */
export class CuenticaRateLimitError extends CuenticaError {
  constructor(
    message: string = 'Rate limit exceeded',
    public readonly retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'CuenticaRateLimitError';
  }
}

/**
 * Network/connection error
 */
export class CuenticaNetworkError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'CuenticaNetworkError';
  }
}
