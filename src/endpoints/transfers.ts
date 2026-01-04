/**
 * Transfer (Traspaso) API Operations
 *
 * Transfers represent money movements between accounts (bank accounts, cash, etc.)
 */

import type { CuenticaClient } from '../client.js';
import type {
  Transfer,
  CreateTransferData,
  UpdateTransferData,
  TransferListParams,
} from '../types/transfer.js';
import type { PaginatedResponse } from '../types/common.js';

/**
 * Transfer operations
 */
export class TransferEndpoint {
  constructor(private readonly client: CuenticaClient) {}

  /**
   * List transfers with optional filtering
   */
  async list(params?: TransferListParams): Promise<PaginatedResponse<Transfer>> {
    const query: Record<string, string | number | undefined> = {};

    if (params?.origin_account) query.origin_account = params.origin_account;
    if (params?.destination_account) query.destination_account = params.destination_account;
    if (params?.payment_method) query.payment_method = params.payment_method;
    if (params?.date_from) query.date_from = params.date_from;
    if (params?.date_to) query.date_to = params.date_to;
    if (params?.page) query.page = params.page;
    if (params?.page_size) query.page_size = params.page_size;

    return this.client.paginatedRequest<Transfer>({
      method: 'GET',
      path: '/transfer',
      query,
    });
  }

  /**
   * Get a transfer by ID
   */
  async get(id: number): Promise<Transfer> {
    return this.client.request<Transfer>({
      method: 'GET',
      path: `/transfer/${id}`,
    });
  }

  /**
   * Create a new transfer
   */
  async create(data: CreateTransferData): Promise<Transfer> {
    return this.client.request<Transfer>({
      method: 'POST',
      path: '/transfer',
      body: data,
    });
  }

  /**
   * Update an existing transfer
   */
  async update(id: number, data: UpdateTransferData): Promise<Transfer> {
    return this.client.request<Transfer>({
      method: 'PUT',
      path: `/transfer/${id}`,
      body: data,
    });
  }

  /**
   * Delete a transfer
   */
  async delete(id: number): Promise<void> {
    await this.client.request<void>({
      method: 'DELETE',
      path: `/transfer/${id}`,
    });
  }
}
