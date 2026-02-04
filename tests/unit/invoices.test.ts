/**
 * Unit tests for Invoice endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceEndpoint } from '../../src/endpoints/invoices.js';
import { createMockClient, createPaginatedResponse, mockData } from './mocks.js';

describe('InvoiceEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: InvoiceEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new InvoiceEndpoint(client);
  });

  describe('list', () => {
    it('should list invoices without filters', async () => {
      const mockInvoices = [mockData.invoice()];
      const response = createPaginatedResponse(mockInvoices);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.list();

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/invoice',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list invoices with filters', async () => {
      const mockInvoices = [mockData.invoice()];
      const response = createPaginatedResponse(mockInvoices);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      await endpoint.list({
        customer_id: 1,
        status: 'paid',
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        serie: 'F',
        tags: ['tag1', 'tag2'],
        order_field: 'date',
        order_direction: 'desc',
        page: 1,
        page_size: 25,
      });

      // NOTE: date_from/date_to in params are translated to initial_date/end_date for the API
      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/invoice',
        query: {
          customer_id: 1,
          status: 'paid',
          initial_date: '2024-01-01',
          end_date: '2024-12-31',
          serie: 'F',
          tags: 'tag1,tag2',
          order_field: 'date',
          order_direction: 'desc',
          page: 1,
          page_size: 25,
        },
      });
    });
  });

  describe('get', () => {
    it('should get invoice by ID', async () => {
      const mockInvoice = mockData.invoice();
      vi.mocked(client.cachedRequest).mockResolvedValue({ data: mockInvoice, cached: false });

      const result = await endpoint.get(1);

      expect(client.cachedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/invoice/1',
      });
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('create', () => {
    it('should create a new invoice', async () => {
      const mockInvoice = mockData.invoice();
      vi.mocked(client.request).mockResolvedValue(mockInvoice);

      const data = {
        date: '2024-01-15',
        customer_id: 1,
        lines: [
          {
            concept: 'Service',
            quantity: 1,
            unit_price: 100,
            tax_rate: 21,
          },
        ],
      };

      const result = await endpoint.create(data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/invoice',
        body: data,
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('invoice');
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('update', () => {
    it('should update an existing invoice', async () => {
      const mockInvoice = mockData.invoice();
      vi.mocked(client.request).mockResolvedValue(mockInvoice);

      const data = { notes: 'Updated notes' };
      const result = await endpoint.update(1, data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/invoice/1',
        body: data,
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('invoice');
      expect(client.deleteFromCache).toHaveBeenCalledWith('invoice/1');
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('delete', () => {
    it('should delete an invoice', async () => {
      vi.mocked(client.request).mockResolvedValue(undefined);

      await endpoint.delete(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/invoice/1',
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('invoice');
      expect(client.deleteFromCache).toHaveBeenCalledWith('invoice/1');
    });
  });

  describe('downloadPDF', () => {
    it('should download invoice as PDF', async () => {
      const mockResponse = {
        content: Buffer.from('PDF content'),
        mimeType: 'application/pdf',
      };
      vi.mocked(client.download).mockResolvedValue(mockResponse);

      const result = await endpoint.downloadPDF(1);

      expect(client.download).toHaveBeenCalledWith('/invoice/1/pdf');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('sendByEmail', () => {
    it('should send invoice by email without custom email', async () => {
      vi.mocked(client.request).mockResolvedValue(undefined);

      await endpoint.sendByEmail(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/invoice/1/email',
        body: undefined,
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('invoice');
    });

    it('should send invoice to custom email', async () => {
      vi.mocked(client.request).mockResolvedValue(undefined);

      await endpoint.sendByEmail(1, 'custom@email.com');

      expect(client.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/invoice/1/email',
        body: { email: 'custom@email.com' },
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('invoice');
    });
  });

  describe('void', () => {
    it('should void a Verifactu invoice', async () => {
      const mockInvoice = { ...mockData.invoice(), status: 'cancelled' as const };
      vi.mocked(client.request).mockResolvedValue(mockInvoice);

      const result = await endpoint.void(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/invoice/1/void',
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('invoice');
      expect(client.deleteFromCache).toHaveBeenCalledWith('invoice/1');
      expect(result.status).toBe('cancelled');
    });
  });

  describe('getPublicLink', () => {
    it('should get public link for invoice', async () => {
      const mockLink = mockData.invoicePublicLink();
      vi.mocked(client.cachedRequest).mockResolvedValue({ data: mockLink, cached: false });

      const result = await endpoint.getPublicLink(1);

      expect(client.cachedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/invoice/1/public',
      });
      expect(result).toEqual(mockLink);
      expect(result.url).toContain('public');
    });
  });

  describe('updateCharges', () => {
    it('should update invoice charges', async () => {
      const mockInvoice = mockData.invoice();
      vi.mocked(client.request).mockResolvedValue(mockInvoice);

      const data = {
        charges: [
          {
            date: '2024-01-15',
            amount: 121,
            payment_method: 'wire_transfer',
            charged: true,
          },
        ],
      };

      const result = await endpoint.updateCharges(1, data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/invoice/1/charges',
        body: data,
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('invoice');
      expect(client.deleteFromCache).toHaveBeenCalledWith('invoice/1');
      expect(result).toEqual(mockInvoice);
    });
  });
});
