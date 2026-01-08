/**
 * Integration tests for Provider endpoint
 *
 * CRITICAL: These tests VALIDATE that filters actually work,
 * not just that the API call doesn't fail.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { CuenticaAPI } from '../../src/api.js';
import { shouldRunIntegrationTests, createTestClient, SKIP_MESSAGE } from './setup.js';

describe.skipIf(!shouldRunIntegrationTests())('ProviderEndpoint Integration', () => {
  let api: CuenticaAPI;

  beforeAll(() => {
    api = createTestClient();
  });

  describe('list', () => {
    it('should list providers', async () => {
      const result = await api.providers.list({ page_size: 10 });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
    });
  });

  describe('filter by q (search)', () => {
    it('should filter providers by search query - VALIDATES results', async () => {
      const all = await api.providers.list({ page_size: 20 });

      if (all.data.length > 0) {
        // Find a provider with a business_name to search for
        const providerWithName = all.data.find((p) => p.business_name && p.business_name.length > 3);

        if (providerWithName) {
          // Search for part of the name
          const searchTerm = providerWithName.business_name.substring(0, 4);
          const filtered = await api.providers.list({
            q: searchTerm,
            page_size: 100,
          });

          // VALIDATE: At least one result should match the search term
          expect(filtered.data.length).toBeGreaterThan(0);

          // The original provider should be in the results
          const found = filtered.data.some((p) => p.id === providerWithName.id);
          expect(
            found,
            `Provider ${providerWithName.id} with name "${providerWithName.business_name}" not found when searching for "${searchTerm}"`
          ).toBe(true);
        }
      }
    });

    it('should filter providers by CIF search - VALIDATES results', async () => {
      const all = await api.providers.list({ page_size: 20 });

      if (all.data.length > 0) {
        const providerWithCIF = all.data.find((p) => p.cif);

        if (providerWithCIF) {
          const filtered = await api.providers.list({
            q: providerWithCIF.cif,
            page_size: 100,
          });

          // VALIDATE: Should find the provider with that CIF
          const found = filtered.data.some((p) => p.cif === providerWithCIF.cif);
          expect(
            found,
            `Provider with CIF "${providerWithCIF.cif}" not found in search results`
          ).toBe(true);
        }
      }
    });
  });

  describe('pagination', () => {
    it('should return correct pagination metadata', async () => {
      const result = await api.providers.list({ page: 1, page_size: 5 });

      expect(result.pagination.currentPage).toBe(1);
      // Note: API may not honor exact page_size
      expect(result.pagination.itemsPerPage).toBeDefined();
    });

    it('should return different data for different pages', async () => {
      const page1 = await api.providers.list({ page: 1, page_size: 5 });
      const page2 = await api.providers.list({ page: 2, page_size: 5 });

      if (page1.pagination.totalPages > 1 && page2.data.length > 0) {
        const ids1 = new Set(page1.data.map((p) => p.id));
        const ids2 = new Set(page2.data.map((p) => p.id));

        const intersection = [...ids1].filter((id) => ids2.has(id));
        expect(
          intersection.length,
          `Pages 1 and 2 share ${intersection.length} IDs: ${intersection.join(', ')}`
        ).toBe(0);
      }
    });
  });

  describe('get', () => {
    it('should get provider by ID if exists', async () => {
      const list = await api.providers.list({ page_size: 1 });

      if (list.data.length > 0) {
        const provider = await api.providers.get(list.data[0].id);

        expect(provider).toBeDefined();
        expect(provider.id).toBe(list.data[0].id);
        expect(provider.cif).toBeDefined();
        expect(provider.business_name).toBeDefined();
      }
    });
  });

  describe('searchByCIF', () => {
    it('should find provider by exact CIF', async () => {
      const list = await api.providers.list({ page_size: 10 });
      const providerWithCIF = list.data.find((p) => p.cif);

      if (providerWithCIF) {
        const found = await api.providers.searchByCIF(providerWithCIF.cif);

        expect(found).not.toBeNull();
        expect(found!.cif.toUpperCase()).toBe(providerWithCIF.cif.toUpperCase());
      }
    });

    it('should return null for non-existent CIF', async () => {
      const found = await api.providers.searchByCIF('ZZZZZZZZZ');

      expect(found).toBeNull();
    });
  });
});

describe.skipIf(shouldRunIntegrationTests())('ProviderEndpoint Integration (Skipped)', () => {
  it.skip(SKIP_MESSAGE, () => {});
});
