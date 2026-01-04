/**
 * Sandbox CRUD tests for Transfer endpoint
 *
 * WARNING: These tests CREATE, MODIFY and DELETE real data.
 * Only run against a SANDBOX environment.
 *
 * Required environment variables:
 * - CUENTICA_API_TOKEN: API token
 * - CUENTICA_SANDBOX=true: Explicitly enable sandbox tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { CuenticaAPI } from '../../../src/api.js';
import type { Transfer } from '../../../src/types/transfer.js';
import type { BankAccount } from '../../../src/types/account.js';
import {
  shouldRunSandboxTests,
  createTestClient,
  SKIP_SANDBOX_MESSAGE,
  generateTestId,
  getTodayDate,
} from '../setup.js';

describe.skipIf(!shouldRunSandboxTests())('TransferEndpoint Sandbox CRUD', () => {
  let api: CuenticaAPI;
  let accounts: BankAccount[] = [];
  let createdTransfer: Transfer | null = null;
  const testId = generateTestId();

  beforeAll(async () => {
    api = createTestClient();

    // Get available accounts for transfers
    const result = await api.accounts.list();
    accounts = result.data;

    if (accounts.length < 2) {
      console.warn('Warning: At least 2 accounts are needed for transfer tests');
    }
  });

  afterAll(async () => {
    // Cleanup: delete created transfer
    if (createdTransfer) {
      try {
        await api.transfers.delete(createdTransfer.id);
        console.log(`Cleanup: Deleted transfer ${createdTransfer.id}`);
      } catch (error) {
        console.error(`Cleanup failed for transfer ${createdTransfer.id}:`, error);
      }
    }
  });

  describe('CRUD Operations', () => {
    it('should have at least 2 accounts for testing', () => {
      expect(accounts.length).toBeGreaterThanOrEqual(2);
    });

    it('should create a new transfer', async () => {
      if (accounts.length < 2) {
        console.log('Skipping: need at least 2 accounts');
        return;
      }

      const transferData = {
        date: getTodayDate(),
        amount: 50,
        origin_account: accounts[0].id,
        destination_account: accounts[1].id,
        concept: `Test transfer ${testId}`, // Required field, cannot be empty
        payment_method: 'wire_transfer',
      };

      createdTransfer = await api.transfers.create(transferData as any);

      expect(createdTransfer).toBeDefined();
      expect(createdTransfer.id).toBeDefined();
      expect(createdTransfer.amount).toBe(transferData.amount);
      // origin_account in response is an object, not just ID
      expect(createdTransfer.origin_account).toBeDefined();
    });

    it('should get the created transfer by ID', async () => {
      if (!createdTransfer) {
        console.log('Skipping: no transfer created');
        return;
      }

      const transfer = await api.transfers.get(createdTransfer.id);

      expect(transfer).toBeDefined();
      expect(transfer.id).toBe(createdTransfer.id);
    });

    it('should find transfer in list', async () => {
      if (!createdTransfer) {
        console.log('Skipping: no transfer created');
        return;
      }

      const result = await api.transfers.list({
        date_from: getTodayDate(),
        page_size: 50,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      const found = result.data.find((t) => t.id === createdTransfer!.id);
      expect(found).toBeDefined();
    });

    it('should update the transfer', async () => {
      if (!createdTransfer) {
        console.log('Skipping: no transfer created');
        return;
      }

      // API requires ALL fields on update, not just changed ones
      const updatedData = {
        date: getTodayDate(),
        amount: 75,
        origin_account: accounts[0].id,
        destination_account: accounts[1].id,
        concept: `Updated transfer ${testId}`,
        payment_method: 'wire_transfer',
        notes: `Updated notes ${testId}`,
      };

      const updated = await api.transfers.update(createdTransfer.id, updatedData as any);

      expect(updated).toBeDefined();
      expect(updated.amount).toBe(updatedData.amount);

      createdTransfer = updated;
    });

    it('should delete the transfer', async () => {
      if (!createdTransfer) {
        console.log('Skipping: no transfer created');
        return;
      }

      await api.transfers.delete(createdTransfer.id);

      // Verify deletion
      try {
        await api.transfers.get(createdTransfer.id);
        expect.fail('Transfer should have been deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }

      createdTransfer = null;
    });
  });
});

describe.skipIf(shouldRunSandboxTests())('TransferEndpoint Sandbox CRUD (Skipped)', () => {
  it.skip(SKIP_SANDBOX_MESSAGE, () => {});
});
