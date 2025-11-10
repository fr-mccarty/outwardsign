# Testing Quick Reference

## 🚀 Run Tests

```bash
# ONE-TIME SETUP FOR UI MODE (run this first!)
npm run test:ui:setup

# Interactive UI (best for debugging)
npm run test:ui

# Watch tests run in browser
npm run test:headed

# Run all tests (fast, no UI)
npm test

# Run specific test file
npm run test:headed tests/events.spec.ts

# Run specific test by name
npm run test:headed -- --grep "should create"
```

## 📁 Current Test Files

| File | Location | Tests | Status |
|------|----------|-------|--------|
| Events | `tests/events.spec.ts` | 7 | ✅ |
| Readings | `tests/readings.spec.ts` | 5 | ✅ |
| Presentations | `tests/presentation.spec.ts` | 3 | ⚠️ |
| Signup | `tests/signup.spec.ts` | 3 | ✅ |
| **Template** | `tests/TEST_TEMPLATE.spec.ts` | - | 📋 Copy to create new tests |

## 🎯 Playwright UI Navigation

When you run `npm run test:ui`:

1. **Left Sidebar** → Expand **"chromium"** project
2. **Test Files** → Click to see individual tests
3. **Play Button** → Run selected tests
4. **Timeline** → Step through test execution
5. **Inspector** → View DOM and state

**Ignore the "setup" project** - it's for authentication and runs automatically.

## ✍️ Create New Test File

```bash
# 1. Copy template
cp tests/TEST_TEMPLATE.spec.ts tests/weddings.spec.ts

# 2. Edit the file
# 3. Run your new test
npm run test:headed tests/weddings.spec.ts
```

## 🎭 Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Module Name', () => {
  test('should do something', async ({ page }) => {
    // IMPORTANT: Tests are pre-authenticated!
    // No need to login or signup

    // 1. Navigate
    await page.goto('/your-module');

    // 2. Interact
    await page.fill('input#field', 'value');
    await page.click('button[type="submit"]');

    // 3. Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

## 🔍 Common Selectors

```typescript
// By role (preferred)
page.getByRole('button', { name: 'Submit' })
page.getByRole('link', { name: /New Record/i })

// By ID
page.locator('#field_name')

// By text
page.locator('text=Exact text')
page.locator('text=/regex pattern/i')

// By test ID
page.locator('[data-testid="my-element"]')

// First match
page.locator('button').first()

// Within a section
page.locator('[role="dialog"]').getByText('Text')
```

## 🎯 Common Actions

```typescript
// Fill input
await page.fill('input#email', 'test@example.com')

// Click button
await page.click('button[type="submit"]')

// Select dropdown
await page.locator('#dropdown').click()
await page.locator('[role="option"]:has-text("Option")').click()

// Wait for navigation
await page.waitForURL('/expected-path')

// Wait for element
await page.waitForSelector('text=/Success/i', { timeout: 5000 })
```

## ✅ Common Assertions

```typescript
// URL assertions
await expect(page).toHaveURL('/path')
await expect(page).toHaveURL(/\/regex\//)

// Element assertions
await expect(element).toBeVisible()
await expect(element).toBeHidden()
await expect(element).toHaveText('Expected text')
await expect(element).toContainText('partial')

// Count assertions
await expect(page.locator('.item')).toHaveCount(5)
```

## 🐛 Debug Tests

```bash
# Open Playwright UI
npm run test:ui

# Run with inspector (step through)
npx playwright test --debug tests/events.spec.ts

# Run in headed mode (see browser)
npm run test:headed tests/events.spec.ts

# Generate trace
npx playwright test --trace on tests/events.spec.ts
npx playwright show-trace trace.zip
```

## 📚 Documentation Files

- 📖 **TESTING_GUIDE.md** - Complete testing guide
- 📋 **TEST_TEMPLATE.spec.ts** - Template for new tests
- ⚡ **QUICK_REFERENCE.md** - This file

## 🎓 Key Concepts

1. **Tests are pre-authenticated** - No need to handle login
2. **Each test run is isolated** - Fresh user and parish created automatically
3. **Automatic cleanup** - All test data removed after tests complete
4. **Three test modes**:
   - UI mode (`test:ui`) - Interactive debugging
   - Headed mode (`test:headed`) - Watch tests run
   - Headless mode (`test`) - Fast execution

## 💡 Best Practices

✅ **DO:**
- Start tests by navigating to your module (`await page.goto('/module')`)
- Use descriptive test names ("should create wedding with bride and groom")
- Wait for elements before interacting (`waitForSelector`)
- Use role-based selectors (`getByRole`)
- Test the happy path first

❌ **DON'T:**
- Don't create authentication functions (already handled)
- Don't navigate to /signup or /login (except in signup.spec.ts)
- Don't rely on data from previous tests
- Don't use overly generic selectors (`page.locator('button')`)

## 🎯 Next Steps

1. **Explore existing tests**:
   ```bash
   npm run test:ui
   ```

2. **Watch tests run**:
   ```bash
   npm run test:headed
   ```

3. **Create your first test**:
   ```bash
   cp tests/TEST_TEMPLATE.spec.ts tests/weddings.spec.ts
   ```

4. **Run your new test**:
   ```bash
   npm run test:headed tests/weddings.spec.ts
   ```

## 🆘 Help

- **Full Guide**: `tests/TESTING_GUIDE.md`
- **Template**: `tests/TEST_TEMPLATE.spec.ts`
- **Examples**: `tests/events.spec.ts`, `tests/readings.spec.ts`
- **Playwright Docs**: https://playwright.dev
