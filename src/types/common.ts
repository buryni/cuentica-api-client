/**
 * Common types used across the Cuentica API
 */

/**
 * Business type - Required field not documented in official API docs
 * - 'company': For businesses with CIF (starts with A, B, C, D, E, F, G, H, J, N, P, Q, R, S, U, V, W)
 * - 'individual': For freelancers/autonomos with NIF (starts with X, Y, Z, or numbers)
 */
export type BusinessType = 'company' | 'individual';

/**
 * Document type for expenses - Required but not documented
 */
export type DocumentType = 'invoice' | 'ticket';

/**
 * Valid VAT rates in Spain
 * Note: The API expects these as percentages, NOT as calculated amounts
 */
export type VATRate = 0 | 4 | 10 | 12 | 21;

/**
 * Payment methods accepted by the API
 */
export type PaymentMethod =
  | 'cash'
  | 'wire_transfer'
  | 'direct_debit'
  | 'check'
  | 'credit_card'
  | 'promissory_note'
  | 'other';

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

/**
 * Pagination info from response headers
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Paginated response with cache information
 */
export interface CachedPaginatedResponse<T> extends PaginatedResponse<T> {
  cached: boolean;
}

/**
 * API Error structure
 */
export interface ApiErrorDetail {
  field: string;
  received_value?: unknown;
  message: string;
}

export interface ApiErrorResponse {
  status?: number;
  message: string;
  errors?: ApiErrorDetail[];
}
