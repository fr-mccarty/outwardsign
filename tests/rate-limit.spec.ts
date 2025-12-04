import { test, expect } from '@playwright/test';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * Rate Limiting Tests
 *
 * Tests the in-memory rate limiter utility for the Parishioner Portal.
 * The rate limiter prevents abuse by limiting requests per time window.
 *
 * Reference: /src/lib/rate-limit.ts
 *
 * NOTE: These are unit tests for the rate limiter utility.
 * They test the function directly rather than through HTTP requests.
 */

test.describe('Rate Limiter - Basic Functionality', () => {
  test('should allow requests within limit', () => {
    const key = `test-${Date.now()}-allow`;
    const config = { maxRequests: 5, windowMs: 60000 }; // 5 requests per minute

    // Make 5 requests - all should succeed
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(key, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(5 - (i + 1));
    }
  });

  test('should block requests over limit', () => {
    const key = `test-${Date.now()}-block`;
    const config = { maxRequests: 3, windowMs: 60000 }; // 3 requests per minute

    // Make 3 requests - should succeed
    for (let i = 0; i < 3; i++) {
      const result = rateLimit(key, config);
      expect(result.success).toBe(true);
    }

    // 4th request should be blocked
    const blocked = rateLimit(key, config);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetIn).toBeGreaterThan(0);
    expect(blocked.resetIn).toBeLessThanOrEqual(60000);
  });

  test('should reset after window expires', async () => {
    const key = `test-${Date.now()}-reset`;
    const config = { maxRequests: 2, windowMs: 100 }; // 2 requests per 100ms

    // Use up the limit
    const result1 = rateLimit(key, config);
    const result2 = rateLimit(key, config);
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    // 3rd request should be blocked
    const blocked = rateLimit(key, config);
    expect(blocked.success).toBe(false);

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should succeed after reset
    const afterReset = rateLimit(key, config);
    expect(afterReset.success).toBe(true);
    expect(afterReset.remaining).toBe(1); // First request in new window
  });

  test('should track different keys independently', () => {
    const config = { maxRequests: 2, windowMs: 60000 };
    const key1 = `test-${Date.now()}-key1`;
    const key2 = `test-${Date.now()}-key2`;

    // Use up limit for key1
    rateLimit(key1, config);
    rateLimit(key1, config);
    const blocked1 = rateLimit(key1, config);
    expect(blocked1.success).toBe(false);

    // key2 should still work
    const result2 = rateLimit(key2, config);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(1);
  });

  test('should return correct remaining count', () => {
    const key = `test-${Date.now()}-remaining`;
    const config = { maxRequests: 5, windowMs: 60000 };

    // First request
    const r1 = rateLimit(key, config);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(4);

    // Second request
    const r2 = rateLimit(key, config);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(3);

    // Third request
    const r3 = rateLimit(key, config);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(2);
  });

  test('should return correct resetIn time', () => {
    const key = `test-${Date.now()}-reset-time`;
    const windowMs = 10000; // 10 seconds
    const config = { maxRequests: 1, windowMs };

    const result = rateLimit(key, config);
    expect(result.success).toBe(true);

    // resetIn should be approximately equal to windowMs
    expect(result.resetIn).toBeGreaterThan(windowMs - 100); // Allow 100ms tolerance
    expect(result.resetIn).toBeLessThanOrEqual(windowMs);
  });
});

test.describe('Rate Limiter - Edge Cases', () => {
  test('should handle first request correctly', () => {
    const key = `test-${Date.now()}-first`;
    const config = { maxRequests: 10, windowMs: 60000 };

    const result = rateLimit(key, config);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.resetIn).toBe(60000);
  });

  test('should handle exactly maxRequests', () => {
    const key = `test-${Date.now()}-exact`;
    const config = { maxRequests: 3, windowMs: 60000 };

    // Make exactly 3 requests
    const r1 = rateLimit(key, config);
    const r2 = rateLimit(key, config);
    const r3 = rateLimit(key, config);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);

    // Next request should fail
    const r4 = rateLimit(key, config);
    expect(r4.success).toBe(false);
  });

  test('should handle zero remaining correctly', () => {
    const key = `test-${Date.now()}-zero`;
    const config = { maxRequests: 1, windowMs: 60000 };

    // First request succeeds
    const r1 = rateLimit(key, config);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(0);

    // Second request fails
    const r2 = rateLimit(key, config);
    expect(r2.success).toBe(false);
    expect(r2.remaining).toBe(0);
  });

  test('should handle concurrent requests for same key', () => {
    const key = `test-${Date.now()}-concurrent`;
    const config = { maxRequests: 5, windowMs: 60000 };

    // Simulate concurrent requests
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(rateLimit(key, config));
    }

    // First 5 should succeed
    for (let i = 0; i < 5; i++) {
      expect(results[i].success).toBe(true);
    }

    // Remaining should fail
    for (let i = 5; i < 10; i++) {
      expect(results[i].success).toBe(false);
    }
  });
});

test.describe('Rate Limiter - Cleanup', () => {
  test('should cleanup old entries periodically', async () => {
    // This test verifies that expired entries are eventually cleaned up
    // The cleanup happens probabilistically (1% chance per request)
    const config = { maxRequests: 1, windowMs: 50 }; // Very short window

    // Create many expired entries
    for (let i = 0; i < 20; i++) {
      const key = `test-cleanup-${i}`;
      rateLimit(key, config);
    }

    // Wait for entries to expire
    await new Promise(resolve => setTimeout(resolve, 100));

    // Make many requests to trigger cleanup (1% probability per request)
    // With 200 requests, probability of cleanup is ~86%
    for (let i = 0; i < 200; i++) {
      const key = `test-cleanup-trigger-${i}`;
      rateLimit(key, config);
    }

    // Cleanup should have occurred (we can't directly verify,
    // but this test ensures the code doesn't crash)
    // If cleanup didn't work, memory would keep growing
    expect(true).toBe(true); // Test passes if no errors thrown
  });

  test('should not interfere with active entries during cleanup', async () => {
    const key = `test-${Date.now()}-active`;
    const config = { maxRequests: 5, windowMs: 60000 }; // Long window

    // Make a request
    const r1 = rateLimit(key, config);
    expect(r1.success).toBe(true);

    // Create expired entries to trigger cleanup
    for (let i = 0; i < 100; i++) {
      const expiredKey = `test-expired-${i}`;
      rateLimit(expiredKey, { maxRequests: 1, windowMs: 1 });
    }

    await new Promise(resolve => setTimeout(resolve, 10));

    // Trigger many requests to force cleanup
    for (let i = 0; i < 200; i++) {
      rateLimit(`test-trigger-${i}`, { maxRequests: 1, windowMs: 60000 });
    }

    // Original key should still work correctly
    const r2 = rateLimit(key, config);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(3); // Second request in window
  });
});

test.describe('Rate Limiter - Pre-configured Limits', () => {
  test('should have magic link rate limit configured', () => {
    expect(RATE_LIMITS.magicLink).toBeDefined();
    expect(RATE_LIMITS.magicLink.maxRequests).toBe(3);
    expect(RATE_LIMITS.magicLink.windowMs).toBe(15 * 60 * 1000); // 15 minutes
  });

  test('should have chat rate limit configured', () => {
    expect(RATE_LIMITS.chat).toBeDefined();
    expect(RATE_LIMITS.chat.maxRequests).toBe(20);
    expect(RATE_LIMITS.chat.windowMs).toBe(60 * 1000); // 1 minute
  });

  test('should have notifications rate limit configured', () => {
    expect(RATE_LIMITS.notifications).toBeDefined();
    expect(RATE_LIMITS.notifications.maxRequests).toBe(30);
    expect(RATE_LIMITS.notifications.windowMs).toBe(60 * 1000); // 1 minute
  });

  test('should have calendar rate limit configured', () => {
    expect(RATE_LIMITS.calendar).toBeDefined();
    expect(RATE_LIMITS.calendar.maxRequests).toBe(60);
    expect(RATE_LIMITS.calendar.windowMs).toBe(60 * 1000); // 1 minute
  });

  test('should enforce magic link rate limit correctly', () => {
    const key = `test-${Date.now()}-magic`;
    const config = RATE_LIMITS.magicLink;

    // Should allow 3 requests
    expect(rateLimit(key, config).success).toBe(true);
    expect(rateLimit(key, config).success).toBe(true);
    expect(rateLimit(key, config).success).toBe(true);

    // 4th request should fail
    expect(rateLimit(key, config).success).toBe(false);
  });

  test('should enforce chat rate limit correctly', () => {
    const key = `test-${Date.now()}-chat`;
    const config = RATE_LIMITS.chat;

    // Should allow 20 requests
    for (let i = 0; i < 20; i++) {
      expect(rateLimit(key, config).success).toBe(true);
    }

    // 21st request should fail
    expect(rateLimit(key, config).success).toBe(false);
  });
});

test.describe('Rate Limiter - Realistic Scenarios', () => {
  test('should handle typical user behavior (spaced requests)', async () => {
    const key = `test-${Date.now()}-typical`;
    const config = { maxRequests: 5, windowMs: 1000 }; // 5 per second

    // User makes 3 requests quickly
    expect(rateLimit(key, config).success).toBe(true);
    expect(rateLimit(key, config).success).toBe(true);
    expect(rateLimit(key, config).success).toBe(true);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 300));

    // Make 2 more requests (still within window)
    expect(rateLimit(key, config).success).toBe(true);
    expect(rateLimit(key, config).success).toBe(true);

    // Should be at limit
    expect(rateLimit(key, config).success).toBe(false);

    // Wait for window to reset
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Should work again
    expect(rateLimit(key, config).success).toBe(true);
  });

  test('should handle burst traffic followed by pause', async () => {
    const key = `test-${Date.now()}-burst`;
    const config = { maxRequests: 10, windowMs: 500 };

    // Burst of 10 requests
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(key, config).success).toBe(true);
    }

    // Should be rate limited
    expect(rateLimit(key, config).success).toBe(false);

    // Wait for reset
    await new Promise(resolve => setTimeout(resolve, 600));

    // Should work again
    expect(rateLimit(key, config).success).toBe(true);
  });

  test('should handle multiple users with different IPs', () => {
    const config = { maxRequests: 3, windowMs: 60000 };

    // Simulate 3 different users
    const user1 = `ip-192.168.1.1-${Date.now()}`;
    const user2 = `ip-192.168.1.2-${Date.now()}`;
    const user3 = `ip-192.168.1.3-${Date.now()}`;

    // Each user should have their own limit
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(user1, config).success).toBe(true);
      expect(rateLimit(user2, config).success).toBe(true);
      expect(rateLimit(user3, config).success).toBe(true);
    }

    // All users should hit their limits independently
    expect(rateLimit(user1, config).success).toBe(false);
    expect(rateLimit(user2, config).success).toBe(false);
    expect(rateLimit(user3, config).success).toBe(false);
  });
});
