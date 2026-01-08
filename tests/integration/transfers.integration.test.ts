/**
 * Integration tests for Transfer endpoint
 *
 * CRITICAL: These tests VALIDATE that filters actually work,
 * not just that the API call doesn't fail.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { CuenticaAPI } from '../../src/api.js';
import { shouldRunIntegrationTests, createTestClient, SKIP_MESSAGE } from './setup.js';

describe.skipIf(!shouldRunIntegrationTests())('TransferEndpoint Integration', () => {
  let api: CuenticaAPI;

  beforeAll(() => {
    api = createTestClient();
  });

  describe('list', () => {
    it('should list transfers', async () => {
      const result = await api.transfers.list({ page_size: 10 });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
    });
  });

  describe('filter by date', () => {
    it('should filter transfers by date_from - VALIDATES results', async () => {
      const all = await api.transfers.list({ page_size: 50 });

      if (all.data.length > 1) {
        const sortedDates = all.data.map((t) => t.date).sort();
        const midDate = sortedDates[Math.floor(sortedDates.length / 2)];

        const filtered = await api.transfers.list({
          date_from: midDate,
          page_size: 100,
        });

        // VALIDATE: ALL results must be >= date_from
        for (const transfer of filtered.data) {
          expect(
            transfer.date >= midDate,
            `Transfer ${transfer.id} has date ${transfer.date} which is before date_from ${midDate}`
          ).toBe(true);
        }
      }
    });

    it('should filter transfers by date_to - VALIDATES results', async () => {
      const all = await api.transfers.list({ page_size: 50 });

      if (all.data.length > 1) {
        const sortedDates = all.data.map((t) => t.date).sort();
        const midDate = sortedDates[Math.floor(sortedDates.length / 2)];

        const filtered = await api.transfers.list({
          date_to: midDate,
          page_size: 100,
        });

        // VALIDATE: ALL results must be <= date_to
        for (const transfer of filtered.data) {
          expect(
            transfer.date <= midDate,
            `Transfer ${transfer.id} has date ${transfer.date} which is after date_to ${midDate}`
          ).toBe(true);
        }
      }
    });

    it('should filter transfers by date range - VALIDATES results', async () => {
      const all = await api.transfers.list({ page_size: 50 });

      if (all.data.length > 2) {
        const sortedDates = all.data.map((t) => t.date).sort();
        const startDate = sortedDates[Math.floor(sortedDates.length * 0.25)];
        const endDate = sortedDates[Math.floor(sortedDates.length * 0.75)];

        const filtered = await api.transfers.list({
          date_from: startDate,
          date_to: endDate,
          page_size: 100,
        });

        // VALIDATE: ALL results must be within range
        for (const transfer of filtered.data) {
          expect(
            transfer.date >= startDate && transfer.date <= endDate,
            `Transfer ${transfer.id} has date ${transfer.date} outside range [${startDate}, ${endDate}]`
          ).toBe(true);
        }
      }
    });
  });

  describe('filter by payment_method', () => {
    it('should filter transfers by payment_method - VALIDATES results', async () => {
      const all = await api.transfers.list({ page_size: 20 });
      const transferWithMethod = all.data.find((t) => t.payment_method);

      if (transferWithMethod) {
        const paymentMethod = transferWithMethod.payment_method;
        const filtered = await api.transfers.list({
          payment_method: paymentMethod,
          page_size: 100,
        });

        // VALIDATE: ALL results must have the specified payment method
        for (const transfer of filtered.data) {
          expect(
            transfer.payment_method === paymentMethod,
            `Transfer ${transfer.id} has payment_method ${transfer.payment_method} instead of ${paymentMethod}`
          ).toBe(true);
        }
      }
    });
  });

  describe('filter by origin_account', () => {
    it('should filter transfers by origin_account - VALIDATES results', async () => {
      const all = await api.transfers.list({ page_size: 20 });
      const transferWithOrigin = all.data.find((t) => t.origin_account?.id);

      if (transferWithOrigin && transferWithOrigin.origin_account?.id) {
        const originAccountId = transferWithOrigin.origin_account.id;
        const filtered = await api.transfers.list({
          origin_account: originAccountId,
          page_size: 100,
        });

        // VALIDATE: ALL results must have the specified origin account
        for (const transfer of filtered.data) {
          expect(
            transfer.origin_account?.id === originAccountId,
            `Transfer ${transfer.id} has origin_account ${transfer.origin_account?.id} instead of ${originAccountId}`
          ).toBe(true);
        }
      }
    });
  });

  describe('filter by destination_account', () => {
    it('should filter transfers by destination_account - VALIDATES results', async () => {
      const all = await api.transfers.list({ page_size: 20 });
      const transferWithDest = all.data.find((t) => t.destination_account?.id);

      if (transferWithDest && transferWithDest.destination_account?.id) {
        const destAccountId = transferWithDest.destination_account.id;
        const filtered = await api.transfers.list({
          destination_account: destAccountId,
          page_size: 100,
        });

        // VALIDATE: ALL results must have the specified destination account
        for (const transfer of filtered.data) {
          expect(
            transfer.destination_account?.id === destAccountId,
            `Transfer ${transfer.id} has destination_account ${transfer.destination_account?.id} instead of ${destAccountId}`
          ).toBe(true);
        }
      }
    });
  });

  describe('pagination', () => {
    // NOTE: The Cuentica API ignores page_size and always returns 25 items per page.
    // This is API behavior, not a client bug. The client sends the parameter correctly.
    it('should return correct pagination metadata', async () => {
      const result = await api.transfers.list({ page: 1, page_size: 5 });

      expect(result.pagination.currentPage).toBe(1);
      // API returns 25 regardless of page_size requested
      expect(result.pagination.itemsPerPage).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(result.pagination.itemsPerPage);
    });

    it('should return different data for different pages', async () => {
      const page1 = await api.transfers.list({ page: 1, page_size: 5 });
      const page2 = await api.transfers.list({ page: 2, page_size: 5 });

      if (page1.pagination.totalPages > 1 && page2.data.length > 0) {
        const ids1 = new Set(page1.data.map((t) => t.id));
        const ids2 = new Set(page2.data.map((t) => t.id));

        const intersection = [...ids1].filter((id) => ids2.has(id));
        expect(
          intersection.length,
          `Pages 1 and 2 share ${intersection.length} IDs: ${intersection.join(', ')}`
        ).toBe(0);
      }
    });
  });

  describe('get', () => {
    it('should get transfer by ID if exists', async () => {
      const list = await api.transfers.list({ page_size: 1 });

      if (list.data.length > 0) {
        try {
          const transfer = await api.transfers.get(list.data[0].id);

          expect(transfer).toBeDefined();
          expect(transfer.id).toBe(list.data[0].id);
          expect(transfer.date).toBeDefined();
          expect(transfer.amount).toBeDefined();
          expect(transfer.origin_account).toBeDefined();
          expect(transfer.destination_account).toBeDefined();
          expect(transfer.payment_method).toBeDefined();
        } catch (error: unknown) {
          // Transfer may have been deleted by sandbox tests running in parallel
          if (error instanceof Error && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
            console.log('Transfer was deleted before we could fetch it (race condition with sandbox tests)');
          } else {
            throw error;
          }
        }
      }
    });
  });
});

describe.skipIf(shouldRunIntegrationTests())('TransferEndpoint Integration (Skipped)', () => {
  it.skip(SKIP_MESSAGE, () => {});
});
