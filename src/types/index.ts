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
  UpdateExpensePaymentsData,
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
  CreateInvoiceLine,
  InvoiceListParams,
  InvoiceCharge,
  UpdateInvoiceChargesData,
  InvoicePublicLink,
} from './invoice.js';

// Company types
export type { Company } from './company.js';

// Account types
export type { BankAccount, AccountListParams } from './account.js';

// Income types
export type {
  Income,
  IncomeLine,
  IncomeCharge,
  IncomeDetails,
  CreateIncomeData,
  CreateIncomeLine,
  UpdateIncomeChargesData,
  IncomeListParams,
} from './income.js';

// Document types
export type {
  Document,
  DocumentAssignment,
  CreateDocumentData,
  UpdateDocumentData,
  DocumentListParams,
  DocumentAttachment,
} from './document.js';

// Tag types
export type { Tag, TagListParams } from './tag.js';

// Transfer types
export type {
  Transfer,
  CreateTransferData,
  UpdateTransferData,
  TransferListParams,
} from './transfer.js';

// Invoice Serie types
export type { InvoiceSerie } from './serie.js';

// Cache types
export type {
  CacheConfig,
  CacheEntry,
  CachedResponse,
  CacheKeyPattern,
} from './cache.js';
export { CacheTTL } from './cache.js';
