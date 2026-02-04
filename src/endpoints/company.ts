/**
 * Company API Operations
 */

import type { CuenticaClient } from '../client.js';
import type { Company } from '../types/company.js';
import type { InvoiceSerie } from '../types/serie.js';

/**
 * Company operations
 */
export class CompanyEndpoint {
  constructor(private readonly client: CuenticaClient) {}

  /**
   * Get company information
   */
  async get(): Promise<Company> {
    const result = await this.client.cachedRequest<Company>({
      method: 'GET',
      path: '/company',
    });
    return result.data;
  }

  /**
   * Get invoice series for the company
   */
  async getSeries(): Promise<InvoiceSerie[]> {
    const result = await this.client.cachedRequest<InvoiceSerie[]>({
      method: 'GET',
      path: '/company/serie',
    });
    return result.data;
  }
}
