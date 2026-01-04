/**
 * Sandbox CRUD tests for Provider endpoint
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
import type { Provider } from '../../../src/types/provider.js';
import {
  shouldRunSandboxTests,
  createTestClient,
  SKIP_SANDBOX_MESSAGE,
  generateTestId,
  generateTestCIF,
} from '../setup.js';

describe.skipIf(!shouldRunSandboxTests())('ProviderEndpoint Sandbox CRUD', () => {
  let api: CuenticaAPI;
  let createdProvider: Provider | null = null;
  const testId = generateTestId();

  beforeAll(() => {
    api = createTestClient();
  });

  afterAll(async () => {
    // Cleanup: delete created provider
    if (createdProvider) {
      try {
        await api.providers.delete(createdProvider.id);
        console.log(`Cleanup: Deleted provider ${createdProvider.id}`);
      } catch (error) {
        console.error(`Cleanup failed for provider ${createdProvider.id}:`, error);
      }
    }
  });

  describe('CRUD Operations', () => {
    it('should create a new provider', async () => {
      // Required: cif, nombre, business_name, business_type, pais
      // Optional: address, town, postal_code, region (must be lowercase)
      const providerData = {
        cif: generateTestCIF(),
        nombre: `Test Provider ${testId}`,
        business_name: `Test Provider ${testId}`,
        business_type: 'company' as const,
        pais: 'ES',
        address: 'Calle Proveedor 456',
        town: 'Barcelona',
        postal_code: '08001',
        region: 'barcelona', // Must be lowercase
      };

      createdProvider = await api.providers.create(providerData);

      expect(createdProvider).toBeDefined();
      expect(createdProvider.id).toBeDefined();
      expect(createdProvider.cif).toBe(providerData.cif);
      expect(createdProvider.business_name).toBe(providerData.business_name);
    });

    it('should get the created provider by ID', async () => {
      expect(createdProvider).not.toBeNull();

      const provider = await api.providers.get(createdProvider!.id);

      expect(provider).toBeDefined();
      expect(provider.id).toBe(createdProvider!.id);
      expect(provider.business_name).toContain('Test Provider');
    });

    it('should find provider in list', async () => {
      expect(createdProvider).not.toBeNull();

      const result = await api.providers.list({ q: createdProvider!.cif });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      const found = result.data.find((p) => p.id === createdProvider!.id);
      expect(found).toBeDefined();
    });

    it('should update the provider', async () => {
      expect(createdProvider).not.toBeNull();

      // API requires ALL fields on update, not just changed ones
      // Must send complete data including original values
      const updatedData = {
        cif: createdProvider!.cif,
        nombre: `Updated Provider ${testId}`,
        business_name: `Updated Provider ${testId}`,
        business_type: 'company' as const,
        pais: 'ES',
        address: 'Calle Proveedor 456',
        town: 'Barcelona',
        postal_code: '08001',
        region: 'barcelona',
      };

      const updated = await api.providers.update(createdProvider!.id, updatedData as any);

      expect(updated).toBeDefined();
      expect(updated.business_name).toBe(updatedData.business_name);

      createdProvider = updated;
    });

    it('should search provider by CIF', async () => {
      expect(createdProvider).not.toBeNull();

      const found = await api.providers.searchByCIF(createdProvider!.cif);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(createdProvider!.id);
    });

    it('should use findOrCreate to get existing provider', async () => {
      expect(createdProvider).not.toBeNull();

      const found = await api.providers.findOrCreate({
        tax_id: createdProvider!.cif,
        business_name: 'This should not be used',
      });

      expect(found).toBeDefined();
      expect(found.id).toBe(createdProvider!.id);
      // Should return existing, not create new
      expect(found.business_name).not.toBe('This should not be used');
    });

    it('should delete the provider', async () => {
      expect(createdProvider).not.toBeNull();

      await api.providers.delete(createdProvider!.id);

      // Verify deletion
      try {
        await api.providers.get(createdProvider!.id);
        expect.fail('Provider should have been deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }

      createdProvider = null;
    });
  });
});

describe.skipIf(shouldRunSandboxTests())('ProviderEndpoint Sandbox CRUD (Skipped)', () => {
  it.skip(SKIP_SANDBOX_MESSAGE, () => {});
});
