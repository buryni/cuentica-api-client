/**
 * Invoice (Factura) types
 */

import type { Customer } from './customer.js';

/**
 * Invoice status
 */
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

/**
 * Invoice line item
 */
export interface InvoiceLine {
  id?: number;
  /** Line description/concept */
  concept: string;
  /** Quantity */
  quantity: number;
  /** Unit price (before tax) */
  unit_price: number;
  /** Discount percentage (0-100) */
  discount_percentage?: number;
  /** VAT rate percentage */
  tax_rate: number;
  /** Calculated tax amount (read-only) */
  tax_amount?: number;
  /** Subtotal before tax (read-only) */
  subtotal?: number;
  /** Line total including tax (read-only) */
  total?: number;
}

/**
 * Full invoice as returned by the API
 */
export interface Invoice {
  id: number;
  /** Invoice number */
  number: string;
  /** Invoice date (YYYY-MM-DD) */
  date: string;
  /** Due date (YYYY-MM-DD) */
  due_date?: string;
  /** Customer ID */
  customer_id: number;
  /** Customer details (when expanded) */
  customer?: Customer;
  /** Invoice status */
  status: InvoiceStatus;
  /** Subtotal before tax */
  subtotal: number;
  /** Total tax amount */
  tax_amount: number;
  /** Total amount including tax */
  total: number;
  /** Additional notes */
  notes?: string;
  /** Invoice line items */
  lines: InvoiceLine[];
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * Data required to create a new invoice
 */
export interface CreateInvoiceData {
  /** Invoice number (auto-generated if not provided) */
  number?: string;
  /** Invoice date (YYYY-MM-DD) */
  date: string;
  /** Due date (YYYY-MM-DD) */
  due_date?: string;
  /** Customer ID */
  customer_id: number;
  /** Additional notes */
  notes?: string;
  /** Invoice line items */
  lines: Array<{
    concept: string;
    quantity: number;
    unit_price: number;
    discount_percentage?: number;
    tax_rate: number;
  }>;
}

/**
 * Parameters for listing invoices
 */
export interface InvoiceListParams {
  /** Filter by customer ID */
  customer_id?: number;
  /** Filter by status */
  status?: InvoiceStatus;
  /** Filter from date (YYYY-MM-DD) */
  date_from?: string;
  /** Filter to date (YYYY-MM-DD) */
  date_to?: string;
  page?: number;
  page_size?: number;
}
