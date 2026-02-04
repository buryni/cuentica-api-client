/**
 * Unit tests for CuenticaClient - cache integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CuenticaClient, CuenticaClientConfig } from '../../src/client.js';
import { CuenticaConfigError } from '../../src/errors.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CuenticaClient', () => {
  const defaultConfig: CuenticaClientConfig = {
    apiToken: 'test-token',
    apiUrl: 'https://api.test.com',
    debug: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create client with valid config', () => {
      const client = new CuenticaClient(defaultConfig);
      expect(client).toBeDefined();
    });

    it('should throw error without API token', () => {
      expect(() => new CuenticaClient({ apiToken: '' })).toThrow(CuenticaConfigError);
    });
  });

  describe('cache operations', () => {
    let client: CuenticaClient;

    beforeEach(() => {
      client = new CuenticaClient(defaultConfig);
    });

    it('should invalidate cache by pattern', () => {
      // The invalidation should work with the correct pattern (empty cache)
      const count = client.invalidateCache('customer');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should clear all cache', () => {
      client.clearCache();
      const stats = client.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should delete specific cache entry', () => {
      const deleted = client.deleteFromCache('nonexistent');
      expect(deleted).toBe(false);
    });

    it('should return cache stats', () => {
      const stats = client.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('keys');
      expect(Array.isArray(stats.keys)).toBe(true);
    });
  });

  describe('cachedRequest', () => {
    let client: CuenticaClient;

    beforeEach(() => {
      client = new CuenticaClient(defaultConfig);
    });

    it('should cache GET requests', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      // First request - should hit the API
      const result1 = await client.cachedRequest({
        method: 'GET',
        path: '/customer/1',
      });

      expect(result1.data).toEqual(mockData);
      expect(result1.cached).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second request - should use cache
      const result2 = await client.cachedRequest({
        method: 'GET',
        path: '/customer/1',
      });

      expect(result2.data).toEqual(mockData);
      expect(result2.cached).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it('should skip cache when skipCache is true', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      // First request
      await client.cachedRequest({
        method: 'GET',
        path: '/customer/1',
      });

      // Second request with skipCache
      const result2 = await client.cachedRequest({
        method: 'GET',
        path: '/customer/1',
        skipCache: true,
      });

      expect(result2.cached).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('paginatedRequest', () => {
    let client: CuenticaClient;

    beforeEach(() => {
      client = new CuenticaClient(defaultConfig);
    });

    it('should cache paginated GET requests', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
          'X-Page': '1',
          'X-Total-Pages': '2',
          'X-Total-Count': '50',
          'X-Per-Page': '25',
        }),
        json: () => Promise.resolve(mockData),
      });

      // First request - should hit the API
      const result1 = await client.paginatedRequest({
        method: 'GET',
        path: '/customer',
      });

      expect(result1.data).toEqual(mockData);
      expect(result1.pagination.currentPage).toBe(1);
      expect(result1.pagination.totalPages).toBe(2);
      expect(result1.pagination.totalItems).toBe(50);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second request - should use cache
      const result2 = await client.paginatedRequest({
        method: 'GET',
        path: '/customer',
      });

      expect(result2.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it('should not cache POST requests', async () => {
      const mockData = { id: 1 };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
          'X-Page': '1',
          'X-Total-Pages': '1',
          'X-Total-Count': '1',
          'X-Per-Page': '25',
        }),
        json: () => Promise.resolve([mockData]),
      });

      await client.paginatedRequest({
        method: 'POST',
        path: '/customer',
        body: { name: 'Test' },
      });

      await client.paginatedRequest({
        method: 'POST',
        path: '/customer',
        body: { name: 'Test' },
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('cache invalidation with correct patterns', () => {
    let client: CuenticaClient;

    beforeEach(() => {
      client = new CuenticaClient(defaultConfig);
    });

    it('should invalidate customer cache with singular pattern', async () => {
      const mockData = [{ id: 1 }];
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
          'X-Page': '1',
          'X-Total-Pages': '1',
          'X-Total-Count': '1',
          'X-Per-Page': '25',
        }),
        json: () => Promise.resolve(mockData),
      });

      // Populate cache
      await client.paginatedRequest({
        method: 'GET',
        path: '/customer',
      });

      // Verify cache is populated
      let stats = client.getCacheStats();
      expect(stats.keys.some(k => k.startsWith('customer'))).toBe(true);

      // Invalidate with correct singular pattern
      client.invalidateCache('customer');

      // Verify cache is cleared
      stats = client.getCacheStats();
      expect(stats.keys.filter(k => k.startsWith('customer')).length).toBe(0);
    });

    it('should delete specific cache entry', async () => {
      const mockData = { id: 1, name: 'Test Customer' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      // Populate cache with specific customer
      await client.cachedRequest({
        method: 'GET',
        path: '/customer/1',
      });

      // Verify cache has the entry
      let stats = client.getCacheStats();
      expect(stats.keys.includes('customer/1')).toBe(true);

      // Delete specific entry
      const deleted = client.deleteFromCache('customer/1');
      expect(deleted).toBe(true);

      // Verify entry is gone
      stats = client.getCacheStats();
      expect(stats.keys.includes('customer/1')).toBe(false);
    });
  });

  describe('request', () => {
    let client: CuenticaClient;

    beforeEach(() => {
      client = new CuenticaClient(defaultConfig);
    });

    it('should make POST requests without caching', async () => {
      const mockData = { id: 1 };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const result = await client.request({
        method: 'POST',
        path: '/customer',
        body: { name: 'Test' },
      });

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/customer',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
        })
      );
    });

    it('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      const result = await client.request({
        method: 'DELETE',
        path: '/customer/1',
      });

      expect(result).toEqual({});
    });

    it('should build URL with query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve([]),
      });

      await client.request({
        method: 'GET',
        path: '/customer',
        query: { q: 'test', page: 1, active: undefined },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/customer?q=test&page=1',
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    let client: CuenticaClient;

    beforeEach(() => {
      client = new CuenticaClient(defaultConfig);
    });

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ message: 'Bad request' }),
      });

      await expect(client.request({
        method: 'GET',
        path: '/customer/1',
      })).rejects.toThrow('Bad request');
    });

    it('should handle rate limit error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({
          'content-type': 'application/json',
          'Retry-After': '60',
        }),
        json: () => Promise.resolve({ message: 'Too many requests' }),
      });

      await expect(client.request({
        method: 'GET',
        path: '/customer/1',
      })).rejects.toMatchObject({
        statusCode: 429,
        retryAfter: 60,
      });
    });

    it('should handle network timeout', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(client.request({
        method: 'GET',
        path: '/customer/1',
      })).rejects.toThrow('Request timeout');
    });

    it('should handle fetch errors', async () => {
      const fetchError = new TypeError('fetch failed');
      mockFetch.mockRejectedValueOnce(fetchError);

      await expect(client.request({
        method: 'GET',
        path: '/customer/1',
      })).rejects.toThrow('Network error');
    });
  });
});
