/**
 * Invoice (Factura) API Operations
 */

import type { CuenticaClient } from '../client.js';
import type {
  Invoice,
  CreateInvoiceData,
  InvoiceListParams,
  UpdateInvoiceChargesData,
  InvoicePublicLink,
} from '../types/invoice.js';
import type { PaginatedResponse } from '../types/common.js';

/**
 * Invoice operations
 */
export class InvoiceEndpoint {
  constructor(private readonly client: CuenticaClient) {}

  /**
   * List invoices with optional filtering
   */
  async list(params?: InvoiceListParams): Promise<PaginatedResponse<Invoice>> {
    const query: Record<string, string | number | string[] | undefined> = {};

    if (params?.customer_id) query.customer_id = params.customer_id;
    if (params?.status) query.status = params.status;
    if (params?.date_from) query.initial_date = params.date_from;
    if (params?.date_to) query.end_date = params.date_to;
    if (params?.serie) query.serie = params.serie;
    if (params?.tags) query.tags = params.tags.join(',');
    if (params?.order_field) query.order_field = params.order_field;
    if (params?.order_direction) query.order_direction = params.order_direction;
    if (params?.page) query.page = params.page;
    if (params?.page_size) query.page_size = params.page_size;

    return this.client.paginatedRequest<Invoice>({
      method: 'GET',
      path: '/invoice',
      query: query as Record<string, string | number | undefined>,
    });
  }

  /**
   * Get an invoice by ID
   */
  async get(id: number): Promise<Invoice> {
    const result = await this.client.cachedRequest<Invoice>({
      method: 'GET',
      path: `/invoice/${id}`,
    });
    return result.data;
  }

  /**
   * Create a new invoice
   */
  async create(data: CreateInvoiceData): Promise<Invoice> {
    const result = await this.client.request<Invoice>({
      method: 'POST',
      path: '/invoice',
      body: data,
    });
    // Invalidate invoices cache
    this.client.invalidateCache('invoice');
    return result;
  }

  /**
   * Update an existing invoice
   */
  async update(id: number, data: Partial<CreateInvoiceData>): Promise<Invoice> {
    const result = await this.client.request<Invoice>({
      method: 'PUT',
      path: `/invoice/${id}`,
      body: data,
    });
    // Invalidate invoice list and specific entry cache
    this.client.invalidateCache('invoice');
    this.client.deleteFromCache(`invoice/${id}`);
    return result;
  }

  /**
   * Delete an invoice
   */
  async delete(id: number): Promise<void> {
    await this.client.request<void>({
      method: 'DELETE',
      path: `/invoice/${id}`,
    });
    // Invalidate invoice list and specific entry cache
    this.client.invalidateCache('invoice');
    this.client.deleteFromCache(`invoice/${id}`);
  }

  /**
   * Download invoice as PDF
   */
  async downloadPDF(id: number): Promise<{ content: Buffer; mimeType: string }> {
    return this.client.download(`/invoice/${id}/pdf`);
  }

  /**
   * Send invoice by email
   */
  async sendByEmail(id: number, email?: string): Promise<void> {
    await this.client.request<void>({
      method: 'POST',
      path: `/invoice/${id}/email`,
      body: email ? { email } : undefined,
    });
    // Invalidate invoices cache
    this.client.invalidateCache('invoice');
  }

  /**
   * Void/cancel a Verifactu invoice
   *
   * This is used for invoices that have been registered with Verifactu
   * (Spanish electronic invoicing system).
   */
  async void(id: number): Promise<Invoice> {
    const result = await this.client.request<Invoice>({
      method: 'POST',
      path: `/invoice/${id}/void`,
    });
    // Invalidate invoice list and specific entry cache
    this.client.invalidateCache('invoice');
    this.client.deleteFromCache(`invoice/${id}`);
    return result;
  }

  /**
   * Get public link for an invoice
   *
   * Returns a public URL where the invoice can be viewed without authentication.
   */
  async getPublicLink(id: number): Promise<InvoicePublicLink> {
    const result = await this.client.cachedRequest<InvoicePublicLink>({
      method: 'GET',
      path: `/invoice/${id}/public`,
    });
    return result.data;
  }

  /**
   * Update invoice charges/payments
   *
   * Updates the payment records for an invoice.
   */
  async updateCharges(id: number, data: UpdateInvoiceChargesData): Promise<Invoice> {
    const result = await this.client.request<Invoice>({
      method: 'PUT',
      path: `/invoice/${id}/charges`,
      body: data,
    });
    // Invalidate invoice list and specific entry cache
    this.client.invalidateCache('invoice');
    this.client.deleteFromCache(`invoice/${id}`);
    return result;
  }
}
