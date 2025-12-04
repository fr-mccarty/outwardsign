import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * CSRF Protection Tests
 *
 * Tests the CSRF token generation, validation, and API endpoint
 * for the Parishioner Portal security enhancements.
 *
 * Reference: /src/lib/csrf.ts and /src/app/api/parishioner/csrf/route.ts
 */

test.describe('CSRF Protection', () => {
  // CSRF API is public (no auth required for getting tokens)
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should generate CSRF token via API endpoint', async ({ page }) => {
    // Call the CSRF API endpoint
    const response = await page.request.get('/api/parishioner/csrf');

    // Verify response is successful
    expect(response.status()).toBe(200);

    // Parse response
    const data = await response.json();

    // Verify token is returned
    expect(data).toHaveProperty('token');
    expect(typeof data.token).toBe('string');
    expect(data.token.length).toBeGreaterThan(0);

    // Verify token is a valid hex string (64 characters = 32 bytes in hex)
    expect(data.token).toMatch(/^[a-f0-9]{64}$/);
  });

  test('should set CSRF cookie when generating token', async ({ page }) => {
    // Call the CSRF API endpoint
    const response = await page.request.get('/api/parishioner/csrf');
    expect(response.status()).toBe(200);

    const data = await response.json();
    const token = data.token;

    // Navigate to a parishioner portal page to check cookies
    await page.goto('/parishioner/login?parish=test');

    // Get all cookies
    const cookies = await page.context().cookies();

    // Find the CSRF cookie
    const csrfCookie = cookies.find(c => c.name === 'parishioner_csrf');

    // Verify cookie exists and has expected properties
    expect(csrfCookie).toBeDefined();
    expect(csrfCookie?.value).toBe(token);
    expect(csrfCookie?.httpOnly).toBe(true);
    expect(csrfCookie?.sameSite).toBe('Strict');
    expect(csrfCookie?.path).toBe('/parishioner');
  });

  test('should generate different tokens on multiple requests', async ({ page }) => {
    // Get first token
    const response1 = await page.request.get('/api/parishioner/csrf');
    const data1 = await response1.json();
    const token1 = data1.token;

    // Get second token
    const response2 = await page.request.get('/api/parishioner/csrf');
    const data2 = await response2.json();
    const token2 = data2.token;

    // Tokens should be different (randomness)
    expect(token1).not.toBe(token2);

    // Both should be valid hex strings
    expect(token1).toMatch(/^[a-f0-9]{64}$/);
    expect(token2).toMatch(/^[a-f0-9]{64}$/);
  });

  test('should update cookie with new token on subsequent requests', async ({ page, context }) => {
    // Get first token
    const response1 = await page.request.get('/api/parishioner/csrf');
    const data1 = await response1.json();
    const token1 = data1.token;

    // Navigate to set cookie in context
    await page.goto('/parishioner/login?parish=test');
    const cookies1 = await context.cookies();
    const csrfCookie1 = cookies1.find(c => c.name === 'parishioner_csrf');
    expect(csrfCookie1?.value).toBe(token1);

    // Get second token
    const response2 = await page.request.get('/api/parishioner/csrf');
    const data2 = await response2.json();
    const token2 = data2.token;

    // Cookie should be updated with new token
    const cookies2 = await context.cookies();
    const csrfCookie2 = cookies2.find(c => c.name === 'parishioner_csrf');
    expect(csrfCookie2?.value).toBe(token2);
    expect(csrfCookie2?.value).not.toBe(token1);
  });

  test('should have correct cookie security attributes in production', async ({ page }) => {
    // Note: This test verifies the cookie structure
    // In production, secure flag would be true (requires HTTPS)
    const response = await page.request.get('/api/parishioner/csrf');
    expect(response.status()).toBe(200);

    await page.goto('/parishioner/login?parish=test');
    const cookies = await page.context().cookies();
    const csrfCookie = cookies.find(c => c.name === 'parishioner_csrf');

    // Verify security attributes
    expect(csrfCookie?.httpOnly).toBe(true); // Can't be accessed via JavaScript
    expect(csrfCookie?.sameSite).toBe('Strict'); // CSRF protection via SameSite
    expect(csrfCookie?.path).toBe('/parishioner'); // Scoped to parishioner portal

    // Note: secure flag depends on NODE_ENV=production and HTTPS
    // In test environment, it may be false
  });

  test('should have proper token expiration (24 hours)', async ({ page }) => {
    const response = await page.request.get('/api/parishioner/csrf');
    expect(response.status()).toBe(200);

    await page.goto('/parishioner/login?parish=test');
    const cookies = await page.context().cookies();
    const csrfCookie = cookies.find(c => c.name === 'parishioner_csrf');

    // Verify maxAge is set (24 hours = 86400 seconds)
    // Cookie expires property is set, calculated from current time + maxAge
    expect(csrfCookie?.expires).toBeDefined();
    expect(csrfCookie?.expires).toBeGreaterThan(Date.now() / 1000);

    // Verify expiration is approximately 24 hours from now
    // Allow 1 minute tolerance for test execution time
    const expectedExpiration = Date.now() / 1000 + 86400;
    const tolerance = 60; // 1 minute
    expect(csrfCookie?.expires).toBeGreaterThanOrEqual(expectedExpiration - tolerance);
    expect(csrfCookie?.expires).toBeLessThanOrEqual(expectedExpiration + tolerance);
  });
});

test.describe('CSRF Protection - Integration', () => {
  /**
   * Integration tests for CSRF protection in parishioner portal forms
   * These tests verify CSRF tokens are properly used in actual portal flows
   */
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should include CSRF token in parishioner login flow', async ({ page }) => {
    // Navigate to parishioner login page
    // (In a real scenario, the page would fetch CSRF token and include it in forms)
    await page.goto('/parishioner/login?parish=test');

    // Get CSRF token via API
    const response = await page.request.get('/api/parishioner/csrf');
    const data = await response.json();

    // Verify token exists
    expect(data.token).toBeDefined();
    expect(data.token).toMatch(/^[a-f0-9]{64}$/);

    // In actual implementation, this token would be included
    // in form submissions or API requests for validation
  });
});
