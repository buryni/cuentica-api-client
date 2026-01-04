/**
 * Customer (Cliente) types
 */

import type { BusinessType } from './common.js';

/**
 * Customer as returned by the API
 */
export interface Customer {
  id: number;
  cif: string;
  business_name: string;
  trade_name?: string;
  business_type?: BusinessType;
  address?: string;
  city?: string;
  postal_code?: string;
  region?: string;
  country?: string;
  phone?: string;
  email?: string;
  web?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Data required to create a new customer
 */
export interface CreateCustomerData {
  /** Tax ID (CIF/NIF) */
  cif: string;
  /** Business/legal name */
  business_name: string;
  /** Trade name (optional) */
  trade_name?: string;
  /** Business type */
  business_type?: BusinessType;
  /** Street address */
  address?: string;
  /** City */
  city?: string;
  /** Postal code */
  postal_code?: string;
  /** Region/Province */
  region?: string;
  /** Country code (e.g., 'ES') */
  country?: string;
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
 * Data for updating an existing customer
 * API requires ALL fields on update, not just changed ones
 */
export interface UpdateCustomerData {
  /** Tax ID (CIF/NIF) */
  cif?: string;
  /** Business/legal name */
  business_name?: string;
  /** Trade name */
  trade_name?: string;
  /** Business type */
  business_type?: BusinessType;
  /** Street address */
  address?: string;
  /** City */
  city?: string;
  /** Town */
  town?: string;
  /** Postal code */
  postal_code?: string;
  /** Region/Province */
  region?: string;
  /** Country code (e.g., 'ES') */
  country?: string;
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
 * Parameters for searching/listing customers
 */
export interface CustomerListParams {
  /** Search query */
  q?: string;
  page?: number;
  page_size?: number;
}
