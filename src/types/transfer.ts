/**
 * Transfer (Traspaso) types
 *
 * Transfers represent money movements between accounts (bank accounts, cash, etc.)
 */

import type { PaymentMethod } from './common.js';

/**
 * Full transfer as returned by the API
 */
export interface Transfer {
  id: number;
  /** Transfer date (YYYY-MM-DD) */
  date: string;
  /** Creation timestamp */
  created_on: string;
  /** Transfer amount */
  amount: number;
  /** Source account ID */
  origin_account: number;
  /** Destination account ID */
  destination_account: number;
  /** Source account name (read-only) */
  origin_account_name?: string;
  /** Destination account name (read-only) */
  destination_account_name?: string;
  /** Payment method */
  payment_method: PaymentMethod;
  /** Transfer description/concept */
  concept?: string;
  /** Additional notes */
  notes?: string;
  /** Whether reconciled with bank (read-only) */
  conciliated?: boolean;
}

/**
 * Data required to create a new transfer
 */
export interface CreateTransferData {
  /** Transfer date (YYYY-MM-DD) */
  date: string;
  /** Transfer amount */
  amount: number;
  /** Source account ID */
  origin_account: number;
  /** Destination account ID */
  destination_account: number;
  /** Payment method */
  payment_method: PaymentMethod;
  /** Transfer description/concept */
  concept?: string;
  /** Additional notes */
  notes?: string;
}

/**
 * Data for updating a transfer
 * API only accepts: amount, notes (not concept)
 */
export interface UpdateTransferData {
  /** Transfer amount */
  amount?: number;
  /** Additional notes */
  notes?: string;
}

/**
 * Parameters for listing transfers
 */
export interface TransferListParams {
  /** Filter by source account ID */
  origin_account?: number;
  /** Filter by destination account ID */
  destination_account?: number;
  /** Filter by payment method */
  payment_method?: PaymentMethod;
  /** Filter from date (YYYY-MM-DD) */
  date_from?: string;
  /** Filter to date (YYYY-MM-DD) */
  date_to?: string;
  page?: number;
  page_size?: number;
}
