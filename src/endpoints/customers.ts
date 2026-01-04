/**
 * Customer (Cliente) API Operations
 */

import type { CuenticaClient } from '../client.js';
import type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerListParams,
} from '../types/customer.js';
import type { PaginatedResponse } from '../types/common.js';

/**
 * Customer operations
 */
export class CustomerEndpoint {
  constructor(private readonly client: CuenticaClient) {}

  /**
   * List all customers with optional filtering
   */
  async list(params?: CustomerListParams): Promise<PaginatedResponse<Customer>> {
    const query: Record<string, string | number | undefined> = {};

    if (params?.q) query.q = params.q;
    if (params?.page) query.page = params.page;
    if (params?.page_size) query.page_size = params.page_size;

    return this.client.paginatedRequest<Customer>({
      method: 'GET',
      path: '/customer',
      query,
    });
  }

  /**
   * Search for a customer by CIF/NIF
   */
  async searchByCIF(cif: string): Promise<Customer | null> {
    const result = await this.list({ q: cif });

    if (result.data.length > 0) {
      const exactMatch = result.data.find(
        (c) => c.cif.toUpperCase() === cif.toUpperCase()
      );
      return exactMatch || result.data[0];
    }

    return null;
  }

  /**
   * Get a customer by ID
   */
  async get(id: number): Promise<Customer> {
    return this.client.request<Customer>({
      method: 'GET',
      path: `/customer/${id}`,
    });
  }

  /**
   * Create a new customer
   */
  async create(data: CreateCustomerData): Promise<Customer> {
    return this.client.request<Customer>({
      method: 'POST',
      path: '/customer',
      body: data,
    });
  }

  /**
   * Update an existing customer
   */
  async update(id: number, data: UpdateCustomerData): Promise<Customer> {
    return this.client.request<Customer>({
      method: 'PUT',
      path: `/customer/${id}`,
      body: data,
    });
  }

  /**
   * Delete a customer
   */
  async delete(id: number): Promise<void> {
    await this.client.request<void>({
      method: 'DELETE',
      path: `/customer/${id}`,
    });
  }
}
