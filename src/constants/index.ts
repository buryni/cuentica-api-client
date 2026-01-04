/**
 * Cuentica API Constants
 */

export {
  EXPENSE_TYPE_CODES,
  EXPENSE_TYPES,
  EXPENSE_CATEGORIES,
  getExpenseTypeDescription,
  isValidExpenseType,
} from './expense-types.js';
export type { ExpenseTypeCode } from './expense-types.js';

/**
 * Valid VAT rates in Spain (as percentages)
 */
export const VAT_RATES = [0, 4, 10, 12, 21] as const;

/**
 * Payment methods accepted by the API
 */
export const PAYMENT_METHODS = [
  'cash',
  'wire_transfer',
  'direct_debit',
  'check',
  'credit_card',
  'promissory_note',
  'other',
] as const;

/**
 * Document types for expenses
 */
export const DOCUMENT_TYPES = ['invoice', 'ticket'] as const;

/**
 * Invoice statuses
 */
export const INVOICE_STATUSES = [
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled',
] as const;

/**
 * Spanish CIF prefixes (for companies)
 */
export const COMPANY_CIF_PREFIXES = [
  'A', // Sociedades anónimas
  'B', // Sociedades de responsabilidad limitada
  'C', // Sociedades colectivas
  'D', // Sociedades comanditarias
  'E', // Comunidades de bienes
  'F', // Sociedades cooperativas
  'G', // Asociaciones
  'H', // Comunidades de propietarios
  'J', // Sociedades civiles
  'N', // Entidades extranjeras
  'P', // Corporaciones locales
  'Q', // Organismos públicos
  'R', // Congregaciones religiosas
  'S', // Órganos de la Administración General del Estado
  'U', // Uniones Temporales de Empresas
  'V', // Otros tipos
  'W', // Establecimientos permanentes de entidades no residentes
] as const;

/**
 * Spanish NIF/NIE prefixes (for individuals)
 */
export const INDIVIDUAL_NIF_PREFIXES = [
  'X', // NIE (foreigners)
  'Y', // NIE (foreigners)
  'Z', // NIE (foreigners)
  // Numbers 0-9 for DNI
] as const;

/**
 * Default API URL
 */
export const DEFAULT_API_URL = 'https://api.cuentica.com';

/**
 * API rate limits
 */
export const RATE_LIMITS = {
  requestsPerFiveMinutes: 600,
  requestsPerDay: 7200,
} as const;
