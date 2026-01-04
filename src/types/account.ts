/**
 * Bank Account types
 */

/**
 * Bank account as returned by the API
 */
export interface BankAccount {
  id: number;
  /** Account name/description */
  name: string;
  /** IBAN or account number */
  account_number?: string;
  /** Bank name */
  bank_name?: string;
  /** Current balance */
  balance?: number;
  /** Whether this is the default account */
  is_default?: boolean;
  /** Whether account is active */
  active?: boolean;
  /** Creation timestamp */
  created_at?: string;
}

/**
 * Parameters for listing accounts
 */
export interface AccountListParams {
  /** Filter by active status */
  active?: boolean;
  page?: number;
  page_size?: number;
}
