/**
 * Document (Documento) API Operations
 *
 * Documents are files uploaded to Cuentica that can be associated
 * with expenses, incomes, or kept standalone.
 */

import type { CuenticaClient } from '../client.js';
import type {
  Document,
  CreateDocumentData,
  UpdateDocumentData,
  DocumentListParams,
} from '../types/document.js';
import type { PaginatedResponse } from '../types/common.js';

/**
 * Document operations
 */
export class DocumentEndpoint {
  constructor(private readonly client: CuenticaClient) {}

  /**
   * List documents with optional filtering
   */
  async list(params?: DocumentListParams): Promise<PaginatedResponse<Document>> {
    const query: Record<string, string | number | undefined> = {};

    if (params?.date_from) query.date_from = params.date_from;
    if (params?.date_to) query.date_to = params.date_to;
    if (params?.extension) query.extension = params.extension;
    if (params?.assignment) query.assignment = params.assignment;
    if (params?.page) query.page = params.page;
    if (params?.page_size) query.page_size = params.page_size;

    return this.client.paginatedRequest<Document>({
      method: 'GET',
      path: '/document',
      query,
    });
  }

  /**
   * Get a document by ID
   */
  async get(id: number): Promise<Document> {
    return this.client.request<Document>({
      method: 'GET',
      path: `/document/${id}`,
    });
  }

  /**
   * Create a new document
   *
   * The file should be provided as base64 encoded string.
   */
  async create(data: CreateDocumentData): Promise<Document> {
    return this.client.request<Document>({
      method: 'POST',
      path: '/document',
      body: data,
    });
  }

  /**
   * Update an existing document
   */
  async update(id: number, data: UpdateDocumentData): Promise<Document> {
    return this.client.request<Document>({
      method: 'PUT',
      path: `/document/${id}`,
      body: data,
    });
  }

  /**
   * Delete a document
   */
  async delete(id: number): Promise<void> {
    await this.client.request<void>({
      method: 'DELETE',
      path: `/document/${id}`,
    });
  }

  /**
   * Get the file attachment for a document (base64 encoded)
   */
  async getAttachment(documentId: number): Promise<{ content: Buffer; mimeType: string }> {
    return this.client.download(`/document/${documentId}/attachment`);
  }
}
