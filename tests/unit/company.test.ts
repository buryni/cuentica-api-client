/**
 * Unit tests for Company endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanyEndpoint } from '../../src/endpoints/company.js';
import { createMockClient, mockData } from './mocks.js';

describe('CompanyEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: CompanyEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new CompanyEndpoint(client);
  });

  describe('get', () => {
    it('should fetch company information', async () => {
      const mockCompany = mockData.company();
      vi.mocked(client.request).mockResolvedValue(mockCompany);

      const result = await endpoint.get();

      expect(client.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/company',
      });
      expect(result).toEqual(mockCompany);
    });
  });

  describe('getSeries', () => {
    it('should fetch invoice series', async () => {
      const mockSeries = [mockData.invoiceSerie()];
      vi.mocked(client.request).mockResolvedValue(mockSeries);

      const result = await endpoint.getSeries();

      expect(client.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/company/serie',
      });
      expect(result).toEqual(mockSeries);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no series exist', async () => {
      vi.mocked(client.request).mockResolvedValue([]);

      const result = await endpoint.getSeries();

      expect(result).toEqual([]);
    });
  });
});
