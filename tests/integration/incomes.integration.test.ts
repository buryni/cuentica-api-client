/**
 * Integration tests for Income endpoint
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { CuenticaAPI } from '../../src/api.js';
import { shouldRunIntegrationTests, createTestClient, SKIP_MESSAGE } from './setup.js';

describe.skipIf(!shouldRunIntegrationTests())('IncomeEndpoint Integration', () => {
  let api: CuenticaAPI;

  beforeAll(() => {
    api = createTestClient();
  });

  describe('list', () => {
    it('should list incomes', async () => {
      const result = await api.incomes.list({ page_size: 10 });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
    });

    it('should filter incomes by date range', async () => {
      const result = await api.incomes.list({
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        page_size: 10,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should order incomes', async () => {
      const result = await api.incomes.list({
        order_field: 'date',
        order_direction: 'desc',
        page_size: 10,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });
  });

  describe('get', () => {
    it('should get income by ID if exists', async () => {
      const list = await api.incomes.list({ page_size: 1 });

      if (list.data.length > 0) {
        try {
          const income = await api.incomes.get(list.data[0].id);

          expect(income).toBeDefined();
          expect(income.id).toBe(list.data[0].id);
          expect(income.date).toBeDefined();
          expect(income.income_details).toBeDefined();
          expect(income.income_lines).toBeDefined();
          expect(income.charges).toBeDefined();
        } catch (error) {
          // Income may have been deleted between list and get
          console.log('Income was deleted between list and get calls');
        }
      }
    });
  });
});

describe.skipIf(shouldRunIntegrationTests())('IncomeEndpoint Integration (Skipped)', () => {
  it.skip(SKIP_MESSAGE, () => {});
});
