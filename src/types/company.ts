/**
 * Company (Empresa) types
 */

/**
 * Company information as returned by the API
 */
export interface Company {
  id: number;
  /** Tax ID (CIF) */
  cif: string;
  /** Legal business name */
  business_name: string;
  /** Trade name */
  trade_name?: string;
  /** Street address */
  address?: string;
  /** City */
  city?: string;
  /** Postal code */
  postal_code?: string;
  /** Region/Province */
  region?: string;
  /** Country code */
  country?: string;
  /** Phone number */
  phone?: string;
  /** Email address */
  email?: string;
  /** Website URL */
  web?: string;
  /** Fiscal year start date */
  fiscal_year_start?: string;
  /** Creation timestamp */
  created_at?: string;
}
