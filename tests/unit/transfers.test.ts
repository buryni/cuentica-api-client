/**
 * Unit tests for Transfer endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransferEndpoint } from '../../src/endpoints/transfers.js';
import { createMockClient, createPaginatedResponse, mockData } from './mocks.js';

describe('TransferEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: TransferEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new TransferEndpoint(client);
  });

  describe('list', () => {
    it('should list transfers without filters', async () => {
      const mockTransfers = [mockData.transfer()];
      const response = createPaginatedResponse(mockTransfers);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.list();

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/transfer',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list transfers with all filters', async () => {
      const mockTransfers = [mockData.transfer()];
      const response = createPaginatedResponse(mockTransfers);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      await endpoint.list({
        origin_account: 1,
        destination_account: 2,
        payment_method: 'wire_transfer',
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        page: 1,
        page_size: 25,
      });

      // NOTE: date_from/date_to in params are translated to initial_date/end_date for the API
      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/transfer',
        query: {
          origin_account: 1,
          destination_account: 2,
          payment_method: 'wire_transfer',
          initial_date: '2024-01-01',
          end_date: '2024-12-31',
          page: 1,
          page_size: 25,
        },
      });
    });
  });

  describe('get', () => {
    it('should get transfer by ID', async () => {
      const mockTransfer = mockData.transfer();
      vi.mocked(client.cachedRequest).mockResolvedValue({ data: mockTransfer, cached: false });

      const result = await endpoint.get(1);

      expect(client.cachedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/transfer/1',
      });
      expect(result).toEqual(mockTransfer);
    });
  });

  describe('create', () => {
    it('should create a new transfer', async () => {
      const mockTransfer = mockData.transfer();
      vi.mocked(client.request).mockResolvedValue(mockTransfer);

      const data = {
        date: '2024-01-15',
        amount: 500,
        origin_account: 1,
        destination_account: 2,
        payment_method: 'wire_transfer' as const,
        concept: 'Monthly transfer',
      };

      const result = await endpoint.create(data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/transfer',
        body: data,
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('transfer');
      expect(result).toEqual(mockTransfer);
    });
  });

  describe('update', () => {
    it('should update an existing transfer', async () => {
      const mockTransfer = mockData.transfer();
      vi.mocked(client.request).mockResolvedValue(mockTransfer);

      const data = {
        amount: 600,
        notes: 'Updated transfer',
      };
      const result = await endpoint.update(1, data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/transfer/1',
        body: data,
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('transfer');
      expect(client.deleteFromCache).toHaveBeenCalledWith('transfer/1');
      expect(result).toEqual(mockTransfer);
    });
  });

  describe('delete', () => {
    it('should delete a transfer', async () => {
      vi.mocked(client.request).mockResolvedValue(undefined);

      await endpoint.delete(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/transfer/1',
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('transfer');
      expect(client.deleteFromCache).toHaveBeenCalledWith('transfer/1');
    });
  });
});
