/**
 * Unit tests for Account endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountEndpoint } from '../../src/endpoints/accounts.js';
import { createMockClient, createPaginatedResponse, mockData } from './mocks.js';

describe('AccountEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: AccountEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new AccountEndpoint(client);
  });

  describe('list', () => {
    it('should list accounts without filters', async () => {
      const mockAccounts = [mockData.account()];
      const response = createPaginatedResponse(mockAccounts);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.list();

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/account',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list accounts with active filter', async () => {
      const mockAccounts = [mockData.account()];
      const response = createPaginatedResponse(mockAccounts);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      await endpoint.list({
        active: true,
        page: 1,
        page_size: 25,
      });

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/account',
        query: {
          active: true,
          page: 1,
          page_size: 25,
        },
      });
    });
  });

  describe('get', () => {
    it('should get account by ID', async () => {
      const mockAccount = mockData.account();
      vi.mocked(client.cachedRequest).mockResolvedValue({ data: mockAccount, cached: false });

      const result = await endpoint.get(1);

      expect(client.cachedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/account/1',
      });
      expect(result).toEqual(mockAccount);
    });
  });

  describe('getDefault', () => {
    it('should return the default account', async () => {
      const defaultAccount = { ...mockData.account(), is_default: true };
      const otherAccount = { ...mockData.account(), id: 2, is_default: false };
      const response = createPaginatedResponse([otherAccount, defaultAccount]);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.getDefault();

      expect(result).toEqual(defaultAccount);
    });

    it('should return first account when no default is set', async () => {
      const account1 = { ...mockData.account(), id: 1, is_default: false };
      const account2 = { ...mockData.account(), id: 2, is_default: false };
      const response = createPaginatedResponse([account1, account2]);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.getDefault();

      expect(result).toEqual(account1);
    });

    it('should throw error when no accounts exist', async () => {
      const response = createPaginatedResponse([]);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      await expect(endpoint.getDefault()).rejects.toThrow('No payment accounts found');
    });
  });
});
