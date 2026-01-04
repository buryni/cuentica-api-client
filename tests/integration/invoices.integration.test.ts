/**
 * Integration tests for Invoice endpoint
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { CuenticaAPI } from '../../src/api.js';
import { shouldRunIntegrationTests, createTestClient, SKIP_MESSAGE } from './setup.js';

describe.skipIf(!shouldRunIntegrationTests())('InvoiceEndpoint Integration', () => {
  let api: CuenticaAPI;

  beforeAll(() => {
    api = createTestClient();
  });

  describe('list', () => {
    it('should list invoices', async () => {
      const result = await api.invoices.list({ page_size: 10 });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.currentPage).toBeGreaterThanOrEqual(1);
    });

    it('should filter invoices by date range', async () => {
      const result = await api.invoices.list({
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        page_size: 10,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });
  });

  describe('get', () => {
    it('should get invoice by ID if exists', async () => {
      const list = await api.invoices.list({ page_size: 1 });

      if (list.data.length > 0) {
        const invoice = await api.invoices.get(list.data[0].id);

        expect(invoice).toBeDefined();
        expect(invoice.id).toBe(list.data[0].id);
        expect(invoice.invoice_number).toBeDefined();
        expect(invoice.date).toBeDefined();
      }
    });
  });

  describe('getPublicLink', () => {
    it('should get public link for invoice if exists', async () => {
      const list = await api.invoices.list({ page_size: 1 });

      if (list.data.length > 0) {
        try {
          const link = await api.invoices.getPublicLink(list.data[0].id);

          expect(link).toBeDefined();
          expect(link.url).toBeDefined();
          expect(link.url).toContain('http');
        } catch (error) {
          // Some invoices may not have public link enabled
          console.log('Public link not available for this invoice');
        }
      }
    });
  });

  describe('downloadPDF', () => {
    it('should download invoice PDF if exists', async () => {
      const list = await api.invoices.list({ page_size: 1 });

      if (list.data.length > 0) {
        const pdf = await api.invoices.downloadPDF(list.data[0].id);

        expect(pdf).toBeDefined();
        expect(pdf.content).toBeDefined();
        expect(pdf.mimeType).toBe('application/pdf');
      }
    });
  });
});

describe.skipIf(shouldRunIntegrationTests())('InvoiceEndpoint Integration (Skipped)', () => {
  it.skip(SKIP_MESSAGE, () => {});
});
