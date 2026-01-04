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
    if (params?.date_from) query.date_from = params.date_from;
    if (params?.date_to) query.date_to = params.date_to;
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
    return this.client.request<Invoice>({
      method: 'GET',
      path: `/invoice/${id}`,
    });
  }

  /**
   * Create a new invoice
   */
  async create(data: CreateInvoiceData): Promise<Invoice> {
    return this.client.request<Invoice>({
      method: 'POST',
      path: '/invoice',
      body: data,
    });
  }

  /**
   * Update an existing invoice
   */
  async update(id: number, data: Partial<CreateInvoiceData>): Promise<Invoice> {
    return this.client.request<Invoice>({
      method: 'PUT',
      path: `/invoice/${id}`,
      body: data,
    });
  }

  /**
   * Delete an invoice
   */
  async delete(id: number): Promise<void> {
    await this.client.request<void>({
      method: 'DELETE',
      path: `/invoice/${id}`,
    });
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
  }

  /**
   * Void/cancel a Verifactu invoice
   *
   * This is used for invoices that have been registered with Verifactu
   * (Spanish electronic invoicing system).
   */
  async void(id: number): Promise<Invoice> {
    return this.client.request<Invoice>({
      method: 'POST',
      path: `/invoice/${id}/void`,
    });
  }

  /**
   * Get public link for an invoice
   *
   * Returns a public URL where the invoice can be viewed without authentication.
   */
  async getPublicLink(id: number): Promise<InvoicePublicLink> {
    return this.client.request<InvoicePublicLink>({
      method: 'GET',
      path: `/invoice/${id}/public`,
    });
  }

  /**
   * Update invoice charges/payments
   *
   * Updates the payment records for an invoice.
   */
  async updateCharges(id: number, data: UpdateInvoiceChargesData): Promise<Invoice> {
    return this.client.request<Invoice>({
      method: 'PUT',
      path: `/invoice/${id}/charges`,
      body: data,
    });
  }
}
