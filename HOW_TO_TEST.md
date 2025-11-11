# How to Test This Application

A simple guide to testing Outward Sign with Playwright.

## Quick Start

**Run all tests:**
```bash
npm test
```

That's it! The command automatically:
- Creates a temporary test user and parish
- Runs all tests with authentication
- Cleans up test data when done

## Other Test Commands

**See tests run in the browser:**
```bash
npm run test:headed
```

**Debug tests with Playwright UI:**
```bash
npm run test:ui
```

**Run a specific test file:**
```bash
npm test events.spec.ts
```

**Run tests matching a pattern:**
```bash
npm test -- --grep "should create"
```

## How Testing Works

### The Test Flow

1. **Setup** - `npm test` generates unique credentials (email, password, parish name)
2. **Create User** - Script creates a test user and parish in Supabase
3. **Authenticate** - Playwright logs in and saves the session
4. **Run Tests** - Your tests run with the authenticated session
5. **Cleanup** - All test data is automatically deleted

### Key Points

- **Tests are pre-authenticated** - You don't need to log in manually in your tests
- **Fresh environment every run** - Each test run gets unique credentials
- **Automatic cleanup** - No leftover data between test runs
- **Never use `npx playwright test` directly** - Always use `npm test`

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Module', () => {
  test('should do something', async ({ page }) => {
    // Tests are already authenticated!

    // 1. Navigate to your page
    await page.goto('/my-module');

    // 2. Interact with the page
    await page.click('button[type="submit"]');

    // 3. Verify the result
    await expect(page).toHaveURL('/expected-path');
  });
});
```

### Common Patterns

**Navigate to a page:**
```typescript
await page.goto('/events');
```

**Fill in a form field:**
```typescript
await page.fill('input#name', 'Test Event');
await page.fill('textarea#description', 'Test description');
```

**Select from dropdown:**
```typescript
await page.locator('#event_type').click();
await page.getByRole('option', { name: 'Meeting' }).click();
```

**Click a button:**
```typescript
await page.click('button[type="submit"]');
```

**Wait for navigation:**
```typescript
await page.waitForURL('/events', { timeout: 5000 });
```

**Check if element exists:**
```typescript
await expect(page.locator('text=Success')).toBeVisible();
```

**Check current URL:**
```typescript
await expect(page).toHaveURL('/events/create');
```

## Common Issues & Solutions

### Issue: Tests time out

**Cause:** Page or element takes too long to load

**Solution:**
```typescript
// Increase timeout for specific action
await page.waitForURL('/events', { timeout: 10000 }); // 10 seconds

// Or wait for element before interacting
await page.waitForSelector('button[type="submit"]');
await page.click('button[type="submit"]');
```

### Issue: Element not found

**Cause:** Element hasn't loaded yet or selector is wrong

**Solution:**
```typescript
// Wait for element to be visible
await page.waitForSelector('text=My Element', { timeout: 5000 });

// Check if page is actually loaded
await expect(page.getByRole('heading', { name: 'Page Title' })).toBeVisible();

// Try different selectors
await page.locator('#element-id');           // By ID
await page.locator('button[type="submit"]'); // By attribute
await page.getByRole('button', { name: 'Submit' }); // By role
await page.locator('text=Exact Text');       // By text
```

### Issue: Form submission doesn't work

**Cause:** Button might be out of view or form validation failing

**Solution:**
```typescript
// Scroll button into view first
const submitButton = page.locator('button[type="submit"]').last();
await submitButton.scrollIntoViewIfNeeded();
await submitButton.click();

// Or scroll page to bottom
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
```

### Issue: Tests pass locally but fail in CI

**Cause:** Timing differences or environment issues

**Solution:**
- Use explicit waits: `await page.waitForSelector()`
- Increase timeouts for CI: configured in `playwright.config.ts`
- Check that `.env.local` values are available as environment variables in CI

### Issue: "TEST_USER_EMAIL must be set" error

**Cause:** Running Playwright directly instead of through npm test

**Solution:**
Always use `npm test` (not `npx playwright test`)

### Issue: Database changes not reflected in tests

**Cause:** Tests might be using cached data or old migrations

**Solution:**
1. Reset your database via Supabase Dashboard
2. Run migrations: `supabase db push`
3. Run tests again: `npm test`

### Issue: Test creates data but doesn't clean up

**Cause:** Test was interrupted (Ctrl+C) before cleanup

**Solution:**
Cleanup happens automatically, but if interrupted:
1. Reset database via Supabase Dashboard
2. Run migrations: `supabase db push`

## Test File Organization

```
tests/
├── auth.setup.ts          # Authentication setup (don't modify)
├── TEST_TEMPLATE.spec.ts  # Copy this to create new tests
├── events.spec.ts         # Example: events tests
├── presentation.spec.ts   # Example: presentation tests
└── utils/
    └── test-config.ts     # Shared test constants
```

## Environment Setup

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key is required for test setup/cleanup.

## Best Practices

1. **Start simple** - Test basic create/read flows first
2. **One test = one thing** - Each test should verify a single behavior
3. **Independent tests** - Don't rely on data from previous tests
4. **Use meaningful names** - `test('should create event', ...)` not `test('test 1', ...)`
5. **Wait explicitly** - Use `waitForURL()` and `waitForSelector()` instead of arbitrary delays
6. **Check the test template** - Copy `tests/TEST_TEMPLATE.spec.ts` for examples

## Debugging Tests

### View test output
```bash
npm run test:headed
```
This shows the browser while tests run.

### Use Playwright Inspector
```bash
npm run test:ui
```
This opens a UI where you can:
- Step through tests line by line
- See what Playwright sees
- Try selectors in real-time

### Add console logs
```typescript
console.log('Current URL:', page.url());
console.log('Element exists:', await page.locator('button').count());
```

### Take screenshots
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

## Getting Help

1. **Check test examples** - Look at `tests/events.spec.ts` for working patterns
2. **Review test template** - `tests/TEST_TEMPLATE.spec.ts` has common patterns
3. **Playwright docs** - https://playwright.dev/docs/intro
4. **Run with UI** - Use `npm run test:ui` to see what's happening

## Quick Reference

| Task | Command |
|------|---------|
| Run all tests | `npm test` |
| Run with browser visible | `npm run test:headed` |
| Debug with UI | `npm run test:ui` |
| Run specific file | `npm test events.spec.ts` |
| Run specific test | `npm test -- --grep "create event"` |
| View test report | `npx playwright show-report` |

---

**Remember:** Always use `npm test` (not `npx playwright test`) to ensure proper setup and cleanup!
