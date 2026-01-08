/**
 * Unit tests for Income endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IncomeEndpoint } from '../../src/endpoints/incomes.js';
import { createMockClient, createPaginatedResponse, mockData } from './mocks.js';

describe('IncomeEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: IncomeEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new IncomeEndpoint(client);
  });

  describe('list', () => {
    it('should list incomes without filters', async () => {
      const mockIncomes = [mockData.income()];
      const response = createPaginatedResponse(mockIncomes);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.list();

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/income',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list incomes with all filters', async () => {
      const mockIncomes = [mockData.income()];
      const response = createPaginatedResponse(mockIncomes);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      await endpoint.list({
        customer_id: 1,
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        order_field: 'date',
        order_direction: 'desc',
        page: 1,
        page_size: 25,
      });

      // NOTE: date_from/date_to in params are translated to initial_date/end_date for the API
      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/income',
        query: {
          customer_id: 1,
          initial_date: '2024-01-01',
          end_date: '2024-12-31',
          order_field: 'date',
          order_direction: 'desc',
          page: 1,
          page_size: 25,
        },
      });
    });
  });

  describe('get', () => {
    it('should get income by ID', async () => {
      const mockIncome = mockData.income();
      vi.mocked(client.request).mockResolvedValue(mockIncome);

      const result = await endpoint.get(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/income/1',
      });
      expect(result).toEqual(mockIncome);
    });
  });

  describe('create', () => {
    it('should create a new income', async () => {
      const mockIncome = mockData.income();
      vi.mocked(client.request).mockResolvedValue(mockIncome);

      const data = {
        date: '2024-01-15',
        draft: false,
        income_lines: [
          {
            description: 'Bank interest',
            base: 100,
            tax: 0 as const,
            income_type: '7590001',
          },
        ],
        charges: [
          {
            date: '2024-01-15',
            amount: 100,
            payment_method: 'wire_transfer' as const,
            charged: true,
          },
        ],
      };

      const result = await endpoint.create(data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/income',
        body: data,
      });
      expect(result).toEqual(mockIncome);
    });
  });

  describe('update', () => {
    it('should update an existing income', async () => {
      const mockIncome = mockData.income();
      vi.mocked(client.request).mockResolvedValue(mockIncome);

      const data = { annotations: 'Updated notes' };
      const result = await endpoint.update(1, data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/income/1',
        body: data,
      });
      expect(result).toEqual(mockIncome);
    });
  });

  describe('delete', () => {
    it('should delete an income', async () => {
      vi.mocked(client.request).mockResolvedValue(undefined);

      await endpoint.delete(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/income/1',
      });
    });
  });

  describe('getAttachment', () => {
    it('should get income attachment', async () => {
      const mockResponse = {
        content: Buffer.from('PDF content'),
        mimeType: 'application/pdf',
      };
      vi.mocked(client.download).mockResolvedValue(mockResponse);

      const result = await endpoint.getAttachment(1);

      expect(client.download).toHaveBeenCalledWith('/income/1/attachment');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('attachFile', () => {
    it('should attach a file to income', async () => {
      const mockResponse = { id: 1 };
      vi.mocked(client.upload).mockResolvedValue(mockResponse);

      const file = Buffer.from('test content');
      const result = await endpoint.attachFile(1, file, 'receipt.pdf', 'application/pdf');

      expect(client.upload).toHaveBeenCalledWith(
        '/income/1/attachment',
        file,
        'receipt.pdf',
        'application/pdf'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteAttachment', () => {
    it('should delete income attachment', async () => {
      vi.mocked(client.request).mockResolvedValue(undefined);

      await endpoint.deleteAttachment(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/income/1/attachment',
      });
    });
  });

  describe('updateCharges', () => {
    it('should update income charges', async () => {
      const mockIncome = mockData.income();
      vi.mocked(client.request).mockResolvedValue(mockIncome);

      const data = {
        charges: [
          {
            date: '2024-01-15',
            amount: 100,
            payment_method: 'wire_transfer' as const,
            destination_account: 1,
            charged: true,
          },
        ],
      };

      const result = await endpoint.updateCharges(1, data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/income/1/charges',
        body: data,
      });
      expect(result).toEqual(mockIncome);
    });
  });
});
