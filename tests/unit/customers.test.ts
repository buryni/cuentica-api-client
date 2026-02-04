/**
 * Unit tests for Customer endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerEndpoint } from '../../src/endpoints/customers.js';
import { createMockClient, createPaginatedResponse, mockData } from './mocks.js';

describe('CustomerEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: CustomerEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new CustomerEndpoint(client);
  });

  describe('list', () => {
    it('should list customers without filters', async () => {
      const mockCustomers = [mockData.customer()];
      const response = createPaginatedResponse(mockCustomers);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.list();

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/customer',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list customers with search query', async () => {
      const mockCustomers = [mockData.customer()];
      const response = createPaginatedResponse(mockCustomers);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      await endpoint.list({
        q: 'test',
        page: 1,
        page_size: 25,
      });

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/customer',
        query: {
          q: 'test',
          page: 1,
          page_size: 25,
        },
      });
    });
  });

  describe('searchByCIF', () => {
    it('should find customer with exact CIF match', async () => {
      const mockCustomer = mockData.customer();
      const response = createPaginatedResponse([mockCustomer]);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.searchByCIF('B12345678');

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/customer',
        query: { q: 'B12345678' },
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should return null when no customer found', async () => {
      const response = createPaginatedResponse([]);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.searchByCIF('X99999999');

      expect(result).toBeNull();
    });

    it('should handle case-insensitive CIF search', async () => {
      const mockCustomer = { ...mockData.customer(), cif: 'b12345678' };
      const response = createPaginatedResponse([mockCustomer]);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.searchByCIF('B12345678');

      expect(result).toEqual(mockCustomer);
    });
  });

  describe('get', () => {
    it('should get customer by ID', async () => {
      const mockCustomer = mockData.customer();
      vi.mocked(client.cachedRequest).mockResolvedValue({ data: mockCustomer, cached: false });

      const result = await endpoint.get(1);

      expect(client.cachedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/customer/1',
      });
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const mockCustomer = mockData.customer();
      vi.mocked(client.request).mockResolvedValue(mockCustomer);

      const data = {
        cif: 'B12345678',
        business_name: 'Test Customer SL',
        trade_name: 'Test Customer',
        address: 'Calle Test 123',
        city: 'Madrid',
        postal_code: '28001',
        country: 'ES',
      };

      const result = await endpoint.create(data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/customer',
        body: data,
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('customer');
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('update', () => {
    it('should update an existing customer', async () => {
      const mockCustomer = mockData.customer();
      vi.mocked(client.request).mockResolvedValue(mockCustomer);

      const data = { trade_name: 'Updated Trade Name' };
      const result = await endpoint.update(1, data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/customer/1',
        body: data,
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('customer');
      expect(client.deleteFromCache).toHaveBeenCalledWith('customer/1');
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('delete', () => {
    it('should delete a customer', async () => {
      vi.mocked(client.request).mockResolvedValue(undefined);

      await endpoint.delete(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/customer/1',
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('customer');
      expect(client.deleteFromCache).toHaveBeenCalledWith('customer/1');
    });
  });
});
