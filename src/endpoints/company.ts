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
    return this.client.request<Company>({
      method: 'GET',
      path: '/company',
    });
  }

  /**
   * Get invoice series for the company
   */
  async getSeries(): Promise<InvoiceSerie[]> {
    return this.client.request<InvoiceSerie[]>({
      method: 'GET',
      path: '/company/serie',
    });
  }
}
