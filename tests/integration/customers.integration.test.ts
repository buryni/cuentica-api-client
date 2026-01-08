/**
 * Integration tests for Customer endpoint
 *
 * CRITICAL: These tests VALIDATE that filters actually work,
 * not just that the API call doesn't fail.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { CuenticaAPI } from '../../src/api.js';
import { shouldRunIntegrationTests, createTestClient, SKIP_MESSAGE } from './setup.js';

describe.skipIf(!shouldRunIntegrationTests())('CustomerEndpoint Integration', () => {
  let api: CuenticaAPI;

  beforeAll(() => {
    api = createTestClient();
  });

  describe('list', () => {
    it('should list customers', async () => {
      const result = await api.customers.list({ page_size: 10 });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
    });
  });

  describe('filter by q (search)', () => {
    it('should filter customers by search query - VALIDATES results', async () => {
      const all = await api.customers.list({ page_size: 20 });

      if (all.data.length > 0) {
        // Find a customer with a business_name to search for
        const customerWithName = all.data.find((c) => c.business_name && c.business_name.length > 3);

        if (customerWithName) {
          // Search for part of the name
          const searchTerm = customerWithName.business_name.substring(0, 4);
          const filtered = await api.customers.list({
            q: searchTerm,
            page_size: 100,
          });

          // VALIDATE: At least one result should match the search term
          expect(filtered.data.length).toBeGreaterThan(0);

          // The original customer should be in the results
          const found = filtered.data.some((c) => c.id === customerWithName.id);
          expect(
            found,
            `Customer ${customerWithName.id} with name "${customerWithName.business_name}" not found when searching for "${searchTerm}"`
          ).toBe(true);
        }
      }
    });

    it('should filter customers by CIF search - VALIDATES results', async () => {
      const all = await api.customers.list({ page_size: 20 });

      if (all.data.length > 0) {
        const customerWithCIF = all.data.find((c) => c.cif);

        if (customerWithCIF) {
          const filtered = await api.customers.list({
            q: customerWithCIF.cif,
            page_size: 100,
          });

          // VALIDATE: Should find the customer with that CIF
          const found = filtered.data.some((c) => c.cif === customerWithCIF.cif);
          expect(
            found,
            `Customer with CIF "${customerWithCIF.cif}" not found in search results`
          ).toBe(true);
        }
      }
    });
  });

  describe('pagination', () => {
    it('should return correct pagination metadata', async () => {
      const result = await api.customers.list({ page: 1, page_size: 5 });

      expect(result.pagination.currentPage).toBe(1);
      // Note: API may not honor exact page_size
      expect(result.pagination.itemsPerPage).toBeDefined();
    });

    it('should return different data for different pages', async () => {
      const page1 = await api.customers.list({ page: 1, page_size: 5 });
      const page2 = await api.customers.list({ page: 2, page_size: 5 });

      if (page1.pagination.totalPages > 1 && page2.data.length > 0) {
        const ids1 = new Set(page1.data.map((c) => c.id));
        const ids2 = new Set(page2.data.map((c) => c.id));

        const intersection = [...ids1].filter((id) => ids2.has(id));
        expect(
          intersection.length,
          `Pages 1 and 2 share ${intersection.length} IDs: ${intersection.join(', ')}`
        ).toBe(0);
      }
    });
  });

  describe('get', () => {
    it('should get customer by ID if exists', async () => {
      const list = await api.customers.list({ page_size: 1 });

      if (list.data.length > 0) {
        const customer = await api.customers.get(list.data[0].id);

        expect(customer).toBeDefined();
        expect(customer.id).toBe(list.data[0].id);
        expect(customer.cif).toBeDefined();
        expect(customer.business_name).toBeDefined();
      }
    });
  });

  describe('searchByCIF', () => {
    it('should find customer by exact CIF', async () => {
      const list = await api.customers.list({ page_size: 10 });
      const customerWithCIF = list.data.find((c) => c.cif);

      if (customerWithCIF) {
        const found = await api.customers.searchByCIF(customerWithCIF.cif);

        expect(found).not.toBeNull();
        expect(found!.cif.toUpperCase()).toBe(customerWithCIF.cif.toUpperCase());
      }
    });

    it('should return null for non-existent CIF', async () => {
      const found = await api.customers.searchByCIF('ZZZZZZZZZ');

      expect(found).toBeNull();
    });
  });
});

describe.skipIf(shouldRunIntegrationTests())('CustomerEndpoint Integration (Skipped)', () => {
  it.skip(SKIP_MESSAGE, () => {});
});
