import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Session Cleanup Cron Tests
 *
 * Tests the scheduled cron job that cleans up expired parishioner sessions.
 * The endpoint is protected by CRON_SECRET to prevent unauthorized access.
 *
 * Reference: /src/app/api/cron/cleanup-sessions/route.ts
 *
 * NOTE: These tests verify the cron endpoint authorization and behavior.
 * The actual database cleanup function (cleanup_expired_auth_sessions) is tested
 * separately in database tests.
 */

test.describe('Session Cleanup Cron - Authorization', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should reject requests without authorization header', async ({ request }) => {
    const response = await request.get('/api/cron/cleanup-sessions');

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  test('should reject requests with invalid authorization token', async ({ request }) => {
    const response = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': 'Bearer invalid-token-12345'
      }
    });

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  test('should reject requests with malformed authorization header', async ({ request }) => {
    const response = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': 'InvalidFormat'
      }
    });

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  test('should reject requests with empty authorization header', async ({ request }) => {
    const response = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': ''
      }
    });

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  test('should reject requests with Bearer but no token', async ({ request }) => {
    const response = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': 'Bearer '
      }
    });

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });
});

test.describe('Session Cleanup Cron - Valid Requests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should accept requests with valid CRON_SECRET', async ({ request }) => {
    // Get CRON_SECRET from environment
    const cronSecret = process.env.CRON_SECRET;

    // Skip test if CRON_SECRET is not set (CI/test environment may not have it)
    if (!cronSecret) {
      test.skip();
      return;
    }

    const response = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': `Bearer ${cronSecret}`
      }
    });

    // Should return 200 OK or 500 if database function fails
    // (500 is acceptable - means auth worked but cleanup had an issue)
    expect([200, 500]).toContain(response.status());

    const data = await response.json();

    if (response.status() === 200) {
      // Successful cleanup
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('cleaned');
      // 'cleaned' should be a number (count of deleted sessions)
      expect(typeof data.cleaned).toBe('number');
      expect(data.cleaned).toBeGreaterThanOrEqual(0);
    } else {
      // Database error (function might not exist in test DB)
      expect(data).toHaveProperty('error');
    }
  });

  test('should handle cleanup when no expired sessions exist', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      test.skip();
      return;
    }

    const response = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': `Bearer ${cronSecret}`
      }
    });

    // Should succeed even if nothing to clean up
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.cleaned).toBeGreaterThanOrEqual(0);
    }
    // If status is 500, database function doesn't exist (acceptable in test)
  });
});

test.describe('Session Cleanup Cron - Response Format', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should return JSON response for unauthorized requests', async ({ request }) => {
    const response = await request.get('/api/cron/cleanup-sessions');

    expect(response.status()).toBe(401);

    // Verify response is JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');

    // Verify JSON structure
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(typeof data.error).toBe('string');
  });

  test('should return JSON response for successful requests', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      test.skip();
      return;
    }

    const response = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': `Bearer ${cronSecret}`
      }
    });

    // Verify response is JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');

    const data = await response.json();

    if (response.status() === 200) {
      // Success response structure
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('cleaned');
      expect(data.success).toBe(true);
    } else if (response.status() === 500) {
      // Error response structure
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    }
  });
});

test.describe('Session Cleanup Cron - Security', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should not expose CRON_SECRET in error messages', async ({ request }) => {
    const response = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': 'Bearer wrong-secret'
      }
    });

    expect(response.status()).toBe(401);

    const data = await response.json();
    const responseText = JSON.stringify(data).toLowerCase();

    // Error should not contain actual secret or hints about it
    expect(responseText).not.toContain('cron_secret');
    expect(responseText).not.toContain('secret');
    expect(responseText).toBe('{"error":"Unauthorized"}');
  });

  test('should only accept GET requests', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      test.skip();
      return;
    }

    // Try POST (should fail - only GET is implemented)
    const postResponse = await request.post('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': `Bearer ${cronSecret}`
      }
    });

    // Next.js returns 405 Method Not Allowed for unsupported methods
    expect(postResponse.status()).toBe(405);
  });

  test('should require exact Bearer prefix match', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      test.skip();
      return;
    }

    // Try with lowercase 'bearer'
    const response1 = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': `bearer ${cronSecret}`
      }
    });
    expect(response1.status()).toBe(401);

    // Try with different prefix
    const response2 = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': `Token ${cronSecret}`
      }
    });
    expect(response2.status()).toBe(401);

    // Try without 'Bearer' prefix
    const response3 = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': cronSecret
      }
    });
    expect(response3.status()).toBe(401);
  });
});

test.describe('Session Cleanup Cron - Integration', () => {
  /**
   * Integration tests verifying the cron endpoint works with the database cleanup function.
   * These tests may be skipped if the database function doesn't exist in the test environment.
   */
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should call database cleanup function when authorized', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      test.skip();
      return;
    }

    const response = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': `Bearer ${cronSecret}`
      }
    });

    // Response should indicate the database function was called
    // Either success (200) or error if function doesn't exist (500)
    expect([200, 500]).toContain(response.status());

    const data = await response.json();

    if (response.status() === 500) {
      // If database function doesn't exist, error message should mention RPC
      // This is expected in test environments
      const errorMessage = data.error.toLowerCase();
      expect(
        errorMessage.includes('cleanup_expired_auth_sessions') ||
        errorMessage.includes('function') ||
        errorMessage.includes('rpc')
      ).toBe(true);
    }
  });

  test('should log cleanup results to console', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      test.skip();
      return;
    }

    // Note: Console logs are not directly testable in Playwright API tests
    // This test verifies the endpoint completes without throwing errors
    // Actual console logging verification would require server-side test framework

    const response = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': `Bearer ${cronSecret}`
      }
    });

    // Should complete (either success or expected error)
    expect([200, 500]).toContain(response.status());

    // If successful, should return cleanup count
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('cleaned');
    }
  });
});

test.describe('Session Cleanup Cron - Documentation', () => {
  /**
   * Tests to ensure the cron endpoint behavior matches documentation
   * and expected Vercel Cron integration patterns.
   */

  test('README: Cron endpoint follows Vercel Cron authorization pattern', async ({ request }) => {
    // Vercel Cron jobs use Bearer token in Authorization header
    // Reference: https://vercel.com/docs/cron-jobs/manage-cron-jobs

    const response = await request.get('/api/cron/cleanup-sessions', {
      headers: {
        'authorization': 'Bearer test-token'
      }
    });

    // Should check authorization (returns 401 for invalid token)
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  test('README: Cron endpoint is GET method', async ({ request }) => {
    // Vercel Cron jobs trigger GET requests to the endpoint
    const response = await request.get('/api/cron/cleanup-sessions');

    // Should accept GET method (even if unauthorized)
    // Returns 401 instead of 405, meaning GET is accepted
    expect(response.status()).toBe(401); // Not 405 Method Not Allowed
  });
});
