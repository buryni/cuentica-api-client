/**
 * Invoice Serie types
 *
 * Series are used to organize and number invoices.
 */

/**
 * Invoice serie as returned by the API
 */
export interface InvoiceSerie {
  /** Serie name/identifier */
  name: string;
  /** Whether this is the default serie */
  default: boolean;
}
