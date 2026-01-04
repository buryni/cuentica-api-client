/**
 * Mock utilities for unit tests
 */

import { vi } from 'vitest';
import type { CuenticaClient } from '../../src/client.js';

/**
 * Create a mock CuenticaClient for testing endpoints
 */
export function createMockClient(): CuenticaClient {
  return {
    request: vi.fn(),
    paginatedRequest: vi.fn(),
    download: vi.fn(),
    upload: vi.fn(),
  } as unknown as CuenticaClient;
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(data: T[], options?: {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
}) {
  return {
    data,
    pagination: {
      currentPage: options?.currentPage ?? 1,
      totalPages: options?.totalPages ?? 1,
      totalItems: options?.totalItems ?? data.length,
      itemsPerPage: options?.itemsPerPage ?? 25,
    },
  };
}

/**
 * Mock response data factories
 */
export const mockData = {
  company: () => ({
    id: 1,
    cif: 'B12345678',
    business_name: 'Test Company SL',
    trade_name: 'Test Company',
    address: 'Calle Test 123',
    city: 'Madrid',
    postal_code: '28001',
    region: 'Madrid',
    country: 'ES',
  }),

  invoiceSerie: () => ({
    id: 1,
    code: 'F',
    name: 'Facturas',
    current_number: 100,
    is_default: true,
    active: true,
  }),

  invoice: () => ({
    id: 1,
    number: 'F-001',
    date: '2024-01-15',
    due_date: '2024-02-15',
    customer_id: 1,
    status: 'sent' as const,
    subtotal: 100,
    tax_amount: 21,
    total: 121,
    lines: [],
  }),

  invoicePublicLink: () => ({
    url: 'https://app.cuentica.com/public/invoice/abc123',
    expires_at: '2024-12-31',
  }),

  expense: () => ({
    id: 1,
    date: '2024-01-15',
    accounting_date: '2024-01-15',
    created_on: '2024-01-15T10:00:00Z',
    draft: false,
    document_type: 'invoice' as const,
    document_number: 'FAC-001',
    expense_details: {
      base: 100,
      tax: 21,
      retention: 0,
      surcharge: 0,
      total_expense: 121,
      paid: 121,
      left: 0,
    },
    expense_lines: [],
    payments: [],
  }),

  income: () => ({
    id: 1,
    date: '2024-01-15',
    accounting_date: '2024-01-15',
    created_on: '2024-01-15T10:00:00Z',
    draft: false,
    income_details: {
      base: 100,
      tax: 21,
      retention: 0,
      total_income: 121,
      charged: 121,
      left: 0,
    },
    income_lines: [],
    charges: [],
  }),

  document: () => ({
    id: 1,
    filename: 'document.pdf',
    extension: 'pdf',
    mime_type: 'application/pdf',
    size: 1024,
    date: '2024-01-15',
    created_on: '2024-01-15T10:00:00Z',
    assignment: 'unassigned' as const,
  }),

  tag: () => ({
    id: 1,
    name: 'Test Tag',
    color: '#FF0000',
    count: 5,
  }),

  transfer: () => ({
    id: 1,
    date: '2024-01-15',
    created_on: '2024-01-15T10:00:00Z',
    amount: 500,
    origin_account: 1,
    destination_account: 2,
    origin_account_name: 'Cuenta Corriente',
    destination_account_name: 'Caja',
    payment_method: 'wire_transfer' as const,
    concept: 'Transfer test',
  }),
};
