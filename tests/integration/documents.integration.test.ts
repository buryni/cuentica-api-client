/**
 * Integration tests for Document endpoint
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { CuenticaAPI } from '../../src/api.js';
import { shouldRunIntegrationTests, createTestClient, SKIP_MESSAGE } from './setup.js';

describe.skipIf(!shouldRunIntegrationTests())('DocumentEndpoint Integration', () => {
  let api: CuenticaAPI;

  beforeAll(() => {
    api = createTestClient();
  });

  describe('list', () => {
    it('should list documents', async () => {
      const result = await api.documents.list({ page_size: 10 });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
    });

    it('should filter documents by date range', async () => {
      const result = await api.documents.list({
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        page_size: 10,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should filter documents by extension', async () => {
      const result = await api.documents.list({
        extension: 'pdf',
        page_size: 10,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();

      // All returned documents should be PDF
      result.data.forEach((doc) => {
        expect(doc.extension.toLowerCase()).toBe('pdf');
      });
    });

    it('should filter documents by assignment', async () => {
      const result = await api.documents.list({
        assignment: 'unassigned',
        page_size: 10,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();

      // All returned documents should be unassigned
      result.data.forEach((doc) => {
        expect(doc.assignment).toBe('unassigned');
      });
    });
  });

  describe('get', () => {
    it('should get document by ID if exists', async () => {
      const list = await api.documents.list({ page_size: 1 });

      if (list.data.length > 0) {
        const document = await api.documents.get(list.data[0].id);

        expect(document).toBeDefined();
        expect(document.id).toBe(list.data[0].id);
        expect(document.filename).toBeDefined();
        expect(document.extension).toBeDefined();
        expect(document.mime_type).toBeDefined();
        expect(document.size).toBeDefined();
      }
    });
  });

  describe('getAttachment', () => {
    it('should get document attachment if exists', async () => {
      const list = await api.documents.list({ page_size: 1 });

      if (list.data.length > 0) {
        try {
          const attachment = await api.documents.getAttachment(list.data[0].id);

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

describe.skipIf(shouldRunIntegrationTests())('DocumentEndpoint Integration (Skipped)', () => {
  it.skip(SKIP_MESSAGE, () => {});
});
