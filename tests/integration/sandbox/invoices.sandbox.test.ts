/**
 * Sandbox CRUD tests for Invoice endpoint
 *
 * WARNING: These tests CREATE, MODIFY and DELETE real data.
 * Only run against a SANDBOX environment.
 *
 * Required environment variables:
 * - CUENTICA_API_TOKEN: API token
 * - CUENTICA_SANDBOX=true: Explicitly enable sandbox tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { CuenticaAPI } from '../../../src/api.js';
import type { Invoice } from '../../../src/types/invoice.js';
import type { Customer } from '../../../src/types/customer.js';
import type { BankAccount } from '../../../src/types/account.js';
import {
  shouldRunSandboxTests,
  createTestClient,
  SKIP_SANDBOX_MESSAGE,
  generateTestId,
  generateTestCIF,
  getTodayDate,
} from '../setup.js';

describe.skipIf(!shouldRunSandboxTests())('InvoiceEndpoint Sandbox CRUD', () => {
  let api: CuenticaAPI;
  let testCustomer: Customer | null = null;
  let testAccount: BankAccount | null = null;
  let createdInvoice: Invoice | null = null;
  const testId = generateTestId();

  beforeAll(async () => {
    api = createTestClient();

    // Create a test customer for invoices
    testCustomer = await api.customers.create({
      cif: generateTestCIF(),
      business_name: `Invoice Test Customer ${testId}`,
      business_type: 'company',
      address: 'Calle Test 123',
      town: 'Madrid',
      postal_code: '28001',
      region: 'Madrid',
      country: 'ES',
    });

    // Get an account for charges
    const accounts = await api.accounts.list();
    if (accounts.data.length > 0) {
      testAccount = accounts.data[0];
    }
  });

  afterAll(async () => {
    // Cleanup: delete invoice first, then customer
    if (createdInvoice) {
      try {
        await api.invoices.delete(createdInvoice.id);
        console.log(`Cleanup: Deleted invoice ${createdInvoice.id}`);
      } catch (error) {
        console.error(`Cleanup failed for invoice ${createdInvoice.id}:`, error);
      }
    }

    if (testCustomer) {
      try {
        await api.customers.delete(testCustomer.id);
        console.log(`Cleanup: Deleted customer ${testCustomer.id}`);
      } catch (error) {
        console.error(`Cleanup failed for customer ${testCustomer.id}:`, error);
      }
    }
  });

  describe('CRUD Operations', () => {
    it('should create a new invoice', async () => {
      expect(testCustomer).not.toBeNull();

      // Calculate total for charges: (100 * 1) + (50 * 2) = 200, + 21% VAT = 242
      const lineTotal = 100 + 100; // 200
      const totalWithVat = lineTotal * 1.21; // 242

      // API requires: concept, quantity, amount, discount, retention, tax, sell_type for invoice_lines
      // API requires: date, amount, payment_method, destination_account, charged for charges
      // Note: issued=false to allow deletion (issued invoices can't be deleted)
      const invoiceData = {
        issued: false, // Draft so we can delete it
        date: getTodayDate(),
        customer: testCustomer!.id,
        invoice_lines: [
          {
            concept: 'Test Service',
            quantity: 1,
            amount: 100,
            discount: 0,
            retention: 0,
            tax: 21,
            sell_type: 'service' as const,
          },
          {
            concept: 'Test Product',
            quantity: 2,
            amount: 50,
            discount: 0,
            retention: 0,
            tax: 21,
            sell_type: 'product' as const,
          },
        ],
        charges: [
          {
            date: getTodayDate(),
            amount: totalWithVat,
            payment_method: 'wire_transfer' as const,
            destination_account: testAccount!.id,
            charged: false,
          },
        ],
      };

      createdInvoice = await api.invoices.create(invoiceData);

      expect(createdInvoice).toBeDefined();
      expect(createdInvoice.id).toBeDefined();
    });

    it('should get the created invoice by ID', async () => {
      expect(createdInvoice).not.toBeNull();

      const invoice = await api.invoices.get(createdInvoice!.id);

      expect(invoice).toBeDefined();
      expect(invoice.id).toBe(createdInvoice!.id);
    });

    it('should find invoice in list', async () => {
      expect(createdInvoice).not.toBeNull();

      const result = await api.invoices.list({
        page_size: 50,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      const found = result.data.find((i) => i.id === createdInvoice!.id);
      expect(found).toBeDefined();
    });

    it('should download invoice as PDF', async () => {
      expect(createdInvoice).not.toBeNull();

      const pdf = await api.invoices.downloadPDF(createdInvoice!.id);

      expect(pdf).toBeDefined();
      expect(pdf.content).toBeDefined();
      expect(pdf.content.length).toBeGreaterThan(0);
    });

    it('should delete the invoice', async () => {
      expect(createdInvoice).not.toBeNull();

      await api.invoices.delete(createdInvoice!.id);

      // Verify deletion
      try {
        await api.invoices.get(createdInvoice!.id);
        expect.fail('Invoice should have been deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }

      createdInvoice = null;
    });
  });
});

describe.skipIf(shouldRunSandboxTests())('InvoiceEndpoint Sandbox CRUD (Skipped)', () => {
  it.skip(SKIP_SANDBOX_MESSAGE, () => {});
});
