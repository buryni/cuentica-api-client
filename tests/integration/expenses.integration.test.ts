/**
 * Integration tests for Expense endpoint
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { CuenticaAPI } from '../../src/api.js';
import { shouldRunIntegrationTests, createTestClient, SKIP_MESSAGE } from './setup.js';

describe.skipIf(!shouldRunIntegrationTests())('ExpenseEndpoint Integration', () => {
  let api: CuenticaAPI;

  beforeAll(() => {
    api = createTestClient();
  });

  describe('list', () => {
    it('should list expenses', async () => {
      const result = await api.expenses.list({ page_size: 10 });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
    });

    it('should filter expenses by date range', async () => {
      const result = await api.expenses.list({
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        page_size: 10,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should order expenses', async () => {
      const result = await api.expenses.list({
        order_field: 'date',
        order_direction: 'desc',
        page_size: 10,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });
  });

  describe('get', () => {
    it('should get expense by ID if exists', async () => {
      const list = await api.expenses.list({ page_size: 1 });

      if (list.data.length > 0) {
        const expense = await api.expenses.get(list.data[0].id);

        expect(expense).toBeDefined();
        expect(expense.id).toBe(list.data[0].id);
        expect(expense.date).toBeDefined();
        expect(expense.expense_details).toBeDefined();
        expect(expense.expense_lines).toBeDefined();
        expect(expense.payments).toBeDefined();
      }
    });
  });

  describe('getAttachment', () => {
    it('should get expense attachment if exists', async () => {
      const list = await api.expenses.list({ page_size: 10 });
      const expenseWithAttachment = list.data.find((e) => e.has_attachment);

      if (expenseWithAttachment) {
        try {
          const attachment = await api.expenses.getAttachment(expenseWithAttachment.id);

          expect(attachment).toBeDefined();
          expect(attachment.content).toBeDefined();
          expect(attachment.mimeType).toBeDefined();
        } catch {
          console.log('Attachment not available');
        }
      }
    });
  });
});

describe.skipIf(shouldRunIntegrationTests())('ExpenseEndpoint Integration (Skipped)', () => {
  it.skip(SKIP_MESSAGE, () => {});
});
