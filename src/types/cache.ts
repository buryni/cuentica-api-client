/**
 * Cache types for the Cuentica API client
 */

/**
 * Cache configuration options
 */
export interface CacheConfig {
  /** Enable/disable caching (default: true) */
  enabled?: boolean;
  /** Default TTL in milliseconds for list endpoints (default: 5 minutes) */
  listTtl?: number;
  /** TTL in milliseconds for company/tags endpoints (default: 10 minutes) */
  staticTtl?: number;
}

/**
 * Cache entry stored internally
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Response wrapper that indicates if data came from cache
 */
export interface CachedResponse<T> {
  data: T;
  cached: boolean;
}

/**
 * Cache TTL configuration for different endpoint types
 */
export const CacheTTL = {
  /** TTL for list endpoints (5 minutes) */
  LIST: 5 * 60 * 1000,
  /** TTL for static data like company/tags (10 minutes) */
  STATIC: 10 * 60 * 1000,
} as const;

/**
 * Cache key patterns for invalidation
 * NOTE: These must match the API paths (singular form)
 */
export type CacheKeyPattern =
  | 'customer'
  | 'invoice'
  | 'expense'
  | 'provider'
  | 'account'
  | 'income'
  | 'document'
  | 'tag'
  | 'transfer'
  | 'company';
