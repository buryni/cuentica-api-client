/**
 * @nexusland/cuentica-api-client
 *
 * TypeScript client for the Cuentica accounting API.
 *
 * This library provides corrected types and documentation based on real API testing,
 * addressing numerous discrepancies between official documentation and actual behavior.
 *
 * @example
 * ```typescript
 * import { CuenticaAPI, EXPENSE_TYPES } from '@nexusland/cuentica-api-client';
 *
 * const api = new CuenticaAPI({
 *   apiToken: process.env.CUENTICA_API_TOKEN!,
 * });
 *
 * // Create a provider
 * const provider = await api.providers.findOrCreate({
 *   tax_id: 'B12345678',
 *   business_name: 'Acme Corp SL',
 * });
 *
 * // Create an expense
 * const expense = await api.expenses.create({
 *   date: '2024-01-15',
 *   document_type: 'invoice',
 *   provider: provider.id,
 *   draft: false,
 *   expense_lines: [{
 *     description: 'Web services',
 *     base: 100,
 *     tax: 21,
 *     imputation: 100,
 *     expense_type: '6290004', // Hosting y servicios web
 *   }],
 *   payments: [{
 *     date: '2024-01-15',
 *     amount: 121,
 *     payment_method: 'wire_transfer',
 *     paid: true,
 *   }],
 * });
 * ```
 *
 * @packageDocumentation
 */

// Main API class
export { CuenticaAPI, createCuenticaAPI } from './api.js';

// Client
export { CuenticaClient, createClientFromEnv } from './client.js';
export type { CuenticaClientConfig, RequestOptions } from './client.js';

// Cache
export { CacheManager } from './cache.js';
export type { CacheConfig, CachedResponse, CacheEntry, CacheKeyPattern } from './types/cache.js';
export { CacheTTL } from './types/cache.js';

// Errors
export {
  CuenticaError,
  CuenticaConfigError,
  CuenticaRateLimitError,
  CuenticaNetworkError,
} from './errors.js';

// Endpoints
export {
  ProviderEndpoint,
  ExpenseEndpoint,
  CustomerEndpoint,
  InvoiceEndpoint,
  AccountEndpoint,
  CompanyEndpoint,
  IncomeEndpoint,
  DocumentEndpoint,
  TagEndpoint,
  TransferEndpoint,
} from './endpoints/index.js';

// Types
export type {
  // Common
  BusinessType,
  DocumentType,
  VATRate,
  PaymentMethod,
  PaginationParams,
  PaginationInfo,
  PaginatedResponse,
  ApiErrorDetail,
  ApiErrorResponse,
  // Provider
  Provider,
  CreateProviderData,
  UpdateProviderData,
  ProviderListParams,
  // Expense
  Expense,
  ExpenseLine,
  ExpensePayment,
  ExpenseDetails,
  CreateExpenseData,
  ExpenseListParams,
  UpdateExpensePaymentsData,
  // Customer
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerListParams,
  // Invoice
  Invoice,
  InvoiceLine,
  InvoiceStatus,
  CreateInvoiceData,
  InvoiceListParams,
  InvoiceCharge,
  UpdateInvoiceChargesData,
  InvoicePublicLink,
  // Company
  Company,
  // Account
  BankAccount,
  AccountListParams,
  // Income
  Income,
  IncomeLine,
  IncomeCharge,
  IncomeDetails,
  CreateIncomeData,
  UpdateIncomeChargesData,
  IncomeListParams,
  // Document
  Document,
  DocumentAssignment,
  CreateDocumentData,
  UpdateDocumentData,
  DocumentListParams,
  DocumentAttachment,
  // Tag
  Tag,
  TagListParams,
  // Transfer
  Transfer,
  CreateTransferData,
  UpdateTransferData,
  TransferListParams,
  // Invoice Serie
  InvoiceSerie,
} from './types/index.js';

// Helper functions
export { inferBusinessType } from './types/provider.js';

// Constants
export {
  EXPENSE_TYPE_CODES,
  EXPENSE_TYPES,
  EXPENSE_CATEGORIES,
  getExpenseTypeDescription,
  isValidExpenseType,
  VAT_RATES,
  PAYMENT_METHODS,
  DOCUMENT_TYPES,
  INVOICE_STATUSES,
  COMPANY_CIF_PREFIXES,
  INDIVIDUAL_NIF_PREFIXES,
  DEFAULT_API_URL,
  RATE_LIMITS,
} from './constants/index.js';
export type { ExpenseTypeCode } from './constants/index.js';
