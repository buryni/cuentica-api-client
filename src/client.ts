/**
 * Cuentica API HTTP Client
 *
 * Handles authentication, request/response processing, and error handling.
 * Based on learnings from integrating with the real API (vs documentation).
 */

import { DEFAULT_API_URL } from './constants/index.js';
import {
  CuenticaError,
  CuenticaConfigError,
  CuenticaRateLimitError,
  CuenticaNetworkError,
} from './errors.js';
import type { PaginationInfo, PaginatedResponse, CachedPaginatedResponse } from './types/common.js';
import type { CacheConfig, CachedResponse, CacheKeyPattern } from './types/cache.js';
import { CacheManager } from './cache.js';

/**
 * Client configuration options
 */
export interface CuenticaClientConfig {
  /** API token (X-AUTH-TOKEN) */
  apiToken: string;
  /** API base URL (default: https://api.cuentica.com) */
  apiUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Custom logger function */
  logger?: (message: string, data?: unknown) => void;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Cache configuration */
  cache?: CacheConfig;
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  /** Skip cache for this request */
  skipCache?: boolean;
}

/**
 * Internal request result with headers
 */
interface RequestResult<T> {
  data: T;
  headers: Headers;
}

/**
 * Cuentica API Client
 */
export class CuenticaClient {
  private readonly apiToken: string;
  private readonly apiUrl: string;
  private readonly debug: boolean;
  private readonly logger: (message: string, data?: unknown) => void;
  private readonly timeout: number;
  private readonly cacheManager: CacheManager;

  constructor(config: CuenticaClientConfig) {
    if (!config.apiToken) {
      throw new CuenticaConfigError('API token is required');
    }

    this.apiToken = config.apiToken;
    this.apiUrl = config.apiUrl || DEFAULT_API_URL;
    this.debug = config.debug || false;
    this.timeout = config.timeout || 30000;
    this.logger = config.logger || ((msg, data) => {
      if (this.debug) {
        console.log(`[CuenticaClient] ${msg}`, data || '');
      }
    });
    this.cacheManager = new CacheManager(config.cache);
  }

  /**
   * Make an API request
   */
  async request<T>(options: RequestOptions): Promise<T> {
    const result = await this.makeRequest<T>(options);
    return result.data;
  }

  /**
   * Make an API request with cache information
   */
  async cachedRequest<T>(options: RequestOptions): Promise<CachedResponse<T>> {
    const result = await this.makeRequestWithCache<T>(options);
    return {
      data: result.data,
      cached: result.cached,
    };
  }

  /**
   * Make a paginated API request with cache support
   */
  async paginatedRequest<T>(options: RequestOptions): Promise<PaginatedResponse<T>> {
    const canCache = options.method === 'GET' && !options.skipCache;

    if (canCache) {
      const cacheKey = CacheManager.generateKey(options.path, options.query);
      const cachedData = this.cacheManager.get<{ data: T[]; pagination: PaginationInfo }>(cacheKey);

      if (cachedData !== undefined) {
        this.logger('Cache hit (paginated)', { path: options.path, key: cacheKey });
        return cachedData;
      }

      const result = await this.makeRequest<T[]>(options);
      const pagination = this.parsePaginationHeaders(result.headers);

      const paginatedResult = {
        data: result.data,
        pagination,
      };

      const ttl = this.cacheManager.getTtlForPath(options.path);
      this.cacheManager.set(cacheKey, paginatedResult, ttl);
      this.logger('Cache set (paginated)', { path: options.path, key: cacheKey, ttl });

      return paginatedResult;
    }

    const result = await this.makeRequest<T[]>(options);
    const pagination = this.parsePaginationHeaders(result.headers);

    return {
      data: result.data,
      pagination,
    };
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidateCache(pattern: CacheKeyPattern): number {
    return this.cacheManager.invalidate(pattern);
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cacheManager.clear();
  }

  /**
   * Delete a specific cache entry by key
   */
  deleteFromCache(key: string): boolean {
    return this.cacheManager.delete(key);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return this.cacheManager.stats();
  }

  /**
   * Download a file (e.g., invoice PDF)
   */
  async download(path: string): Promise<{ content: Buffer; mimeType: string }> {
    const url = `${this.apiUrl}${path}`;

    this.logger('Downloading file', { path });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-AUTH-TOKEN': this.apiToken,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw CuenticaError.fromResponse(response.status, await this.parseResponseBody(response));
      }

      const buffer = await response.arrayBuffer();
      const mimeType = response.headers.get('content-type') || 'application/octet-stream';

      return {
        content: Buffer.from(buffer),
        mimeType,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleFetchError(error);
    }
  }

  /**
   * Upload a file
   */
  async upload(
    path: string,
    file: Buffer | Uint8Array,
    filename: string,
    mimeType: string
  ): Promise<{ id: number }> {
    const url = `${this.apiUrl}${path}`;

    this.logger('Uploading file', { path, filename, mimeType });

    const formData = new FormData();
    const uint8Array = file instanceof Buffer ? new Uint8Array(file) : file;
    const blob = new Blob([uint8Array], { type: mimeType });
    formData.append('file', blob, filename);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-AUTH-TOKEN': this.apiToken,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const body = await this.parseResponseBody(response);
        throw CuenticaError.fromResponse(response.status, body);
      }

      return response.json() as Promise<{ id: number }>;
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleFetchError(error);
    }
  }

  /**
   * Internal method to make HTTP requests with cache support
   */
  private async makeRequestWithCache<T>(
    options: RequestOptions
  ): Promise<RequestResult<T> & { cached: boolean }> {
    const canCache = options.method === 'GET' && !options.skipCache;

    if (canCache) {
      const cacheKey = CacheManager.generateKey(options.path, options.query);
      const cachedData = this.cacheManager.get<T>(cacheKey);

      if (cachedData !== undefined) {
        this.logger('Cache hit', { path: options.path, key: cacheKey });
        return {
          data: cachedData,
          headers: new Headers(),
          cached: true,
        };
      }
    }

    const result = await this.makeRequest<T>(options);

    if (canCache) {
      const cacheKey = CacheManager.generateKey(options.path, options.query);
      const ttl = this.cacheManager.getTtlForPath(options.path);
      this.cacheManager.set(cacheKey, result.data, ttl);
      this.logger('Cache set', { path: options.path, key: cacheKey, ttl });
    }

    return { ...result, cached: false };
  }

  /**
   * Internal method to make HTTP requests
   */
  private async makeRequest<T>(options: RequestOptions): Promise<RequestResult<T>> {
    // Build URL with query params
    let url = `${this.apiUrl}${options.path}`;
    if (options.query) {
      const filteredQuery: Record<string, string> = {};
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          filteredQuery[key] = String(value);
        }
      }
      if (Object.keys(filteredQuery).length > 0) {
        const params = new URLSearchParams(filteredQuery);
        url += `?${params.toString()}`;
      }
    }

    // Build headers
    // IMPORTANT: Do NOT set Content-Type for GET requests without body
    // The API returns "Invalid Json" error if Content-Type is sent on GET
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-AUTH-TOKEN': this.apiToken,
    };

    const fetchOptions: RequestInit = {
      method: options.method,
      headers,
    };

    // Only add Content-Type and body for requests with body
    if (options.body) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(options.body);
    }

    this.logger(`${options.method} ${options.path}`, {
      hasBody: !!options.body,
      query: options.query,
    });

    if (options.body && this.debug) {
      this.logger('Request body', options.body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    fetchOptions.signal = controller.signal;

    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return { data: {} as T, headers: response.headers };
      }

      // Parse response body
      const data = await this.parseResponseBody(response);

      // Handle errors
      if (!response.ok) {
        this.logger(`Error ${response.status}`, data);

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new CuenticaRateLimitError(
            'Rate limit exceeded',
            retryAfter ? parseInt(retryAfter, 10) : undefined
          );
        }

        throw CuenticaError.fromResponse(response.status, data);
      }

      this.logger(`Response ${response.status}`, { path: options.path });

      return { data: data as T, headers: response.headers };
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleFetchError(error);
    }
  }

  /**
   * Parse response body based on content type
   */
  private async parseResponseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    if (contentType?.includes('application/pdf')) {
      const buffer = await response.arrayBuffer();
      return { pdf: Buffer.from(buffer).toString('base64') };
    }

    const text = await response.text();
    return { message: text };
  }

  /**
   * Parse pagination headers from response
   */
  private parsePaginationHeaders(headers: Headers): PaginationInfo {
    return {
      currentPage: parseInt(headers.get('X-Page') || '1', 10),
      totalPages: parseInt(headers.get('X-Total-Pages') || '1', 10),
      totalItems: parseInt(headers.get('X-Total-Count') || '0', 10),
      itemsPerPage: parseInt(headers.get('X-Per-Page') || '25', 10),
    };
  }

  /**
   * Handle fetch errors and convert to appropriate error types
   */
  private handleFetchError(error: unknown): never {
    // Re-throw our own errors
    if (
      error instanceof CuenticaError ||
      error instanceof CuenticaRateLimitError ||
      error instanceof CuenticaConfigError
    ) {
      throw error;
    }

    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new CuenticaNetworkError('Request timeout');
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CuenticaNetworkError('Network error: ' + error.message, error);
    }

    // Unknown error
    throw new CuenticaNetworkError(
      error instanceof Error ? error.message : 'Unknown error',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Create a client instance from environment variables
 */
export function createClientFromEnv(options?: Partial<CuenticaClientConfig>): CuenticaClient {
  const apiToken = process.env.CUENTICA_API_TOKEN;
  const apiUrl = process.env.CUENTICA_API_URL;

  if (!apiToken) {
    throw new CuenticaConfigError(
      'CUENTICA_API_TOKEN environment variable is not set'
    );
  }

  return new CuenticaClient({
    apiToken,
    apiUrl,
    ...options,
  });
}
