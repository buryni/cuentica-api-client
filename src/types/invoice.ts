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
 * Invoice amount details (from API response)
 */
export interface InvoiceAmountDetails {
  total_base: number;
  total_vat: number;
  total_tax: number;
  surcharge: number;
  total_retention: number;
  total_invoice: number;
  total_supplied_cost: number;
  total_amount: number;
  total_charged: number;
  total_left: number;
}

/**
 * Full invoice as returned by the API
 */
export interface Invoice {
  id: number;
  /** Invoice number (numeric) */
  invoice_number: number;
  /** Invoice serie code */
  invoice_serie: string;
  /** Invoice date (YYYY-MM-DD) */
  date: string;
  /** Expedition date */
  expedition_date?: string;
  /** Whether the invoice is issued */
  issued: boolean;
  /** Whether the invoice is recurrent */
  recurrent: boolean;
  /** Customer details */
  customer?: Customer;
  /** Amount details */
  amount_details?: InvoiceAmountDetails;
  /** Additional notes/annotations */
  annotations?: string;
  /** Invoice description */
  description?: string;
  /** Invoice footer text */
  footer?: string;
  /** Invoice line items */
  invoice_lines: Array<{
    id: number;
    quantity: number;
    concept: string;
    amount: number;
    discount: number;
    tax: number;
    tax_amount: number;
    retention: number;
    retention_amount: number;
    sell_type: 'service' | 'product';
    tax_regime?: string;
    tax_subjection_code?: string;
    surcharge?: number;
    surcharge_amount?: number;
  }>;
  /** Charge/payment records */
  charges: Array<{
    id: number;
    amount: number;
    payment_method: string;
    date: string;
    destination_account: number;
    destination_account_name: string;
    destination_account_number: string;
    paid: boolean;
    conciliated: boolean;
  }>;
  /** Tags for categorization */
  tags?: string[];
  /** Public link URL */
  public_link?: string;
  /** Register info for tax purposes */
  register_info?: {
    source: string;
    registration_code: number;
    registration_description: string;
    status_code: number;
    status_description: string;
    url: string;
    qr: string | null;
  };
}

/**
 * Invoice line item for creation
 * API requires: concept, quantity, amount, discount, retention, tax, sell_type
 */
export interface CreateInvoiceLine {
  /** Line description/concept */
  concept: string;
  /** Quantity */
  quantity: number;
  /** Unit price (amount) */
  amount: number;
  /** Discount percentage (0-100) - required by API */
  discount: number;
  /** Retention percentage (0-100) - required by API */
  retention: number;
  /** VAT rate percentage */
  tax: number;
  /** Sell type (service or product) */
  sell_type: 'service' | 'product';
}

/**
 * Data required to create a new invoice
 * API only accepts: issued, date, customer, invoice_lines, charges
 */
export interface CreateInvoiceData {
  /** Whether the invoice is issued (false = draft, can be deleted) */
  issued: boolean;
  /** Invoice date (YYYY-MM-DD) */
  date: string;
  /** Customer ID */
  customer: number;
  /** Invoice line items (required, cannot be empty) */
  invoice_lines: CreateInvoiceLine[];
  /** Charge/payment records (required, cannot be empty) */
  charges: Array<{
    date: string;
    amount: number;
    payment_method: string;
    destination_account: number;
    charged: boolean;
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
  /** Filter by serie */
  serie?: string;
  /** Filter by tags */
  tags?: string[];
  /** Order field */
  order_field?: 'date' | 'number' | 'created_at';
  /** Order direction */
  order_direction?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

/**
 * Invoice charge/payment record
 */
export interface InvoiceCharge {
  id?: number;
  /** Charge date (YYYY-MM-DD) */
  date: string;
  /** Charge amount */
  amount: number;
  /** Payment method */
  payment_method: string;
  /** Bank account ID for the charge destination */
  destination_account?: number;
  /** Whether the charge has been received */
  charged: boolean;
  /** Expected charge date if not received */
  expected_date?: string;
  /** Account name (read-only) */
  destination_account_name?: string;
  /** Account number (read-only) */
  destination_account_number?: string;
  /** Whether reconciled with bank (read-only) */
  conciliated?: boolean;
}

/**
 * Data for updating invoice charges
 * API requires: date, amount, payment_method, destination_account, charged
 */
export interface UpdateInvoiceChargesData {
  charges: Array<{
    date: string;
    amount: number;
    payment_method: string;
    destination_account: number;
    charged: boolean;
  }>;
}

/**
 * Invoice public link response
 */
export interface InvoicePublicLink {
  /** Public URL to view the invoice */
  url: string;
  /** Expiration date of the link (if any) */
  expires_at?: string;
}
