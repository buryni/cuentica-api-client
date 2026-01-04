/**
 * Provider (Proveedor) API Operations
 *
 * IMPORTANT NOTES (from real API testing):
 * - Field 'business_type' is required but not documented
 * - Both 'nombre' AND 'business_name' are required
 * - Use English field names: address, town, postal_code, region
 * - API returns array directly, not wrapped in { data: [...] }
 */

import type { CuenticaClient } from '../client.js';
import type {
  Provider,
  CreateProviderData,
  UpdateProviderData,
  ProviderListParams,
} from '../types/provider.js';
import { inferBusinessType } from '../types/provider.js';
import type { PaginatedResponse } from '../types/common.js';

/**
 * Provider operations
 */
export class ProviderEndpoint {
  constructor(private readonly client: CuenticaClient) {}

  /**
   * List all providers with optional filtering
   */
  async list(params?: ProviderListParams): Promise<PaginatedResponse<Provider>> {
    const query: Record<string, string | number | undefined> = {};

    if (params?.q) query.q = params.q;
    if (params?.page) query.page = params.page;
    if (params?.page_size) query.page_size = params.page_size;

    return this.client.paginatedRequest<Provider>({
      method: 'GET',
      path: '/provider',
      query,
    });
  }

  /**
   * Search for a provider by CIF/NIF
   */
  async searchByCIF(cif: string): Promise<Provider | null> {
    const result = await this.list({ q: cif });

    if (result.data.length > 0) {
      // Find exact match first
      const exactMatch = result.data.find(
        (p) => p.cif.toUpperCase() === cif.toUpperCase()
      );
      return exactMatch || result.data[0];
    }

    return null;
  }

  /**
   * Get a provider by ID
   */
  async get(id: number): Promise<Provider> {
    return this.client.request<Provider>({
      method: 'GET',
      path: `/provider/${id}`,
    });
  }

  /**
   * Create a new provider
   */
  async create(data: CreateProviderData): Promise<Provider> {
    return this.client.request<Provider>({
      method: 'POST',
      path: '/provider',
      body: data,
    });
  }

  /**
   * Update an existing provider
   */
  async update(id: number, data: UpdateProviderData): Promise<Provider> {
    return this.client.request<Provider>({
      method: 'PUT',
      path: `/provider/${id}`,
      body: data,
    });
  }

  /**
   * Delete a provider
   */
  async delete(id: number): Promise<void> {
    await this.client.request<void>({
      method: 'DELETE',
      path: `/provider/${id}`,
    });
  }

  /**
   * Find or create a provider by CIF
   *
   * This is a convenience method that:
   * 1. Searches for an existing provider with the given CIF
   * 2. If found, returns it
   * 3. If not found, creates a new provider with the provided data
   */
  async findOrCreate(data: {
    tax_id: string;
    business_name: string;
    address?: string | null;
    town?: string | null;
    postal_code?: string | null;
    region?: string | null;
  }): Promise<Provider> {
    // Search for existing provider
    const existing = await this.searchByCIF(data.tax_id);
    if (existing) {
      return existing;
    }

    // Infer business type from tax ID
    const businessType = inferBusinessType(data.tax_id);

    // Build provider data with correct field names
    // API only accepts: cif, nombre, business_name, business_type, pais
    const providerData: CreateProviderData = {
      cif: data.tax_id.toUpperCase(),
      nombre: data.business_name,
      business_name: data.business_name,
      business_type: businessType,
      pais: 'ES',
    };

    return this.create(providerData);
  }
}
