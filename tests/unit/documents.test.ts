/**
 * Unit tests for Document endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentEndpoint } from '../../src/endpoints/documents.js';
import { createMockClient, createPaginatedResponse, mockData } from './mocks.js';

describe('DocumentEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: DocumentEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new DocumentEndpoint(client);
  });

  describe('list', () => {
    it('should list documents without filters', async () => {
      const mockDocuments = [mockData.document()];
      const response = createPaginatedResponse(mockDocuments);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.list();

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/document',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list documents with all filters', async () => {
      const mockDocuments = [mockData.document()];
      const response = createPaginatedResponse(mockDocuments);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      await endpoint.list({
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        extension: 'pdf',
        assignment: 'expense',
        page: 1,
        page_size: 25,
      });

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/document',
        query: {
          date_from: '2024-01-01',
          date_to: '2024-12-31',
          extension: 'pdf',
          assignment: 'expense',
          page: 1,
          page_size: 25,
        },
      });
    });
  });

  describe('get', () => {
    it('should get document by ID', async () => {
      const mockDocument = mockData.document();
      vi.mocked(client.request).mockResolvedValue(mockDocument);

      const result = await endpoint.get(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/document/1',
      });
      expect(result).toEqual(mockDocument);
    });
  });

  describe('create', () => {
    it('should create a new document', async () => {
      const mockDocument = mockData.document();
      vi.mocked(client.request).mockResolvedValue(mockDocument);

      const data = {
        date: '2024-01-15',
        notes: 'Test document',
        attachment: {
          filename: 'document.pdf',
          data: 'base64encodedcontent',
        },
      };

      const result = await endpoint.create(data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/document',
        body: data,
      });
      expect(result).toEqual(mockDocument);
    });
  });

  describe('update', () => {
    it('should update an existing document', async () => {
      const mockDocument = mockData.document();
      vi.mocked(client.request).mockResolvedValue(mockDocument);

      const data = {
        notes: 'Updated notes',
        assignment: 'expense' as const,
        expense_id: 1,
      };
      const result = await endpoint.update(1, data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/document/1',
        body: data,
      });
      expect(result).toEqual(mockDocument);
    });
  });

  describe('delete', () => {
    it('should delete a document', async () => {
      vi.mocked(client.request).mockResolvedValue(undefined);

      await endpoint.delete(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/document/1',
      });
    });
  });

  describe('getAttachment', () => {
    it('should get document attachment', async () => {
      const mockResponse = {
        content: Buffer.from('PDF content'),
        mimeType: 'application/pdf',
      };
      vi.mocked(client.download).mockResolvedValue(mockResponse);

      const result = await endpoint.getAttachment(1);

      expect(client.download).toHaveBeenCalledWith('/document/1/attachment');
      expect(result).toEqual(mockResponse);
    });
  });
});
