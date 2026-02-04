/**
 * Unit tests for CuenticaAPI class
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CuenticaAPI, createCuenticaAPI } from '../../src/api.js';

describe('CuenticaAPI', () => {
  describe('constructor', () => {
    it('should create API instance with all endpoints', () => {
      const api = new CuenticaAPI({ apiToken: 'test-token' });

      expect(api.providers).toBeDefined();
      expect(api.expenses).toBeDefined();
      expect(api.customers).toBeDefined();
      expect(api.invoices).toBeDefined();
      expect(api.accounts).toBeDefined();
      expect(api.company).toBeDefined();
      expect(api.incomes).toBeDefined();
      expect(api.documents).toBeDefined();
      expect(api.tags).toBeDefined();
      expect(api.transfers).toBeDefined();
    });

    it('should throw error without API token', () => {
      expect(() => new CuenticaAPI({ apiToken: '' })).toThrow();
    });
  });

  describe('fromEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should create API from environment variables', () => {
      process.env.CUENTICA_API_TOKEN = 'env-token';

      const api = CuenticaAPI.fromEnv();

      expect(api).toBeInstanceOf(CuenticaAPI);
      expect(api.providers).toBeDefined();
    });

    it('should throw error when CUENTICA_API_TOKEN is not set', () => {
      delete process.env.CUENTICA_API_TOKEN;

      expect(() => CuenticaAPI.fromEnv()).toThrow('CUENTICA_API_TOKEN environment variable is not set');
    });

    it('should accept additional options', () => {
      process.env.CUENTICA_API_TOKEN = 'env-token';

      const api = CuenticaAPI.fromEnv({ debug: true });

      expect(api).toBeInstanceOf(CuenticaAPI);
    });

    it('should use CUENTICA_API_URL if provided', () => {
      process.env.CUENTICA_API_TOKEN = 'env-token';
      process.env.CUENTICA_API_URL = 'https://custom.api.com';

      const api = CuenticaAPI.fromEnv();

      expect(api).toBeInstanceOf(CuenticaAPI);
    });
  });
});

describe('createCuenticaAPI', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create API from environment variables', () => {
    process.env.CUENTICA_API_TOKEN = 'env-token';

    const api = createCuenticaAPI();

    expect(api).toBeInstanceOf(CuenticaAPI);
  });

  it('should throw error when CUENTICA_API_TOKEN is not set', () => {
    delete process.env.CUENTICA_API_TOKEN;

    expect(() => createCuenticaAPI()).toThrow('CUENTICA_API_TOKEN environment variable is not set');
  });

  it('should accept additional options', () => {
    process.env.CUENTICA_API_TOKEN = 'env-token';

    const api = createCuenticaAPI({ debug: true });

    expect(api).toBeInstanceOf(CuenticaAPI);
  });
});
