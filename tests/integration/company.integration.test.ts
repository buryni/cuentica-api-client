/**
 * Integration tests for Company endpoint
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { CuenticaAPI } from '../../src/api.js';
import { shouldRunIntegrationTests, createTestClient, SKIP_MESSAGE } from './setup.js';

describe.skipIf(!shouldRunIntegrationTests())('CompanyEndpoint Integration', () => {
  let api: CuenticaAPI;

  beforeAll(() => {
    api = createTestClient();
  });

  describe('get', () => {
    it('should fetch company information', async () => {
      const company = await api.company.get();

      expect(company).toBeDefined();
      expect(company.id).toBeDefined();
      expect(company.cif).toBeDefined();
      expect(company.business_name).toBeDefined();
    });
  });

  describe('getSeries', () => {
    it('should fetch invoice series', async () => {
      const series = await api.company.getSeries();

      expect(series).toBeDefined();
      expect(Array.isArray(series)).toBe(true);

      if (series.length > 0) {
        const serie = series[0];
        expect(serie.name).toBeDefined();
        expect(typeof serie.default).toBe('boolean');
      }
    });
  });
});

// Message for skipped tests
describe.skipIf(shouldRunIntegrationTests())('CompanyEndpoint Integration (Skipped)', () => {
  it.skip(SKIP_MESSAGE, () => {});
});
