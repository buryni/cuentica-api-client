/**
 * Bank Account API Operations
 */

import type { CuenticaClient } from '../client.js';
import type { BankAccount, AccountListParams } from '../types/account.js';
import type { PaginatedResponse } from '../types/common.js';

/**
 * Account operations
 */
export class AccountEndpoint {
  constructor(private readonly client: CuenticaClient) {}

  /**
   * List all accounts
   */
  async list(params?: AccountListParams): Promise<PaginatedResponse<BankAccount>> {
    const query: Record<string, string | number | boolean | undefined> = {};

    if (params?.active !== undefined) query.active = params.active;
    if (params?.page) query.page = params.page;
    if (params?.page_size) query.page_size = params.page_size;

    return this.client.paginatedRequest<BankAccount>({
      method: 'GET',
      path: '/account',
      query,
    });
  }

  /**
   * Get an account by ID
   */
  async get(id: number): Promise<BankAccount> {
    return this.client.request<BankAccount>({
      method: 'GET',
      path: `/account/${id}`,
    });
  }

  /**
   * Get the default payment account
   *
   * Priority: bank > cash > other
   */
  async getDefault(): Promise<BankAccount> {
    const result = await this.list();
    const accounts = result.data;

    // First try to find a bank account
    const bankAccount = accounts.find((a) => a.is_default);
    if (bankAccount) {
      return bankAccount;
    }

    // Fall back to first available account
    if (accounts.length > 0) {
      return accounts[0];
    }

    throw new Error('No payment accounts found');
  }
}
