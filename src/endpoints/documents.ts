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

    // API expects initial_date/end_date, not date_from/date_to
    if (params?.date_from) query.initial_date = params.date_from;
    if (params?.date_to) query.end_date = params.date_to;
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
    const result = await this.client.cachedRequest<Document>({
      method: 'GET',
      path: `/document/${id}`,
    });
    return result.data;
  }

  /**
   * Create a new document
   *
   * The file should be provided as base64 encoded string.
   */
  async create(data: CreateDocumentData): Promise<Document> {
    const result = await this.client.request<Document>({
      method: 'POST',
      path: '/document',
      body: data,
    });
    // Invalidate documents cache
    this.client.invalidateCache('document');
    return result;
  }

  /**
   * Update an existing document
   */
  async update(id: number, data: UpdateDocumentData): Promise<Document> {
    const result = await this.client.request<Document>({
      method: 'PUT',
      path: `/document/${id}`,
      body: data,
    });
    // Invalidate document list and specific entry cache
    this.client.invalidateCache('document');
    this.client.deleteFromCache(`document/${id}`);
    return result;
  }

  /**
   * Delete a document
   */
  async delete(id: number): Promise<void> {
    await this.client.request<void>({
      method: 'DELETE',
      path: `/document/${id}`,
    });
    // Invalidate document list and specific entry cache
    this.client.invalidateCache('document');
    this.client.deleteFromCache(`document/${id}`);
  }

  /**
   * Get the file attachment for a document (base64 encoded)
   */
  async getAttachment(documentId: number): Promise<{ content: Buffer; mimeType: string }> {
    return this.client.download(`/document/${documentId}/attachment`);
  }
}
