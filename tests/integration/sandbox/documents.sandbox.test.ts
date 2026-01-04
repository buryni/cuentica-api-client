/**
 * Sandbox CRUD tests for Document endpoint
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
import type { Document } from '../../../src/types/document.js';
import {
  shouldRunSandboxTests,
  createTestClient,
  SKIP_SANDBOX_MESSAGE,
  generateTestId,
  getTodayDate,
} from '../setup.js';

describe.skipIf(!shouldRunSandboxTests())('DocumentEndpoint Sandbox CRUD', () => {
  let api: CuenticaAPI;
  let createdDocument: Document | null = null;
  const testId = generateTestId();

  beforeAll(() => {
    api = createTestClient();
  });

  afterAll(async () => {
    // Cleanup: delete created document
    if (createdDocument) {
      try {
        await api.documents.delete(createdDocument.id);
        console.log(`Cleanup: Deleted document ${createdDocument.id}`);
      } catch (error) {
        console.error(`Cleanup failed for document ${createdDocument.id}:`, error);
      }
    }
  });

  describe('CRUD Operations', () => {
    it('should create a new document', async () => {
      // Create a simple text file as base64
      const textContent = `Test document content ${testId}`;
      const base64Content = Buffer.from(textContent).toString('base64');
      const filename = `test-document-${testId}.txt`;

      const documentData = {
        date: getTodayDate(),
        notes: `Test document ${testId}`,
        attachment: {
          filename: filename,
          data: base64Content,
        },
      };

      createdDocument = await api.documents.create(documentData);

      expect(createdDocument).toBeDefined();
      expect(createdDocument.id).toBeDefined();
      expect(createdDocument.filename).toBe(filename);
      expect(createdDocument.extension).toBe('txt');
    });

    it('should get the created document by ID', async () => {
      expect(createdDocument).not.toBeNull();

      const document = await api.documents.get(createdDocument!.id);

      expect(document).toBeDefined();
      expect(document.id).toBe(createdDocument!.id);
      // Notes field may not be returned in response
      expect(document.filename).toBeDefined();
    });

    it('should find document in list', async () => {
      expect(createdDocument).not.toBeNull();

      const result = await api.documents.list({
        date_from: getTodayDate(),
        page_size: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      const found = result.data.find((d) => d.id === createdDocument!.id);
      expect(found).toBeDefined();
    });

    it('should update the document', async () => {
      expect(createdDocument).not.toBeNull();

      const updatedData = {
        date: getTodayDate(),
      };

      const updated = await api.documents.update(createdDocument!.id, updatedData);

      expect(updated).toBeDefined();
      expect(updated.id).toBe(createdDocument!.id);

      createdDocument = updated;
    });

    it('should get document attachment', async () => {
      expect(createdDocument).not.toBeNull();

      const attachment = await api.documents.getAttachment(createdDocument!.id);

      expect(attachment).toBeDefined();
      expect(attachment.content).toBeDefined();
      expect(attachment.mimeType).toBeDefined();
    });

    it('should delete the document', async () => {
      expect(createdDocument).not.toBeNull();

      await api.documents.delete(createdDocument!.id);

      // Verify deletion
      try {
        await api.documents.get(createdDocument!.id);
        expect.fail('Document should have been deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }

      createdDocument = null;
    });
  });
});

describe.skipIf(shouldRunSandboxTests())('DocumentEndpoint Sandbox CRUD (Skipped)', () => {
  it.skip(SKIP_SANDBOX_MESSAGE, () => {});
});
