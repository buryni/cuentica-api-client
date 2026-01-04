/**
 * Unit tests for Tag endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TagEndpoint } from '../../src/endpoints/tags.js';
import { createMockClient, createPaginatedResponse, mockData } from './mocks.js';

describe('TagEndpoint', () => {
  let client: ReturnType<typeof createMockClient>;
  let endpoint: TagEndpoint;

  beforeEach(() => {
    client = createMockClient();
    endpoint = new TagEndpoint(client);
  });

  describe('list', () => {
    it('should list tags without filters', async () => {
      const mockTags = [mockData.tag()];
      const response = createPaginatedResponse(mockTags);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.list();

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/tag',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list tags with pagination', async () => {
      const mockTags = [mockData.tag()];
      const response = createPaginatedResponse(mockTags);
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      await endpoint.list({
        page: 2,
        page_size: 50,
      });

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/tag',
        query: {
          page: 2,
          page_size: 50,
        },
      });
    });
  });

  describe('getAll', () => {
    it('should get all tags', async () => {
      const mockTags = [
        mockData.tag(),
        { ...mockData.tag(), id: 2, name: 'Tag 2' },
        { ...mockData.tag(), id: 3, name: 'Tag 3' },
      ];
      const response = createPaginatedResponse(mockTags, {
        totalItems: 3,
        totalPages: 1,
      });
      vi.mocked(client.paginatedRequest).mockResolvedValue(response);

      const result = await endpoint.getAll();

      expect(client.paginatedRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/tag',
        query: { page_size: 300 },
      });
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Test Tag');
      expect(result[1].name).toBe('Tag 2');
    });
  });
});
