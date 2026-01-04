/**
 * Expense (Gasto) API Operations
 *
 * IMPORTANT NOTES (from real API testing):
 * - Structure is completely different from documentation (nested vs flat)
 * - 'tax' in expense_lines is a PERCENTAGE (21, 10, 4, 0), NOT an amount
 * - 'document_type' is required but not documented
 * - 'imputation' is required (use 100 for full attribution)
 * - 'payments' array is required
 * - 'expense_type' must be specific codes (e.g., '6290006'), not generic (e.g., '629')
 */

import type { CuenticaClient } from '../client.js';
import type {
  Expense,
  CreateExpenseData,
  ExpenseListParams,
} from '../types/expense.js';
import type { PaginatedResponse } from '../types/common.js';

/**
 * Expense operations
 */
export class ExpenseEndpoint {
  constructor(private readonly client: CuenticaClient) {}

  /**
   * List expenses with optional filtering
   */
  async list(params?: ExpenseListParams): Promise<PaginatedResponse<Expense>> {
    const query: Record<string, string | number | undefined> = {};

    if (params?.provider_id) query.provider_id = params.provider_id;
    if (params?.date_from) query.date_from = params.date_from;
    if (params?.date_to) query.date_to = params.date_to;
    if (params?.page) query.page = params.page;
    if (params?.page_size) query.page_size = params.page_size;

    return this.client.paginatedRequest<Expense>({
      method: 'GET',
      path: '/expense',
      query,
    });
  }

  /**
   * Get an expense by ID
   */
  async get(id: number): Promise<Expense> {
    return this.client.request<Expense>({
      method: 'GET',
      path: `/expense/${id}`,
    });
  }

  /**
   * Create a new expense
   *
   * IMPORTANT: The API structure is very different from documentation:
   * - expense_lines is an array (not flat structure)
   * - tax is a percentage (21, 10, 4, 0), NOT the calculated amount
   * - imputation must be set (use 100 for 100%)
   * - payments array is required
   * - document_type is required ('invoice' or 'ticket')
   */
  async create(data: CreateExpenseData): Promise<Expense> {
    return this.client.request<Expense>({
      method: 'POST',
      path: '/expense',
      body: data,
    });
  }

  /**
   * Update an existing expense
   */
  async update(id: number, data: Partial<CreateExpenseData>): Promise<Expense> {
    return this.client.request<Expense>({
      method: 'PUT',
      path: `/expense/${id}`,
      body: data,
    });
  }

  /**
   * Delete an expense
   */
  async delete(id: number): Promise<void> {
    await this.client.request<void>({
      method: 'DELETE',
      path: `/expense/${id}`,
    });
  }

  /**
   * Attach a file to an expense
   *
   * NOTE: The documentation mentions this endpoint but in our testing
   * it sometimes returns 404. Use with caution.
   */
  async attachFile(
    expenseId: number,
    file: Buffer | Uint8Array,
    filename: string,
    mimeType: string
  ): Promise<{ id: number }> {
    return this.client.upload(
      `/expense/${expenseId}/attachment`,
      file,
      filename,
      mimeType
    );
  }

  /**
   * Get attachment info for an expense
   */
  async getAttachment(expenseId: number): Promise<{ content: Buffer; mimeType: string }> {
    return this.client.download(`/expense/${expenseId}/attachment`);
  }
}
