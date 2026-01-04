/**
 * Income (Ingreso) API Operations
 *
 * Incomes represent money received that is NOT tied to an invoice.
 * Examples: bank interest, refunds, subsidies, etc.
 */

import type { CuenticaClient } from '../client.js';
import type {
  Income,
  CreateIncomeData,
  IncomeListParams,
  UpdateIncomeChargesData,
} from '../types/income.js';
import type { PaginatedResponse } from '../types/common.js';

/**
 * Income operations
 */
export class IncomeEndpoint {
  constructor(private readonly client: CuenticaClient) {}

  /**
   * List incomes with optional filtering
   */
  async list(params?: IncomeListParams): Promise<PaginatedResponse<Income>> {
    const query: Record<string, string | number | undefined> = {};

    if (params?.customer_id) query.customer_id = params.customer_id;
    if (params?.date_from) query.date_from = params.date_from;
    if (params?.date_to) query.date_to = params.date_to;
    if (params?.order_field) query.order_field = params.order_field;
    if (params?.order_direction) query.order_direction = params.order_direction;
    if (params?.page) query.page = params.page;
    if (params?.page_size) query.page_size = params.page_size;

    return this.client.paginatedRequest<Income>({
      method: 'GET',
      path: '/income',
      query,
    });
  }

  /**
   * Get an income by ID
   */
  async get(id: number): Promise<Income> {
    return this.client.request<Income>({
      method: 'GET',
      path: `/income/${id}`,
    });
  }

  /**
   * Create a new income
   */
  async create(data: CreateIncomeData): Promise<Income> {
    return this.client.request<Income>({
      method: 'POST',
      path: '/income',
      body: data,
    });
  }

  /**
   * Update an existing income
   */
  async update(id: number, data: Partial<CreateIncomeData>): Promise<Income> {
    return this.client.request<Income>({
      method: 'PUT',
      path: `/income/${id}`,
      body: data,
    });
  }

  /**
   * Delete an income
   */
  async delete(id: number): Promise<void> {
    await this.client.request<void>({
      method: 'DELETE',
      path: `/income/${id}`,
    });
  }

  /**
   * Get attachment for an income (base64 encoded)
   */
  async getAttachment(incomeId: number): Promise<{ content: Buffer; mimeType: string }> {
    return this.client.download(`/income/${incomeId}/attachment`);
  }

  /**
   * Attach a file to an income
   */
  async attachFile(
    incomeId: number,
    file: Buffer | Uint8Array,
    filename: string,
    mimeType: string
  ): Promise<{ id: number }> {
    return this.client.upload(
      `/income/${incomeId}/attachment`,
      file,
      filename,
      mimeType
    );
  }

  /**
   * Delete attachment from an income
   */
  async deleteAttachment(incomeId: number): Promise<void> {
    await this.client.request<void>({
      method: 'DELETE',
      path: `/income/${incomeId}/attachment`,
    });
  }

  /**
   * Update income charges/payments
   *
   * Updates the charge records for an income.
   */
  async updateCharges(id: number, data: UpdateIncomeChargesData): Promise<Income> {
    return this.client.request<Income>({
      method: 'PUT',
      path: `/income/${id}/charges`,
      body: data,
    });
  }
}
