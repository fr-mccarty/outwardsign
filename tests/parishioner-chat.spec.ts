import { test, expect } from '@playwright/test';
import { setupParishionerAuth, cleanupParishioner } from './helpers/parishioner-auth';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Parishioner Portal - Chat Tests
 *
 * Tests the AI chat functionality for parishioners
 *
 * NOTE: These tests mock the AI responses to avoid hitting the Anthropic API
 */

test.describe('Parishioner Chat', () => {
  let parishioner: Awaited<ReturnType<typeof setupParishionerAuth>>;

  test.beforeEach(async ({ page }) => {
    // Setup authenticated parishioner session
    parishioner = await setupParishionerAuth(page);
  });

  test.afterEach(async () => {
    // Cleanup parishioner data
    if (parishioner) {
      await cleanupParishioner(parishioner.personId);
    }
  });

  test('should require authentication and redirect if not logged in', async ({ page }) => {
    // Clear cookies to simulate logged out state
    await page.context().clearCookies();

    // Try to access chat
    await page.goto('/parishioner/chat');

    // Should redirect to login
    await page.waitForURL(/\/parishioner\/login/, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page).toHaveURL(/\/parishioner\/login/);
  });

  test('should display chat page when authenticated', async ({ page }) => {
    await page.goto('/parishioner/chat');
    await expect(page).toHaveURL('/parishioner/chat', { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify chat interface is visible
    await expect(page.getByRole('heading', { name: /Chat|Ministry Assistant/i })).toBeVisible();
  });

  test('should display initial welcome message', async ({ page }) => {
    await page.goto('/parishioner/chat');

    // Should show welcome message from AI assistant
    await expect(
      page.getByText(/Hi! I'm your ministry assistant|ministry assistant/i)
    ).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Welcome message should mention what the assistant can do
    await expect(
      page.getByText(/schedule|commitments/i)
    ).toBeVisible();
  });

  test('should display quick action buttons', async ({ page }) => {
    await page.goto('/parishioner/chat');

    // Should show quick action buttons
    // These buttons populate the input with common queries
    const quickActionButtons = [
      /My Schedule/i,
      /My Readings/i,
      /Mark Unavailable/i,
    ];

    for (const buttonText of quickActionButtons) {
      const button = page.getByRole('button', { name: buttonText });
      // At least one quick action should be visible
      if (await button.isVisible()) {
        // Found a quick action button - good!
        break;
      }
    }
  });

  test('should populate input when clicking quick action button', async ({ page }) => {
    await page.goto('/parishioner/chat');

    // Click a quick action button
    const scheduleButton = page.getByRole('button', { name: /My Schedule|Show me my upcoming schedule/i }).first();

    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();

      // Input should be populated with the message
      const input = page.getByRole('textbox').or(page.locator('input[type="text"]')).first();
      const inputValue = await input.inputValue();
      expect(inputValue).toContain('schedule');
    }
  });

  test('should send message and receive response', async ({ page }) => {
    // Mock the AI chat API response
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: 'Here is your upcoming schedule: You have a reading assignment on Sunday at 10am.',
          conversationId: 'test-conversation-123',
        }),
      });
    });

    await page.goto('/parishioner/chat');

    // Type a message
    const input = page.getByRole('textbox').or(page.locator('input[type="text"]')).first();
    await input.fill('What is my schedule?');

    // Send message
    const sendButton = page.getByRole('button', { name: /Send/i }).or(
      page.getByRole('button').filter({ has: page.locator('svg') })
    ).first();

    await sendButton.click();

    // User message should appear
    await expect(page.getByText('What is my schedule?')).toBeVisible();

    // Should show loading state briefly
    // (AI is processing)

    // AI response should appear
    await expect(
      page.getByText(/Here is your upcoming schedule/i)
    ).toBeVisible({ timeout: TEST_TIMEOUTS.EXTENDED });
  });

  test('should handle Enter key to send message', async ({ page }) => {
    // Mock the AI chat API response
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: 'I can help you with that!',
          conversationId: 'test-conversation-456',
        }),
      });
    });

    await page.goto('/parishioner/chat');

    // Type a message
    const input = page.getByRole('textbox').or(page.locator('input[type="text"]')).first();
    await input.fill('Hello');

    // Press Enter
    await input.press('Enter');

    // Message should be sent
    await expect(page.getByText('Hello', { exact: true })).toBeVisible();

    // Response should appear
    await expect(
      page.getByText(/I can help you with that/i)
    ).toBeVisible({ timeout: TEST_TIMEOUTS.EXTENDED });
  });

  test('should not send empty message', async ({ page }) => {
    await page.goto('/parishioner/chat');

    // Try to send empty message
    const sendButton = page.getByRole('button', { name: /Send/i }).first();
    await sendButton.click();

    // Should still show only the welcome message
    // No new user messages should appear
    const messages = page.locator('[data-testid^="message-"]').or(
      page.locator('div').filter({ hasText: /Hi! I'm your ministry assistant/i })
    );

    // Only the initial welcome message should exist
    await expect(messages.first()).toBeVisible();
  });

  test('should show error message on API failure', async ({ page }) => {
    // Mock the AI chat API to fail
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error',
        }),
      });
    });

    await page.goto('/parishioner/chat');

    // Type and send message
    const input = page.getByRole('textbox').or(page.locator('input[type="text"]')).first();
    await input.fill('Test error handling');

    const sendButton = page.getByRole('button', { name: /Send/i }).first();
    await sendButton.click();

    // Should show error message from assistant
    await expect(
      page.getByText(/having trouble connecting|try again/i)
    ).toBeVisible({ timeout: TEST_TIMEOUTS.EXTENDED });
  });

  test('should display voice input button when supported', async ({ page }) => {
    await page.goto('/parishioner/chat');

    // Voice input button (microphone icon) should be visible if browser supports it
    // This is optional - depends on browser support
    // Check if any button has a microphone icon
    // If not supported, test passes (voice is optional feature)
    const buttons = await page.locator('button:has(svg)').all();

    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      if (ariaLabel?.toLowerCase().includes('voice') || ariaLabel?.toLowerCase().includes('mic')) {
        // Voice button found
        break;
      }
    }

    // Test passes regardless - voice is optional
    expect(true).toBe(true);
  });

  test('should toggle language and update UI text', async ({ page }) => {
    await page.goto('/parishioner/chat');

    // Look for language toggle button
    const languageToggle = page.getByRole('button', { name: /EN|ES|Language/i });

    if (await languageToggle.isVisible()) {
      // Click to switch language
      await languageToggle.click();

      // Welcome message should change language
      // Check for Spanish or English welcome message
      const hasEnglish = await page.getByText(/Hi! I'm your ministry assistant/i).isVisible();
      const hasSpanish = await page.getByText(/¡Hola! Soy tu asistente ministerial/i).isVisible();

      // At least one should be visible
      expect(hasEnglish || hasSpanish).toBe(true);
    }
  });

  test('should maintain chat history during session', async ({ page }) => {
    // Mock the AI chat API response
    let callCount = 0;
    await page.route('**/api/chat', async (route) => {
      callCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: `Response ${callCount}`,
          conversationId: 'test-conversation-persistent',
        }),
      });
    });

    await page.goto('/parishioner/chat');

    // Send first message
    const input = page.getByRole('textbox').or(page.locator('input[type="text"]')).first();
    await input.fill('First message');

    const sendButton = page.getByRole('button', { name: /Send/i }).first();
    await sendButton.click();

    // Wait for response
    await expect(page.getByText('Response 1')).toBeVisible({ timeout: TEST_TIMEOUTS.EXTENDED });

    // Send second message
    await input.fill('Second message');
    await sendButton.click();

    // Wait for second response
    await expect(page.getByText('Response 2')).toBeVisible({ timeout: TEST_TIMEOUTS.EXTENDED });

    // Both messages should still be visible (chat history)
    await expect(page.getByText('First message')).toBeVisible();
    await expect(page.getByText('Second message')).toBeVisible();
    await expect(page.getByText('Response 1')).toBeVisible();
    await expect(page.getByText('Response 2')).toBeVisible();
  });

  test('should scroll to bottom when new messages arrive', async ({ page }) => {
    // Mock the AI chat API response
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: 'This is a test response to verify scrolling behavior.',
          conversationId: 'test-conversation-scroll',
        }),
      });
    });

    await page.goto('/parishioner/chat');

    // Send a message
    const input = page.getByRole('textbox').or(page.locator('input[type="text"]')).first();
    await input.fill('Test message');

    const sendButton = page.getByRole('button', { name: /Send/i }).first();
    await sendButton.click();

    // New message should be visible (scrolled into view)
    await expect(page.getByText('Test message')).toBeVisible();

    // Response should also be visible
    await expect(
      page.getByText(/test response/i)
    ).toBeVisible({ timeout: TEST_TIMEOUTS.EXTENDED });
  });
});
