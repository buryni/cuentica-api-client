/**
 * Cache Manager for Cuentica API Client
 *
 * Provides in-memory caching with TTL support and pattern-based invalidation.
 */

import type { CacheConfig, CacheEntry, CacheKeyPattern } from './types/cache.js';
import { CacheTTL } from './types/cache.js';

/**
 * Cache Manager implementation using Map
 */
export class CacheManager {
  private readonly cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly config: Required<CacheConfig>;

  constructor(config?: CacheConfig) {
    this.config = {
      enabled: config?.enabled ?? true,
      listTtl: config?.listTtl ?? CacheTTL.LIST,
      staticTtl: config?.staticTtl ?? CacheTTL.STATIC,
    };
  }

  /**
   * Check if caching is enabled
   */
  get enabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get a value from cache
   * Returns undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    if (!this.config.enabled) {
      return undefined;
    }

    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    if (!this.config.enabled) {
      return;
    }

    const effectiveTtl = ttl ?? this.config.listTtl;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: effectiveTtl,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate cache entries by pattern
   * Pattern matches the beginning of keys
   */
  invalidate(pattern: CacheKeyPattern): number {
    let count = 0;
    const prefix = pattern;

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    // Clean expired entries first
    this.cleanExpired();

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Generate cache key for API requests
   */
  static generateKey(path: string, query?: Record<string, unknown>): string {
    const base = path.replace(/^\//, '');

    if (!query || Object.keys(query).length === 0) {
      return base;
    }

    // Sort query params for consistent keys
    const sortedParams = Object.keys(query)
      .filter((k) => query[k] !== undefined)
      .sort()
      .map((k) => `${k}=${String(query[k])}`)
      .join('&');

    return sortedParams ? `${base}?${sortedParams}` : base;
  }

  /**
   * Determine TTL based on endpoint pattern
   */
  getTtlForPath(path: string): number {
    // Static data endpoints (longer TTL)
    if (path.includes('/company') || path.includes('/tag')) {
      return this.config.staticTtl;
    }

    // List endpoints (shorter TTL)
    return this.config.listTtl;
  }

  /**
   * Check if an entry is expired
   */
  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Remove all expired entries
   */
  private cleanExpired(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }
}
