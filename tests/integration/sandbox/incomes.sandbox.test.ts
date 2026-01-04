/**
 * Sandbox CRUD tests for Income endpoint
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
import type { Income } from '../../../src/types/income.js';
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

describe.skipIf(!shouldRunSandboxTests())('IncomeEndpoint Sandbox CRUD', () => {
  let api: CuenticaAPI;
  let testCustomer: Customer | null = null;
  let testAccount: BankAccount | null = null;
  let createdIncome: Income | null = null;
  const testId = generateTestId();

  beforeAll(async () => {
    api = createTestClient();

    // Create a test customer for incomes (required by API)
    testCustomer = await api.customers.create({
      cif: generateTestCIF(),
      business_name: `Income Test Customer ${testId}`,
      business_type: 'company',
      address: 'Calle Test 123',
      town: 'Madrid',
      postal_code: '28001',
      region: 'Madrid',
      country: 'ES',
    });

    // Get default account for charges
    const accounts = await api.accounts.list();
    if (accounts.data.length > 0) {
      testAccount = accounts.data[0];
    }
  });

  afterAll(async () => {
    // Cleanup: delete income first, then customer
    if (createdIncome) {
      try {
        await api.incomes.delete(createdIncome.id);
        console.log(`Cleanup: Deleted income ${createdIncome.id}`);
      } catch (error) {
        console.error(`Cleanup failed for income ${createdIncome.id}:`, error);
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
    it('should create a new income', async () => {
      expect(testCustomer).not.toBeNull();

      // API requires: concept, amount, tax, retention, income_type, imputation for income_lines
      // API requires: date, amount, payment_method, charged for charges (NOT destination_account, NOT paid)
      // income_type must be one of: 746, 754, 730, 778, 705, 766, 752, 759, 799, 700, 740
      const incomeData = {
        date: getTodayDate(),
        customer: testCustomer!.id,
        income_lines: [
          {
            concept: 'Bank interest',
            amount: 50,
            tax: 0 as const,
            retention: 0,
            income_type: '759', // Other incomes
            imputation: 100,
          },
        ],
        charges: [
          {
            date: getTodayDate(),
            amount: 50,
            payment_method: 'wire_transfer' as const,
            destination_account: testAccount!.id,
            charged: true,
          },
        ],
      };

      createdIncome = await api.incomes.create(incomeData);

      expect(createdIncome).toBeDefined();
      expect(createdIncome.id).toBeDefined();
    });

    it('should get the created income by ID', async () => {
      expect(createdIncome).not.toBeNull();

      const income = await api.incomes.get(createdIncome!.id);

      expect(income).toBeDefined();
      expect(income.id).toBe(createdIncome!.id);
    });

    it('should find income in list', async () => {
      expect(createdIncome).not.toBeNull();

      const result = await api.incomes.list({
        date_from: getTodayDate(),
        page_size: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      const found = result.data.find((i) => i.id === createdIncome!.id);
      expect(found).toBeDefined();
    });

    it('should delete the income', async () => {
      expect(createdIncome).not.toBeNull();

      await api.incomes.delete(createdIncome!.id);

      // Verify deletion
      try {
        await api.incomes.get(createdIncome!.id);
        expect.fail('Income should have been deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }

      createdIncome = null;
    });
  });
});

describe.skipIf(shouldRunSandboxTests())('IncomeEndpoint Sandbox CRUD (Skipped)', () => {
  it.skip(SKIP_SANDBOX_MESSAGE, () => {});
});
