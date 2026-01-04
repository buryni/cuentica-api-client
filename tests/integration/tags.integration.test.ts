/**
 * Integration tests for Tag endpoint
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { CuenticaAPI } from '../../src/api.js';
import { shouldRunIntegrationTests, createTestClient, SKIP_MESSAGE } from './setup.js';

describe.skipIf(!shouldRunIntegrationTests())('TagEndpoint Integration', () => {
  let api: CuenticaAPI;

  beforeAll(() => {
    api = createTestClient();
  });

  describe('list', () => {
    it('should list tags', async () => {
      const result = await api.tags.list();

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
    });

    it('should list tags with pagination', async () => {
      const result = await api.tags.list({ page: 1, page_size: 10 });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.pagination.currentPage).toBe(1);
    });
  });

  describe('getAll', () => {
    it('should get all tags', async () => {
      const tags = await api.tags.getAll();

      expect(tags).toBeDefined();
      expect(Array.isArray(tags)).toBe(true);

      if (tags.length > 0) {
        const tag = tags[0];
        expect(tag.id).toBeDefined();
        expect(tag.name).toBeDefined();
      }
    });
  });
});

describe.skipIf(shouldRunIntegrationTests())('TagEndpoint Integration (Skipped)', () => {
  it.skip(SKIP_MESSAGE, () => {});
});
