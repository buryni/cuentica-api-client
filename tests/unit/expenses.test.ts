/**
 * Unit tests for Expense endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpenseEndpoint } from '../../src/endpoints/expenses.js';
import { createMockClient, createPaginatedResponse, mockData } from './mocks.js';

describe('ExpenseEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: ExpenseEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new ExpenseEndpoint(client);
  });

  describe('list', () => {
    it('should list expenses without filters', async () => {
      const mockExpenses = [mockData.expense()];
      const response = createPaginatedResponse(mockExpenses);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.list();

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/expense',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list expenses with all filters', async () => {
      const mockExpenses = [mockData.expense()];
      const response = createPaginatedResponse(mockExpenses);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      await endpoint.list({
        provider_id: 1,
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        expense_type: '6290006',
        order_field: 'date',
        order_direction: 'desc',
        page: 1,
        page_size: 25,
      });

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/expense',
        query: {
          provider_id: 1,
          date_from: '2024-01-01',
          date_to: '2024-12-31',
          expense_type: '6290006',
          order_field: 'date',
          order_direction: 'desc',
          page: 1,
          page_size: 25,
        },
      });
    });
  });

  describe('get', () => {
    it('should get expense by ID', async () => {
      const mockExpense = mockData.expense();
      vi.mocked(client.request).mockResolvedValue(mockExpense);

      const result = await endpoint.get(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/expense/1',
      });
      expect(result).toEqual(mockExpense);
    });
  });

  describe('create', () => {
    it('should create a new expense', async () => {
      const mockExpense = mockData.expense();
      vi.mocked(client.request).mockResolvedValue(mockExpense);

      const data = {
        date: '2024-01-15',
        document_type: 'invoice' as const,
        document_number: 'FAC-001',
        provider: 1,
        draft: false,
        expense_lines: [
          {
            description: 'Web hosting',
            base: 100,
            tax: 21 as const,
            imputation: 100,
            expense_type: '6290006',
          },
        ],
        payments: [
          {
            date: '2024-01-15',
            amount: 121,
            payment_method: 'wire_transfer' as const,
            paid: true,
          },
        ],
      };

      const result = await endpoint.create(data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/expense',
        body: data,
      });
      expect(result).toEqual(mockExpense);
    });
  });

  describe('update', () => {
    it('should update an existing expense', async () => {
      const mockExpense = mockData.expense();
      vi.mocked(client.request).mockResolvedValue(mockExpense);

      const data = { annotations: 'Updated notes' };
      const result = await endpoint.update(1, data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/expense/1',
        body: data,
      });
      expect(result).toEqual(mockExpense);
    });
  });

  describe('delete', () => {
    it('should delete an expense', async () => {
      vi.mocked(client.request).mockResolvedValue(undefined);

      await endpoint.delete(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/expense/1',
      });
    });
  });

  describe('attachFile', () => {
    it('should attach a file to expense', async () => {
      const mockResponse = { id: 1 };
      vi.mocked(client.upload).mockResolvedValue(mockResponse);

      const file = Buffer.from('test content');
      const result = await endpoint.attachFile(1, file, 'invoice.pdf', 'application/pdf');

      expect(client.upload).toHaveBeenCalledWith(
        '/expense/1/attachment',
        file,
        'invoice.pdf',
        'application/pdf'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAttachment', () => {
    it('should get expense attachment', async () => {
      const mockResponse = {
        content: Buffer.from('PDF content'),
        mimeType: 'application/pdf',
      };
      vi.mocked(client.download).mockResolvedValue(mockResponse);

      const result = await endpoint.getAttachment(1);

      expect(client.download).toHaveBeenCalledWith('/expense/1/attachment');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteAttachment', () => {
    it('should delete expense attachment', async () => {
      vi.mocked(client.request).mockResolvedValue(undefined);

      await endpoint.deleteAttachment(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/expense/1/attachment',
      });
    });
  });

  describe('updatePayments', () => {
    it('should update expense payments', async () => {
      const mockExpense = mockData.expense();
      vi.mocked(client.request).mockResolvedValue(mockExpense);

      const data = {
        payments: [
          {
            date: '2024-01-15',
            amount: 121,
            payment_method: 'wire_transfer' as const,
            origin_account: 1,
            paid: true,
          },
        ],
      };

      const result = await endpoint.updatePayments(1, data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/expense/1/payments',
        body: data,
      });
      expect(result).toEqual(mockExpense);
    });
  });
});
