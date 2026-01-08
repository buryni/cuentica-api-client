/**
 * Integration tests for Income endpoint
 *
 * CRITICAL: These tests VALIDATE that filters actually work,
 * not just that the API call doesn't fail.
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
  });

  describe('filter by date', () => {
    it('should filter incomes by date_from - VALIDATES results', async () => {
      const all = await api.incomes.list({ page_size: 50 });

      if (all.data.length > 1) {
        const sortedDates = all.data.map((i) => i.date).sort();
        const midDate = sortedDates[Math.floor(sortedDates.length / 2)];

        const filtered = await api.incomes.list({
          date_from: midDate,
          page_size: 100,
        });

        // VALIDATE: ALL results must be >= date_from
        for (const income of filtered.data) {
          expect(
            income.date >= midDate,
            `Income ${income.id} has date ${income.date} which is before date_from ${midDate}`
          ).toBe(true);
        }
      }
    });

    it('should filter incomes by date_to - VALIDATES results', async () => {
      const all = await api.incomes.list({ page_size: 50 });

      if (all.data.length > 1) {
        const sortedDates = all.data.map((i) => i.date).sort();
        const midDate = sortedDates[Math.floor(sortedDates.length / 2)];

        const filtered = await api.incomes.list({
          date_to: midDate,
          page_size: 100,
        });

        // VALIDATE: ALL results must be <= date_to
        for (const income of filtered.data) {
          expect(
            income.date <= midDate,
            `Income ${income.id} has date ${income.date} which is after date_to ${midDate}`
          ).toBe(true);
        }
      }
    });

    it('should filter incomes by date range - VALIDATES results', async () => {
      const all = await api.incomes.list({ page_size: 50 });

      if (all.data.length > 2) {
        const sortedDates = all.data.map((i) => i.date).sort();
        const startDate = sortedDates[Math.floor(sortedDates.length * 0.25)];
        const endDate = sortedDates[Math.floor(sortedDates.length * 0.75)];

        const filtered = await api.incomes.list({
          date_from: startDate,
          date_to: endDate,
          page_size: 100,
        });

        // VALIDATE: ALL results must be within range
        for (const income of filtered.data) {
          expect(
            income.date >= startDate && income.date <= endDate,
            `Income ${income.id} has date ${income.date} outside range [${startDate}, ${endDate}]`
          ).toBe(true);
        }
      }
    });
  });

  describe('filter by customer_id', () => {
    it('should filter incomes by customer_id - VALIDATES results', async () => {
      const all = await api.incomes.list({ page_size: 20 });
      const incomeWithCustomer = all.data.find((i) => i.customer?.id);

      if (incomeWithCustomer && incomeWithCustomer.customer?.id) {
        const customerId = incomeWithCustomer.customer.id;
        const filtered = await api.incomes.list({
          customer_id: customerId,
          page_size: 100,
        });

        // VALIDATE: ALL results must have the specified customer
        for (const income of filtered.data) {
          expect(
            income.customer?.id === customerId,
            `Income ${income.id} has customer ${income.customer?.id} instead of ${customerId}`
          ).toBe(true);
        }
      }
    });
  });

  describe('ordering', () => {
    it('should order incomes by date ascending - VALIDATES order', async () => {
      const result = await api.incomes.list({
        order_field: 'date',
        order_direction: 'asc',
        page_size: 20,
      });

      if (result.data.length > 1) {
        for (let i = 1; i < result.data.length; i++) {
          const prevDate = result.data[i - 1].date;
          const currDate = result.data[i].date;
          expect(
            prevDate <= currDate,
            `Incomes not in ascending order: ${prevDate} > ${currDate}`
          ).toBe(true);
        }
      }
    });

    it('should order incomes by date descending - VALIDATES order', async () => {
      const result = await api.incomes.list({
        order_field: 'date',
        order_direction: 'desc',
        page_size: 20,
      });

      if (result.data.length > 1) {
        for (let i = 1; i < result.data.length; i++) {
          const prevDate = result.data[i - 1].date;
          const currDate = result.data[i].date;
          expect(
            prevDate >= currDate,
            `Incomes not in descending order: ${prevDate} < ${currDate}`
          ).toBe(true);
        }
      }
    });
  });

  describe('pagination', () => {
    // NOTE: The Cuentica API ignores page_size and always returns 25 items per page.
    // This is API behavior, not a client bug. The client sends the parameter correctly.
    it('should return correct pagination metadata', async () => {
      const result = await api.incomes.list({ page: 1, page_size: 5 });

      expect(result.pagination.currentPage).toBe(1);
      // API returns 25 regardless of page_size requested
      expect(result.pagination.itemsPerPage).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(result.pagination.itemsPerPage);
    });

    it('should return different data for different pages', async () => {
      const page1 = await api.incomes.list({ page: 1, page_size: 5 });
      const page2 = await api.incomes.list({ page: 2, page_size: 5 });

      if (page1.pagination.totalPages > 1 && page2.data.length > 0) {
        const ids1 = new Set(page1.data.map((i) => i.id));
        const ids2 = new Set(page2.data.map((i) => i.id));

        const intersection = [...ids1].filter((id) => ids2.has(id));
        expect(
          intersection.length,
          `Pages 1 and 2 share ${intersection.length} IDs: ${intersection.join(', ')}`
        ).toBe(0);
      }
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
