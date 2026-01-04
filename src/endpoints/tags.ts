/**
 * Tag (Etiqueta) API Operations
 *
 * Tags are used to categorize expenses, incomes, invoices, and documents.
 */

import type { CuenticaClient } from '../client.js';
import type { Tag, TagListParams } from '../types/tag.js';
import type { PaginatedResponse } from '../types/common.js';

/**
 * Tag operations
 */
export class TagEndpoint {
  constructor(private readonly client: CuenticaClient) {}

  /**
   * List all available tags
   */
  async list(params?: TagListParams): Promise<PaginatedResponse<Tag>> {
    const query: Record<string, string | number | undefined> = {};

    if (params?.page) query.page = params.page;
    if (params?.page_size) query.page_size = params.page_size;

    return this.client.paginatedRequest<Tag>({
      method: 'GET',
      path: '/tag',
      query,
    });
  }

  /**
   * Get all tags (convenience method that fetches all pages)
   */
  async getAll(): Promise<Tag[]> {
    const result = await this.list({ page_size: 300 });
    return result.data;
  }
}
