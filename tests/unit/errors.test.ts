/**
 * Unit tests for error classes
 */

import { describe, it, expect } from 'vitest';
import {
  CuenticaError,
  CuenticaConfigError,
  CuenticaRateLimitError,
  CuenticaNetworkError,
} from '../../src/errors.js';

describe('CuenticaError', () => {
  describe('constructor', () => {
    it('should create error with message and status code', () => {
      const error = new CuenticaError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('CuenticaError');
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('should create error with all properties', () => {
      const error = new CuenticaError('Test error', 400, 'TEST_CODE', { field: 'value' });

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ field: 'value' });
    });
  });

  describe('fromResponse', () => {
    it('should create error from response with error.message format', () => {
      const body = {
        error: {
          message: 'Resource not found',
          code: 'NOT_FOUND',
          details: { id: 123 },
        },
      };

      const error = CuenticaError.fromResponse(404, body);

      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.details).toEqual({ id: 123 });
    });

    it('should create error from response with message and errors format', () => {
      const body = {
        message: 'Validation failed',
        errors: [
          { field: 'email', message: 'invalid format' },
          { field: 'name', message: 'required' },
        ],
      };

      const error = CuenticaError.fromResponse(400, body);

      expect(error.message).toBe('Validation failed - email: invalid format; name: required');
      expect(error.statusCode).toBe(400);
    });

    it('should create error from response with message only', () => {
      const body = {
        message: 'Bad request',
      };

      const error = CuenticaError.fromResponse(400, body);

      expect(error.message).toBe('Bad request');
      expect(error.statusCode).toBe(400);
    });

    it('should create error from response with error but no message', () => {
      const body = {
        error: {
          code: 'UNKNOWN',
        },
      };

      const error = CuenticaError.fromResponse(500, body);

      expect(error.message).toBe('HTTP 500');
      expect(error.code).toBe('UNKNOWN');
    });

    it('should create generic error for unknown format', () => {
      const error = CuenticaError.fromResponse(500, 'Unknown error');

      expect(error.message).toBe('HTTP 500');
      expect(error.statusCode).toBe(500);
    });

    it('should create generic error for null body', () => {
      const error = CuenticaError.fromResponse(500, null);

      expect(error.message).toBe('HTTP 500');
      expect(error.statusCode).toBe(500);
    });
  });
});

describe('CuenticaConfigError', () => {
  it('should create config error', () => {
    const error = new CuenticaConfigError('API token is required');

    expect(error.message).toBe('API token is required');
    expect(error.name).toBe('CuenticaConfigError');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('CuenticaRateLimitError', () => {
  it('should create rate limit error with default message', () => {
    const error = new CuenticaRateLimitError();

    expect(error.message).toBe('Rate limit exceeded');
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(error.name).toBe('CuenticaRateLimitError');
    expect(error.retryAfter).toBeUndefined();
  });

  it('should create rate limit error with custom message and retryAfter', () => {
    const error = new CuenticaRateLimitError('Too many requests', 60);

    expect(error.message).toBe('Too many requests');
    expect(error.retryAfter).toBe(60);
  });
});

describe('CuenticaNetworkError', () => {
  it('should create network error', () => {
    const error = new CuenticaNetworkError('Connection refused');

    expect(error.message).toBe('Connection refused');
    expect(error.name).toBe('CuenticaNetworkError');
    expect(error.cause).toBeUndefined();
  });

  it('should create network error with cause', () => {
    const cause = new Error('ECONNREFUSED');
    const error = new CuenticaNetworkError('Connection refused', cause);

    expect(error.message).toBe('Connection refused');
    expect(error.cause).toBe(cause);
  });
});
