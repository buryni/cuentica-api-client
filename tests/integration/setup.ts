/**
 * Integration test setup and utilities
 *
 * These tests require a valid CUENTICA_API_TOKEN environment variable
 * and optionally CUENTICA_API_URL for testing against a sandbox environment.
 *
 * IMPORTANT: CRUD tests (create/update/delete) only run in SANDBOX mode.
 * Set CUENTICA_SANDBOX=true to enable destructive tests.
 */

import { CuenticaAPI } from '../../src/api.js';

/**
 * Check if integration tests should run (read-only tests)
 */
export function shouldRunIntegrationTests(): boolean {
  return !!process.env.CUENTICA_API_TOKEN;
}

/**
 * Check if sandbox CRUD tests should run
 * Requires both CUENTICA_API_TOKEN and CUENTICA_SANDBOX=true
 */
export function shouldRunSandboxTests(): boolean {
  return (
    !!process.env.CUENTICA_API_TOKEN &&
    process.env.CUENTICA_SANDBOX === 'true'
  );
}

/**
 * Create API client for integration tests
 */
export function createTestClient(): CuenticaAPI {
  const token = process.env.CUENTICA_API_TOKEN;
  if (!token) {
    throw new Error('CUENTICA_API_TOKEN is required for integration tests');
  }

  return new CuenticaAPI({
    apiToken: token,
    apiUrl: process.env.CUENTICA_API_URL,
    debug: process.env.DEBUG === 'true',
  });
}

/**
 * Skip message for integration tests
 */
export const SKIP_MESSAGE = 'Skipping integration tests: CUENTICA_API_TOKEN not set';

/**
 * Skip message for sandbox CRUD tests
 */
export const SKIP_SANDBOX_MESSAGE = 'Skipping sandbox CRUD tests: Set CUENTICA_SANDBOX=true to enable';

/**
 * Generate a unique identifier for test data
 */
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate a random CIF for testing (format: B + 8 digits)
 */
export function generateTestCIF(): string {
  const digits = Math.floor(10000000 + Math.random() * 90000000);
  return `B${digits}`;
}

/**
 * Generate a random NIF for testing (format: 8 digits + letter)
 */
export function generateTestNIF(): string {
  const digits = Math.floor(10000000 + Math.random() * 90000000);
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const letter = letters[digits % 23];
  return `${digits}${letter}`;
}

/**
 * Wait for a specified amount of time (useful for rate limiting)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
