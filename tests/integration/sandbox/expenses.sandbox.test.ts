/**
 * Sandbox CRUD tests for Expense endpoint
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
import type { Expense } from '../../../src/types/expense.js';
import type { Provider } from '../../../src/types/provider.js';
import type { BankAccount } from '../../../src/types/account.js';
import {
  shouldRunSandboxTests,
  createTestClient,
  SKIP_SANDBOX_MESSAGE,
  generateTestId,
  generateTestCIF,
  getTodayDate,
} from '../setup.js';

describe.skipIf(!shouldRunSandboxTests())('ExpenseEndpoint Sandbox CRUD', () => {
  let api: CuenticaAPI;
  let testProvider: Provider | null = null;
  let testAccount: BankAccount | null = null;
  let createdExpense: Expense | null = null;
  const testId = generateTestId();

  beforeAll(async () => {
    api = createTestClient();

    // Create a test provider for expenses
    // region must be lowercase Spanish region name
    testProvider = await api.providers.create({
      cif: generateTestCIF(),
      nombre: `Expense Test Provider ${testId}`,
      business_name: `Expense Test Provider ${testId}`,
      business_type: 'company' as const,
      pais: 'ES',
      address: 'Calle Test 123',
      town: 'Madrid',
      postal_code: '28001',
      region: 'madrid',
    });

    // Get default account for payments
    const accounts = await api.accounts.list();
    if (accounts.data.length > 0) {
      testAccount = accounts.data[0];
    }
  });

  afterAll(async () => {
    // Cleanup: delete expense first, then provider
    if (createdExpense) {
      try {
        await api.expenses.delete(createdExpense.id);
        console.log(`Cleanup: Deleted expense ${createdExpense.id}`);
      } catch (error) {
        console.error(`Cleanup failed for expense ${createdExpense.id}:`, error);
      }
    }

    if (testProvider) {
      try {
        await api.providers.delete(testProvider.id);
        console.log(`Cleanup: Deleted provider ${testProvider.id}`);
      } catch (error) {
        console.error(`Cleanup failed for provider ${testProvider.id}:`, error);
      }
    }
  });

  describe('CRUD Operations', () => {
    it('should create a new expense', async () => {
      expect(testProvider).not.toBeNull();
      expect(testAccount).not.toBeNull();

      // API requires: description, base, tax, retention, imputation, expense_type for expense_lines
      // API requires: date, amount, payment_method, origin_account, paid for payments
      // Note: API error says origin_account is not in "available keys" but it IS required
      const expenseData = {
        date: getTodayDate(),
        document_type: 'invoice' as const,
        document_number: `TEST-${testId}`,
        provider: testProvider!.id,
        draft: false,
        annotations: `Test expense ${testId}`,
        expense_lines: [
          {
            description: 'Test service expense',
            base: 100,
            tax: 21 as const,
            retention: 0,
            imputation: 100,
            expense_type: '6290006', // Other external services
          },
        ],
        payments: [
          {
            date: getTodayDate(),
            amount: 121, // 100 + 21% VAT
            payment_method: 'wire_transfer' as const,
            origin_account: testAccount!.id,
            paid: true,
          },
        ],
      };

      createdExpense = await api.expenses.create(expenseData);

      expect(createdExpense).toBeDefined();
      expect(createdExpense.id).toBeDefined();
      expect(createdExpense.document_number).toBe(expenseData.document_number);
      expect(createdExpense.expense_lines.length).toBe(1);
      expect(createdExpense.payments.length).toBe(1);
    });

    it('should get the created expense by ID', async () => {
      expect(createdExpense).not.toBeNull();

      const expense = await api.expenses.get(createdExpense!.id);

      expect(expense).toBeDefined();
      expect(expense.id).toBe(createdExpense!.id);
      expect(expense.annotations).toContain('Test expense');
    });

    it('should find expense in list', async () => {
      expect(createdExpense).not.toBeNull();

      const result = await api.expenses.list({
        provider_id: testProvider!.id,
        page_size: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      const found = result.data.find((e) => e.id === createdExpense!.id);
      expect(found).toBeDefined();
    });

    it('should update the expense', async () => {
      expect(createdExpense).not.toBeNull();
      expect(testProvider).not.toBeNull();
      expect(testAccount).not.toBeNull();

      // API requires ALL fields on update, not just changed ones
      const updatedData = {
        date: getTodayDate(),
        document_type: 'invoice' as const,
        document_number: createdExpense!.document_number,
        provider: testProvider!.id,
        draft: false,
        annotations: `Updated expense ${testId}`,
        expense_lines: [
          {
            description: 'Test service expense',
            base: 100,
            tax: 21 as const,
            retention: 0,
            imputation: 100,
            expense_type: '6290006',
          },
        ],
        payments: [
          {
            date: getTodayDate(),
            amount: 121,
            payment_method: 'wire_transfer' as const,
            origin_account: testAccount!.id,
            paid: true,
          },
        ],
      };

      const updated = await api.expenses.update(createdExpense!.id, updatedData);

      expect(updated).toBeDefined();
      expect(updated.annotations).toBe(updatedData.annotations);

      createdExpense = updated;
    });

    it('should update expense payments', async () => {
      expect(createdExpense).not.toBeNull();
      expect(testAccount).not.toBeNull();

      // API requires: date, amount, payment_method, origin_account, paid for payments
      const paymentsData = {
        payments: [
          {
            date: getTodayDate(),
            amount: 121,
            payment_method: 'wire_transfer' as const,
            origin_account: testAccount!.id,
            paid: true,
          },
        ],
      };

      const updated = await api.expenses.updatePayments(createdExpense!.id, paymentsData);

      expect(updated).toBeDefined();
      expect(updated.payments.length).toBeGreaterThanOrEqual(1);
    });

    it('should delete the expense', async () => {
      expect(createdExpense).not.toBeNull();

      await api.expenses.delete(createdExpense!.id);

      // Verify deletion
      try {
        await api.expenses.get(createdExpense!.id);
        expect.fail('Expense should have been deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }

      createdExpense = null;
    });
  });
});

describe.skipIf(shouldRunSandboxTests())('ExpenseEndpoint Sandbox CRUD (Skipped)', () => {
  it.skip(SKIP_SANDBOX_MESSAGE, () => {});
});
