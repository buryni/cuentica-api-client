/**
 * Cuentica API - Main API Class
 *
 * Provides a unified interface to all Cuentica API endpoints.
 */

import { CuenticaClient } from './client.js';
import type { CuenticaClientConfig } from './client.js';
import {
  ProviderEndpoint,
  ExpenseEndpoint,
  CustomerEndpoint,
  InvoiceEndpoint,
  AccountEndpoint,
  CompanyEndpoint,
  IncomeEndpoint,
  DocumentEndpoint,
  TagEndpoint,
  TransferEndpoint,
} from './endpoints/index.js';

/**
 * Main Cuentica API class
 *
 * @example
 * ```typescript
 * import { CuenticaAPI } from '@nexusland/cuentica-api-client';
 *
 * const api = new CuenticaAPI({
 *   apiToken: 'your-token-here',
 *   debug: true,
 * });
 *
 * // List providers
 * const providers = await api.providers.list();
 *
 * // Create an expense
 * const expense = await api.expenses.create({
 *   date: '2024-01-15',
 *   document_type: 'invoice',
 *   document_number: 'FAC-001',
 *   provider: 123,
 *   draft: false,
 *   expense_lines: [{
 *     description: 'Web hosting',
 *     base: 100,
 *     tax: 21,  // 21% VAT
 *     imputation: 100,
 *     expense_type: '6290004',
 *   }],
 *   payments: [{
 *     date: '2024-01-15',
 *     amount: 121,
 *     payment_method: 'wire_transfer',
 *     paid: true,
 *   }],
 * });
 * ```
 */
export class CuenticaAPI {
  private readonly client: CuenticaClient;

  /** Provider (Proveedor) operations */
  public readonly providers: ProviderEndpoint;

  /** Expense (Gasto) operations */
  public readonly expenses: ExpenseEndpoint;

  /** Customer (Cliente) operations */
  public readonly customers: CustomerEndpoint;

  /** Invoice (Factura) operations */
  public readonly invoices: InvoiceEndpoint;

  /** Bank Account operations */
  public readonly accounts: AccountEndpoint;

  /** Company information */
  public readonly company: CompanyEndpoint;

  /** Income (Ingreso) operations */
  public readonly incomes: IncomeEndpoint;

  /** Document (Documento) operations */
  public readonly documents: DocumentEndpoint;

  /** Tag (Etiqueta) operations */
  public readonly tags: TagEndpoint;

  /** Transfer (Traspaso) operations */
  public readonly transfers: TransferEndpoint;

  constructor(config: CuenticaClientConfig) {
    this.client = new CuenticaClient(config);
    this.providers = new ProviderEndpoint(this.client);
    this.expenses = new ExpenseEndpoint(this.client);
    this.customers = new CustomerEndpoint(this.client);
    this.invoices = new InvoiceEndpoint(this.client);
    this.accounts = new AccountEndpoint(this.client);
    this.company = new CompanyEndpoint(this.client);
    this.incomes = new IncomeEndpoint(this.client);
    this.documents = new DocumentEndpoint(this.client);
    this.tags = new TagEndpoint(this.client);
    this.transfers = new TransferEndpoint(this.client);
  }

  /**
   * Create API instance from environment variables
   *
   * Reads CUENTICA_API_TOKEN and optionally CUENTICA_API_URL from env.
   *
   * @example
   * ```typescript
   * const api = CuenticaAPI.fromEnv({ debug: true });
   * ```
   */
  static fromEnv(options?: Partial<CuenticaClientConfig>): CuenticaAPI {
    const apiToken = process.env.CUENTICA_API_TOKEN;
    const apiUrl = process.env.CUENTICA_API_URL;

    if (!apiToken) {
      throw new Error('CUENTICA_API_TOKEN environment variable is not set');
    }

    return new CuenticaAPI({
      apiToken,
      apiUrl,
      ...options,
    });
  }
}

/**
 * Create a Cuentica API instance from environment variables
 *
 * @example
 * ```typescript
 * import { createCuenticaAPI } from '@nexusland/cuentica-api-client';
 *
 * const api = createCuenticaAPI({ debug: true });
 * const company = await api.company.get();
 * ```
 */
export function createCuenticaAPI(options?: Partial<CuenticaClientConfig>): CuenticaAPI {
  const apiToken = process.env.CUENTICA_API_TOKEN;
  const apiUrl = process.env.CUENTICA_API_URL;

  if (!apiToken) {
    throw new Error('CUENTICA_API_TOKEN environment variable is not set');
  }

  return new CuenticaAPI({
    apiToken,
    apiUrl,
    ...options,
  });
}
