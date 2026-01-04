/**
 * Provider (Proveedor) types
 *
 * IMPORTANT: The official documentation has several errors:
 * - 'business_type' is required but not documented
 * - Both 'nombre' AND 'business_name' are required
 * - Field names in docs use Spanish but API expects English (address, town, postal_code, region)
 */

import type { BusinessType } from './common.js';

/**
 * Provider as returned by the API (GET responses)
 */
export interface Provider {
  id: number;
  cif: string;
  business_name: string;
  tradename?: string;
  business_type: BusinessType;
  address?: string;
  town?: string;
  postal_code?: string;
  region?: string;
  country_code?: string;
  phone?: string;
  email?: string;
  web?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Data required to create a new provider
 *
 * Note: Both 'nombre' and 'business_name' are required despite docs only mentioning 'nombre'
 */
export interface CreateProviderData {
  /** Tax ID (CIF/NIF) - Required */
  cif: string;

  /**
   * Trade name - Required
   * Note: Internally mapped to 'tradename' in responses
   */
  nombre: string;

  /** Business name - Required (not documented but API requires it) */
  business_name: string;

  /**
   * Business type - Required (not documented)
   * Use 'company' for CIF, 'individual' for NIF
   */
  business_type: BusinessType;

  /** Country code (e.g., 'ES') - Required */
  pais: string;

  /** Street address */
  address?: string;

  /** City/Town */
  town?: string;

  /** Postal code */
  postal_code?: string;

  /** Region/Province */
  region?: string;

  /** Phone number */
  phone?: string;

  /** Email address */
  email?: string;

  /** Website URL */
  web?: string;

  /** Additional notes */
  notes?: string;
}

/**
 * Data for updating an existing provider
 */
export interface UpdateProviderData extends Partial<CreateProviderData> {
  id?: never; // ID cannot be updated
}

/**
 * Parameters for searching/listing providers
 */
export interface ProviderListParams {
  /** Search query (searches in CIF, name, etc.) */
  q?: string;
  page?: number;
  page_size?: number;
}

/**
 * Helper function to infer business type from Spanish tax ID
 */
export function inferBusinessType(taxId: string): BusinessType {
  const firstChar = taxId.charAt(0).toUpperCase();
  const companyPrefixes = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'N',
    'P',
    'Q',
    'R',
    'S',
    'U',
    'V',
    'W',
  ];

  if (companyPrefixes.includes(firstChar)) {
    return 'company';
  }
  return 'individual';
}
