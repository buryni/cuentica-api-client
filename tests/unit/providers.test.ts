/**
 * Unit tests for Provider endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProviderEndpoint } from '../../src/endpoints/providers.js';
import { createMockClient, createPaginatedResponse, mockData } from './mocks.js';

describe('ProviderEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: ProviderEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new ProviderEndpoint(client);
  });

  describe('list', () => {
    it('should list providers without filters', async () => {
      const mockProviders = [mockData.provider()];
      const response = createPaginatedResponse(mockProviders);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.list();

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/provider',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list providers with search query', async () => {
      const mockProviders = [mockData.provider()];
      const response = createPaginatedResponse(mockProviders);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      await endpoint.list({
        q: 'test',
        page: 1,
        page_size: 25,
      });

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/provider',
        query: {
          q: 'test',
          page: 1,
          page_size: 25,
        },
      });
    });
  });

  describe('searchByCIF', () => {
    it('should find provider with exact CIF match', async () => {
      const mockProvider = mockData.provider();
      const response = createPaginatedResponse([mockProvider]);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.searchByCIF('B87654321');

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/provider',
        query: { q: 'B87654321' },
      });
      expect(result).toEqual(mockProvider);
    });

    it('should return null when no provider found', async () => {
      const response = createPaginatedResponse([]);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.searchByCIF('X99999999');

      expect(result).toBeNull();
    });

    it('should handle case-insensitive CIF search', async () => {
      const mockProvider = { ...mockData.provider(), cif: 'b87654321' };
      const response = createPaginatedResponse([mockProvider]);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.searchByCIF('B87654321');

      expect(result).toEqual(mockProvider);
    });
  });

  describe('get', () => {
    it('should get provider by ID', async () => {
      const mockProvider = mockData.provider();
      vi.mocked(client.cachedRequest).mockResolvedValue({ data: mockProvider, cached: false });

      const result = await endpoint.get(1);

      expect(client.cachedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/provider/1',
      });
      expect(result).toEqual(mockProvider);
    });
  });

  describe('create', () => {
    it('should create a new provider', async () => {
      const mockProvider = mockData.provider();
      vi.mocked(client.request).mockResolvedValue(mockProvider);

      const data = {
        cif: 'B87654321',
        nombre: 'Test Provider',
        business_name: 'Test Provider SL',
        business_type: 'company' as const,
        pais: 'ES',
      };

      const result = await endpoint.create(data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/provider',
        body: data,
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('provider');
      expect(result).toEqual(mockProvider);
    });
  });

  describe('update', () => {
    it('should update an existing provider', async () => {
      const mockProvider = mockData.provider();
      vi.mocked(client.request).mockResolvedValue(mockProvider);

      const data = { business_name: 'Updated Provider Name' };
      const result = await endpoint.update(1, data);

      expect(client.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/provider/1',
        body: data,
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('provider');
      expect(client.deleteFromCache).toHaveBeenCalledWith('provider/1');
      expect(result).toEqual(mockProvider);
    });
  });

  describe('delete', () => {
    it('should delete a provider', async () => {
      vi.mocked(client.request).mockResolvedValue(undefined);

      await endpoint.delete(1);

      expect(client.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/provider/1',
      });
      expect(client.invalidateCache).toHaveBeenCalledWith('provider');
      expect(client.deleteFromCache).toHaveBeenCalledWith('provider/1');
    });
  });

  describe('findOrCreate', () => {
    it('should return existing provider if found', async () => {
      const mockProvider = mockData.provider();
      const response = createPaginatedResponse([mockProvider]);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.findOrCreate({
        tax_id: 'B87654321',
        business_name: 'Test Provider SL',
      });

      expect(result).toEqual(mockProvider);
      // Should not create since provider was found
      expect(client.request).not.toHaveBeenCalled();
    });

    it('should create new provider if not found', async () => {
      const mockProvider = mockData.provider();
      // First call returns empty (search)
      vi.mocked(client.paginatedRequest).mockResolvedValue(createPaginatedResponse([]));
      // Second call creates provider
      vi.mocked(client.request).mockResolvedValue(mockProvider);

      const result = await endpoint.findOrCreate({
        tax_id: 'B99999999',
        business_name: 'New Provider SL',
      });

      expect(client.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/provider',
        body: {
          cif: 'B99999999',
          nombre: 'New Provider SL',
          business_name: 'New Provider SL',
          business_type: 'company',
          pais: 'ES',
        },
      });
      expect(result).toEqual(mockProvider);
    });

    it('should infer business_type as individual for NIF', async () => {
      const mockProvider = { ...mockData.provider(), business_type: 'individual' as const };
      vi.mocked(client.paginatedRequest).mockResolvedValue(createPaginatedResponse([]));
      vi.mocked(client.request).mockResolvedValue(mockProvider);

      await endpoint.findOrCreate({
        tax_id: '12345678Z',
        business_name: 'Individual Provider',
      });

      expect(client.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/provider',
        body: expect.objectContaining({
          business_type: 'individual',
        }),
      });
    });
  });
});
