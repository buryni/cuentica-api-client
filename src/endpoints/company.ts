/**
 * Company API Operations
 */

import type { CuenticaClient } from '../client.js';
import type { Company } from '../types/company.js';

/**
 * Company operations
 */
export class CompanyEndpoint {
  constructor(private readonly client: CuenticaClient) {}

  /**
   * Get company information
   */
  async get(): Promise<Company> {
    return this.client.request<Company>({
      method: 'GET',
      path: '/company',
    });
  }
}
