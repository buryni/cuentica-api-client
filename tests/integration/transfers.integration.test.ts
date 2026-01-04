/**
 * Integration tests for Transfer endpoint
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

    it('should filter transfers by date range', async () => {
      const result = await api.transfers.list({
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        page_size: 10,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should filter transfers by payment method', async () => {
      const result = await api.transfers.list({
        payment_method: 'wire_transfer',
        page_size: 10,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();

      // All returned transfers should have the specified payment method
      result.data.forEach((transfer) => {
        expect(transfer.payment_method).toBe('wire_transfer');
      });
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
        } catch (error: any) {
          // Transfer may have been deleted by sandbox tests running in parallel
          if (error.statusCode === 404) {
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
