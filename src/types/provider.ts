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
 * Required: cif, nombre, business_name, business_type, pais
 * Optional: address, town, postal_code, region (must be lowercase Spanish region name)
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

  /** Street address (optional) */
  address?: string;

  /** City/Town (optional) */
  town?: string;

  /** Postal code (optional) */
  postal_code?: string;

  /** Region/Province (optional, must be lowercase: 'madrid', 'barcelona', etc.) */
  region?: string;
}

/**
 * Data for updating an existing provider
 * API only accepts: business_name, nombre (not business_type)
 */
export interface UpdateProviderData {
  /** Business name */
  business_name?: string;
  /** Trade name */
  nombre?: string;
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
