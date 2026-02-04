/**
 * Unit tests for CacheManager
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CacheManager } from '../../src/cache.js';
import { CacheTTL } from '../../src/types/cache.js';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create cache with default config', () => {
      expect(cache.enabled).toBe(true);
    });

    it('should allow disabling cache', () => {
      const disabledCache = new CacheManager({ enabled: false });
      expect(disabledCache.enabled).toBe(false);
    });

    it('should accept custom TTLs', () => {
      const customCache = new CacheManager({
        listTtl: 1000,
        staticTtl: 2000,
      });
      expect(customCache.enabled).toBe(true);
    });
  });

  describe('get/set', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', { id: 1, name: 'test' });
      const result = cache.get<{ id: number; name: string }>('key1');
      expect(result).toEqual({ id: 1, name: 'test' });
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should return undefined when cache is disabled', () => {
      const disabledCache = new CacheManager({ enabled: false });
      disabledCache.set('key1', 'value1');
      expect(disabledCache.get('key1')).toBeUndefined();
    });

    it('should expire entries after TTL', () => {
      cache.set('key1', 'value1', 1000);

      expect(cache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(1001);

      expect(cache.get('key1')).toBeUndefined();
    });

    it('should not expire entries before TTL', () => {
      cache.set('key1', 'value1', 1000);

      vi.advanceTimersByTime(999);

      expect(cache.get('key1')).toBe('value1');
    });
  });

  describe('has', () => {
    it('should return true for existing non-expired keys', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired keys', () => {
      cache.set('key1', 'value1', 100);
      vi.advanceTimersByTime(101);
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing keys', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should return false for non-existent keys', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('invalidate', () => {
    it('should invalidate entries by pattern prefix', () => {
      cache.set('customers', []);
      cache.set('customers?page=1', []);
      cache.set('customers?page=2', []);
      cache.set('invoices', []);

      const count = cache.invalidate('customers');

      expect(count).toBe(3);
      expect(cache.get('customers')).toBeUndefined();
      expect(cache.get('customers?page=1')).toBeUndefined();
      expect(cache.get('customers?page=2')).toBeUndefined();
      expect(cache.get('invoices')).toEqual([]);
    });

    it('should return 0 when no entries match', () => {
      cache.set('invoices', []);
      const count = cache.invalidate('customers');
      expect(count).toBe(0);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBeUndefined();
    });
  });

  describe('stats', () => {
    it('should return cache statistics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.stats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });

    it('should exclude expired entries from stats', () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 1000);

      vi.advanceTimersByTime(500);

      const stats = cache.stats();

      expect(stats.size).toBe(1);
      expect(stats.keys).toContain('key2');
      expect(stats.keys).not.toContain('key1');
    });
  });

  describe('generateKey', () => {
    it('should generate key from path without query', () => {
      const key = CacheManager.generateKey('/customers');
      expect(key).toBe('customers');
    });

    it('should generate key with sorted query params', () => {
      const key = CacheManager.generateKey('/customers', {
        page: 1,
        per_page: 25,
        sort: 'name',
      });
      expect(key).toBe('customers?page=1&per_page=25&sort=name');
    });

    it('should exclude undefined query params', () => {
      const key = CacheManager.generateKey('/customers', {
        page: 1,
        filter: undefined,
      });
      expect(key).toBe('customers?page=1');
    });

    it('should sort query params alphabetically', () => {
      const key = CacheManager.generateKey('/customers', {
        z: 1,
        a: 2,
        m: 3,
      });
      expect(key).toBe('customers?a=2&m=3&z=1');
    });
  });

  describe('getTtlForPath', () => {
    it('should return static TTL for company endpoint', () => {
      const ttl = cache.getTtlForPath('/company');
      expect(ttl).toBe(CacheTTL.STATIC);
    });

    it('should return static TTL for tags endpoint', () => {
      const ttl = cache.getTtlForPath('/tag');
      expect(ttl).toBe(CacheTTL.STATIC);
    });

    it('should return list TTL for other endpoints', () => {
      expect(cache.getTtlForPath('/customers')).toBe(CacheTTL.LIST);
      expect(cache.getTtlForPath('/invoices')).toBe(CacheTTL.LIST);
      expect(cache.getTtlForPath('/expenses')).toBe(CacheTTL.LIST);
    });
  });

  describe('TTL constants', () => {
    it('should have correct TTL values', () => {
      expect(CacheTTL.LIST).toBe(5 * 60 * 1000); // 5 minutes
      expect(CacheTTL.STATIC).toBe(10 * 60 * 1000); // 10 minutes
    });
  });
});
