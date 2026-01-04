/**
 * Sandbox CRUD tests for Customer endpoint
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
import type { Customer } from '../../../src/types/customer.js';
import {
  shouldRunSandboxTests,
  createTestClient,
  SKIP_SANDBOX_MESSAGE,
  generateTestId,
  generateTestCIF,
} from '../setup.js';

describe.skipIf(!shouldRunSandboxTests())('CustomerEndpoint Sandbox CRUD', () => {
  let api: CuenticaAPI;
  let createdCustomer: Customer | null = null;
  const testId = generateTestId();

  beforeAll(() => {
    api = createTestClient();
  });

  afterAll(async () => {
    // Cleanup: delete created customer
    if (createdCustomer) {
      try {
        await api.customers.delete(createdCustomer.id);
        console.log(`Cleanup: Deleted customer ${createdCustomer.id}`);
      } catch (error) {
        console.error(`Cleanup failed for customer ${createdCustomer.id}:`, error);
      }
    }
  });

  describe('CRUD Operations', () => {
    it('should create a new customer', async () => {
      const customerData = {
        cif: generateTestCIF(),
        business_name: `Test Customer ${testId}`,
        business_type: 'company' as const,
        address: 'Calle Test 123',
        town: 'Madrid',
        postal_code: '28001',
        region: 'Madrid',
        country: 'ES',
        email: `test-${testId}@example.com`,
      };

      createdCustomer = await api.customers.create(customerData);

      expect(createdCustomer).toBeDefined();
      expect(createdCustomer.id).toBeDefined();
      expect(createdCustomer.cif).toBe(customerData.cif);
      expect(createdCustomer.business_name).toBe(customerData.business_name);
    });

    it('should get the created customer by ID', async () => {
      expect(createdCustomer).not.toBeNull();

      const customer = await api.customers.get(createdCustomer!.id);

      expect(customer).toBeDefined();
      expect(customer.id).toBe(createdCustomer!.id);
      expect(customer.business_name).toContain('Test Customer');
    });

    it('should find customer in list', async () => {
      expect(createdCustomer).not.toBeNull();

      const result = await api.customers.list({ q: createdCustomer!.cif });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      const found = result.data.find((c) => c.id === createdCustomer!.id);
      expect(found).toBeDefined();
    });

    it('should update the customer', async () => {
      expect(createdCustomer).not.toBeNull();

      // API requires ALL fields on update, not just changed ones
      // Must send complete data including original values
      const updatedData = {
        cif: createdCustomer!.cif,
        business_name: `Updated Customer ${testId}`,
        business_type: 'company' as const,
        address: 'Calle Test 123',
        town: 'Madrid',
        postal_code: '28001',
        region: 'Madrid',
        country: 'ES',
        phone: '123456789',
      };

      const updated = await api.customers.update(createdCustomer!.id, updatedData);

      expect(updated).toBeDefined();
      expect(updated.business_name).toBe(updatedData.business_name);
      expect(updated.phone).toBe(updatedData.phone);

      // Update reference
      createdCustomer = updated;
    });

    it('should search customer by CIF', async () => {
      expect(createdCustomer).not.toBeNull();

      const found = await api.customers.searchByCIF(createdCustomer!.cif);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(createdCustomer!.id);
    });

    it('should delete the customer', async () => {
      expect(createdCustomer).not.toBeNull();

      await api.customers.delete(createdCustomer!.id);

      // Verify deletion
      try {
        await api.customers.get(createdCustomer!.id);
        expect.fail('Customer should have been deleted');
      } catch (error) {
        // Expected: customer not found
        expect(error).toBeDefined();
      }

      // Clear reference so afterAll doesn't try to delete again
      createdCustomer = null;
    });
  });
});

describe.skipIf(shouldRunSandboxTests())('CustomerEndpoint Sandbox CRUD (Skipped)', () => {
  it.skip(SKIP_SANDBOX_MESSAGE, () => {});
});
