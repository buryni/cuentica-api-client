/**
 * Income (Ingreso) types
 *
 * Incomes represent money received that is NOT tied to an invoice.
 * Examples: bank interest, refunds, subsidies, etc.
 */

import type { PaymentMethod, VATRate } from './common.js';
import type { Customer } from './customer.js';

/**
 * Income line item
 */
export interface IncomeLine {
  id?: number;
  /** Line description */
  description: string;
  /** Tax base amount */
  base: number;
  /** VAT rate as percentage (0, 4, 10, 12, 21) */
  tax: VATRate;
  /** Calculated tax amount (read-only) */
  tax_amount?: number;
  /** Retention percentage */
  retention?: number;
  /** Retention amount (read-only) */
  retention_amount?: number;
  /** Income type code */
  income_type: string;
}

/**
 * Income charge/payment record
 */
export interface IncomeCharge {
  id?: number;
  /** Charge date (YYYY-MM-DD) */
  date: string;
  /** Charge amount */
  amount: number;
  /** Payment method */
  payment_method: PaymentMethod;
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
 * Income totals summary (read-only, from API response)
 */
export interface IncomeDetails {
  base: number;
  tax: number;
  retention: number;
  total_income: number;
  charged: number;
  left: number;
}

/**
 * Full income as returned by the API
 */
export interface Income {
  id: number;
  /** Income date (YYYY-MM-DD) */
  date: string;
  /** Accounting date */
  accounting_date: string;
  /** Creation timestamp */
  created_on: string;
  /** Whether this is a draft */
  draft: boolean;
  /** Document number/reference */
  document_number?: string;
  /** Customer information (optional) */
  customer?: Customer;
  /** Additional notes/annotations */
  annotations?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Income totals */
  income_details: IncomeDetails;
  /** Line items */
  income_lines: IncomeLine[];
  /** Charge records */
  charges: IncomeCharge[];
  /** Whether has file attachment */
  has_attachment?: boolean;
}

/**
 * Income line item for creation
 * API requires: concept, amount, tax, retention, income_type, imputation
 */
export interface CreateIncomeLine {
  /** Line description/concept */
  concept: string;
  /** Amount */
  amount: number;
  /** VAT percentage (0, 4, 10, 12, 21) */
  tax: VATRate;
  /** Retention percentage (0-100) - required by API */
  retention: number;
  /** Income type code */
  income_type: string;
  /** Imputation percentage (0-100) */
  imputation: number;
}

/**
 * Data required to create a new income
 * API requires: date, customer, income_lines, charges
 * Charges require: date, amount, payment_method, destination_account, charged
 * Note: API error says destination_account is not in "available keys" but it IS required
 */
export interface CreateIncomeData {
  /** Income date (YYYY-MM-DD) */
  date: string;
  /** Customer ID (required by API) */
  customer: number;
  /** Income line items (required, cannot be empty) */
  income_lines: CreateIncomeLine[];
  /** Charge records (required, cannot be empty) */
  charges: Array<{
    date: string;
    amount: number;
    payment_method: PaymentMethod;
    destination_account: number;
    charged: boolean;
  }>;
}

/**
 * Data for updating income charges
 * API requires: date, amount, payment_method, destination_account, charged
 */
export interface UpdateIncomeChargesData {
  charges: Array<{
    date: string;
    amount: number;
    payment_method: PaymentMethod;
    destination_account: number;
    charged: boolean;
  }>;
}

/**
 * Parameters for listing incomes
 */
export interface IncomeListParams {
  /** Filter by customer ID */
  customer_id?: number;
  /** Filter from date (YYYY-MM-DD) */
  date_from?: string;
  /** Filter to date (YYYY-MM-DD) */
  date_to?: string;
  /** Order field */
  order_field?: 'date' | 'created_on';
  /** Order direction */
  order_direction?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}
