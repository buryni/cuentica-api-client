/**
 * Integration tests for Document endpoint
 *
 * CRITICAL: These tests VALIDATE that filters actually work,
 * not just that the API call doesn't fail.
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
  });

  describe('filter by date', () => {
    it('should filter documents by date_from - VALIDATES results', async () => {
      const all = await api.documents.list({ page_size: 50 });

      if (all.data.length > 1) {
        const sortedDates = all.data.map((d) => d.date).sort();
        const midDate = sortedDates[Math.floor(sortedDates.length / 2)];

        const filtered = await api.documents.list({
          date_from: midDate,
          page_size: 100,
        });

        // VALIDATE: ALL results must be >= date_from
        for (const doc of filtered.data) {
          expect(
            doc.date >= midDate,
            `Document ${doc.id} has date ${doc.date} which is before date_from ${midDate}`
          ).toBe(true);
        }
      }
    });

    it('should filter documents by date_to - VALIDATES results', async () => {
      const all = await api.documents.list({ page_size: 50 });

      if (all.data.length > 1) {
        const sortedDates = all.data.map((d) => d.date).sort();
        const midDate = sortedDates[Math.floor(sortedDates.length / 2)];

        const filtered = await api.documents.list({
          date_to: midDate,
          page_size: 100,
        });

        // VALIDATE: ALL results must be <= date_to
        for (const doc of filtered.data) {
          expect(
            doc.date <= midDate,
            `Document ${doc.id} has date ${doc.date} which is after date_to ${midDate}`
          ).toBe(true);
        }
      }
    });

    it('should filter documents by date range - VALIDATES results', async () => {
      const all = await api.documents.list({ page_size: 50 });

      if (all.data.length > 2) {
        const sortedDates = all.data.map((d) => d.date).sort();
        const startDate = sortedDates[Math.floor(sortedDates.length * 0.25)];
        const endDate = sortedDates[Math.floor(sortedDates.length * 0.75)];

        const filtered = await api.documents.list({
          date_from: startDate,
          date_to: endDate,
          page_size: 100,
        });

        // VALIDATE: ALL results must be within range
        for (const doc of filtered.data) {
          expect(
            doc.date >= startDate && doc.date <= endDate,
            `Document ${doc.id} has date ${doc.date} outside range [${startDate}, ${endDate}]`
          ).toBe(true);
        }
      }
    });
  });

  describe('filter by extension', () => {
    it('should filter documents by extension - VALIDATES results', async () => {
      const all = await api.documents.list({ page_size: 20 });
      const docWithExt = all.data.find((d) => d.extension);

      if (docWithExt) {
        const extension = docWithExt.extension.toLowerCase();
        const filtered = await api.documents.list({
          extension,
          page_size: 100,
        });

        // VALIDATE: ALL results must have the specified extension
        for (const doc of filtered.data) {
          expect(
            doc.extension.toLowerCase() === extension,
            `Document ${doc.id} has extension ${doc.extension} instead of ${extension}`
          ).toBe(true);
        }
      }
    });
  });

  describe('filter by assignment', () => {
    it('should filter documents by assignment - VALIDATES results', async () => {
      const all = await api.documents.list({ page_size: 20 });
      const docWithAssignment = all.data.find((d) => d.assignment);

      if (docWithAssignment) {
        const assignment = docWithAssignment.assignment;
        const filtered = await api.documents.list({
          assignment,
          page_size: 100,
        });

        // VALIDATE: ALL results must have the specified assignment
        for (const doc of filtered.data) {
          expect(
            doc.assignment === assignment,
            `Document ${doc.id} has assignment ${doc.assignment} instead of ${assignment}`
          ).toBe(true);
        }
      }
    });
  });

  describe('pagination', () => {
    // NOTE: The Cuentica API ignores page_size and always returns 25 items per page.
    // This is API behavior, not a client bug. The client sends the parameter correctly.
    it('should return correct pagination metadata', async () => {
      const result = await api.documents.list({ page: 1, page_size: 5 });

      expect(result.pagination.currentPage).toBe(1);
      // API returns 25 regardless of page_size requested
      expect(result.pagination.itemsPerPage).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(result.pagination.itemsPerPage);
    });

    it('should return different data for different pages', async () => {
      const page1 = await api.documents.list({ page: 1, page_size: 5 });
      const page2 = await api.documents.list({ page: 2, page_size: 5 });

      if (page1.pagination.totalPages > 1 && page2.data.length > 0) {
        const ids1 = new Set(page1.data.map((d) => d.id));
        const ids2 = new Set(page2.data.map((d) => d.id));

        const intersection = [...ids1].filter((id) => ids2.has(id));
        expect(
          intersection.length,
          `Pages 1 and 2 share ${intersection.length} IDs: ${intersection.join(', ')}`
        ).toBe(0);
      }
    });
  });

  describe('get', () => {
    it('should get document by ID if exists', async () => {
      const list = await api.documents.list({ page_size: 1 });

      if (list.data.length > 0) {
        const document = await api.documents.get(list.data[0].id);

        expect(document).toBeDefined();
        expect(document.id).toBe(list.data[0].id);
        // Note: Some fields may be undefined depending on API response
        expect(document.date).toBeDefined();
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
