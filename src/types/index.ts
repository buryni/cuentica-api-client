/**
 * Cuentica API Types
 *
 * This module exports all types with corrections for the documented API errors.
 * See README.md for details on discrepancies between official docs and actual API behavior.
 */

// Common types
export type {
  BusinessType,
  DocumentType,
  VATRate,
  PaymentMethod,
  PaginationParams,
  PaginationInfo,
  PaginatedResponse,
  ApiErrorDetail,
  ApiErrorResponse,
} from './common.js';

// Provider types
export type {
  Provider,
  CreateProviderData,
  UpdateProviderData,
  ProviderListParams,
} from './provider.js';
export { inferBusinessType } from './provider.js';

// Expense types
export type {
  Expense,
  ExpenseLine,
  ExpensePayment,
  ExpenseDetails,
  CreateExpenseData,
  ExpenseListParams,
} from './expense.js';

// Customer types
export type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerListParams,
} from './customer.js';

// Invoice types
export type {
  Invoice,
  InvoiceLine,
  InvoiceStatus,
  CreateInvoiceData,
  InvoiceListParams,
} from './invoice.js';

// Company types
export type { Company } from './company.js';

// Account types
export type { BankAccount, AccountListParams } from './account.js';
