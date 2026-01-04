/**
 * Expense (Gasto) types
 *
 * IMPORTANT: The official documentation has MAJOR errors:
 * - Structure is completely different (nested vs flat)
 * - 'tax' in expense_lines is a PERCENTAGE (21, 10, 4, 0), NOT an amount
 * - 'document_type' is required but not documented
 * - 'imputation' is required (use 100 for full attribution)
 * - 'payments' array is required
 * - 'expense_type' must be specific codes (e.g., '6290006'), not generic (e.g., '629')
 */

import type { DocumentType, PaymentMethod, VATRate } from './common.js';
import type { Provider } from './provider.js';

/**
 * Expense line item
 */
export interface ExpenseLine {
  id?: number;
  /** Line description */
  description: string;
  /** Tax base amount */
  base: number;
  /**
   * VAT rate as PERCENTAGE (0, 4, 10, 12, 21)
   * NOT the calculated tax amount!
   */
  tax: VATRate;
  /** Calculated tax amount (read-only, calculated by API) */
  tax_amount?: number;
  /** Retention percentage */
  retention?: number;
  /** Retention amount (read-only) */
  retention_amount?: number;
  /** Surcharge percentage */
  surcharge?: number;
  /** Surcharge amount (read-only) */
  surcharge_amount?: number;
  /**
   * Imputation percentage - Required!
   * Use 100 for 100% business expense attribution
   */
  imputation: number;
  /**
   * Expense type code - Must be specific!
   * e.g., '6290006' (other external services), '6280006' (phone/communications)
   * NOT generic codes like '629' or '628'
   */
  expense_type: string;
  /** Whether this line is a draft */
  draft?: boolean;
  /** Whether this is an investment */
  investment?: boolean;
  /** Intra-community service provider */
  isp?: boolean;
}

/**
 * Expense payment record
 */
export interface ExpensePayment {
  id?: number;
  /** Payment date (YYYY-MM-DD) */
  date: string;
  /** Payment amount */
  amount: number;
  /** Payment method */
  payment_method: PaymentMethod;
  /** Bank account ID for the payment origin */
  origin_account?: number;
  /** Whether the payment has been made */
  paid: boolean;
  /** Expected payment date if not paid */
  expected_date?: string;
  /** Account name (read-only) */
  origin_account_name?: string;
  /** Account number (read-only) */
  origin_account_number?: string;
  /** Whether reconciled with bank (read-only) */
  conciliated?: boolean;
}

/**
 * Expense totals summary (read-only, from API response)
 */
export interface ExpenseDetails {
  base: number;
  tax: number;
  retention: number;
  surcharge: number;
  total_expense: number;
  paid: number;
  left: number;
}

/**
 * Full expense as returned by the API
 */
export interface Expense {
  id: number;
  /** Expense date (YYYY-MM-DD) */
  date: string;
  /** Accounting date */
  accounting_date: string;
  /** Creation timestamp */
  created_on: string;
  /** Whether this is a draft */
  draft: boolean;
  /** Document type ('invoice' or 'ticket') */
  document_type: DocumentType;
  /** Document number/reference */
  document_number: string;
  /** Provider information */
  provider?: Provider;
  /** Additional notes/annotations */
  annotations?: string;
  /** Tags for categorization */
  tags?: string[];
  /** VAT cash criteria */
  cash_criteria?: boolean;
  /** EU VAT */
  vat_eu?: boolean;
  /** Expense totals */
  expense_details: ExpenseDetails;
  /** Line items */
  expense_lines: ExpenseLine[];
  /** Payment records */
  payments: ExpensePayment[];
  /** Whether this is a recurring expense */
  recurrent?: boolean;
  /** Whether has file attachment */
  has_attachment?: boolean;
}

/**
 * Data required to create a new expense
 */
export interface CreateExpenseData {
  /** Expense date (YYYY-MM-DD) */
  date: string;

  /** Document number/invoice reference */
  document_number?: string;

  /**
   * Document type - Required (not documented!)
   */
  document_type: DocumentType;

  /** Provider ID */
  provider: number;

  /**
   * Draft status - Required (not documented!)
   * Set to false for finalized expenses
   */
  draft: boolean;

  /** Additional notes */
  annotations?: string;

  /** Tags */
  tags?: string[];

  /** VAT cash criteria */
  cash_criteria?: boolean;

  /** EU VAT */
  vat_eu?: boolean;

  /**
   * Expense line items - Required!
   * API requires: description, base, tax, retention, imputation, expense_type
   */
  expense_lines: Array<{
    description: string;
    base: number;
    /** VAT PERCENTAGE (0, 4, 10, 12, 21), NOT amount! */
    tax: VATRate;
    /** Retention percentage - Required by API (use 0 if none) */
    retention: number;
    /** Required! Use 100 for full attribution */
    imputation: number;
    /** Specific expense type code (e.g., '6290006') */
    expense_type: string;
  }>;

  /**
   * Payment records - Required!
   * API requires: date, amount, payment_method, origin_account, paid
   * Note: The API error says origin_account is not in "available keys" but it IS required
   */
  payments: Array<{
    date: string;
    amount: number;
    payment_method: PaymentMethod;
    origin_account: number;
    paid: boolean;
  }>;
}

/**
 * Parameters for listing expenses
 */
export interface ExpenseListParams {
  /** Filter by provider ID */
  provider_id?: number;
  /** Filter from date (YYYY-MM-DD) */
  date_from?: string;
  /** Filter to date (YYYY-MM-DD) */
  date_to?: string;
  /** Filter by expense type */
  expense_type?: string;
  /** Order field */
  order_field?: 'date' | 'created_on';
  /** Order direction */
  order_direction?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

/**
 * Data for updating expense payments
 * API requires: date, amount, payment_method, origin_account, paid
 */
export interface UpdateExpensePaymentsData {
  payments: Array<{
    date: string;
    amount: number;
    payment_method: PaymentMethod;
    origin_account: number;
    paid: boolean;
  }>;
}
