# Testing Guide for Outward Sign

## 🎯 Quick Start

Your testing system is fully set up and working! Here's how to use it:

### Run Tests - Three Ways

1. **Playwright UI** (Best for debugging)
   ```bash
   # ONE-TIME SETUP (run this first, only needed once)
   npm run test:ui:setup

   # Then use Playwright UI anytime
   npm run test:ui
   ```
   - Interactive UI to select and run specific tests
   - See test code side-by-side with execution
   - Time-travel debugging
   - Watch mode for active development
   - Uses a persistent test user (not cleaned up automatically)

2. **Headed Mode** (Watch tests run)
   ```bash
   npm run test:headed
   ```
   - See browser window as tests execute
   - Great for understanding test flow
   - Automatically creates/cleans up test data

3. **Headless Mode** (Fastest)
   ```bash
   npm test
   ```
   - No browser window shown
   - Quickest way to run full test suite
   - Best for CI/CD pipelines

### Run Specific Tests

```bash
# Single test file
npm run test:headed tests/events.spec.ts

# Specific test by name
npm run test:headed -- --grep "should create a new event"

# Multiple test files
npm run test:headed tests/events.spec.ts tests/readings.spec.ts
```

## 📊 Current Test Coverage

### ✅ Modules with Tests

| Module | Test File | Tests | Status |
|--------|-----------|-------|--------|
| **Events** | `tests/events.spec.ts` | 7 tests | ✅ Working |
| **Readings** | `tests/readings.spec.ts` | 5 tests | ✅ Working |
| **Presentations** | `tests/presentation.spec.ts` | 3 tests | ⚠️ Mostly skipped |
| **Signup Flow** | `tests/signup.spec.ts` | 3 tests | ✅ Working |

**Total: 18 tests across 4 modules**

### 🎯 Modules That Need Tests

Priority modules (main sacrament/sacramental workflows):
- [ ] **Weddings** - High priority (core module)
- [ ] **Funerals** - High priority (core module)
- [ ] **Baptisms** - High priority (core module)
- [ ] **Quinceañeras** - High priority (core module)

Supporting modules:
- [ ] **People** (Directory)
- [ ] **Locations**
- [ ] **Calendar**
- [ ] **Groups**
- [ ] **Petitions**
- [ ] **Settings** (Parish, User)

## 🎭 Understanding the Test Setup

### Automatic Authentication

**IMPORTANT:** Tests are pre-authenticated automatically. You DO NOT need to handle authentication in your tests.

#### How it works:

1. When you run `npm test`, the system:
   - Generates unique credentials (e.g., `test-staff-1732894756321-45678@outwardsign.test`)
   - Creates a temporary test user and parish
   - Runs `auth.setup.ts` to authenticate and save session to `playwright/.auth/staff.json`
   - Your tests automatically use that authenticated session
   - After tests complete, all test data is automatically cleaned up

2. **Benefits:**
   - ✅ Fresh database state every test run
   - ✅ No leftover data from previous runs
   - ✅ Complete test isolation
   - ✅ No manual setup or cleanup required

### Test Projects in Playwright

When you open `npm run test:ui`, you'll see 3 projects:

1. **setup** - Authentication setup (runs automatically, you can ignore this)
2. **chromium** - Your authenticated tests (events, readings, presentations)
3. **chromium-unauth** - Signup tests (no authentication needed)

**In the Playwright UI:**
- Expand **"chromium"** to see your main test files
- Click any test file to see individual tests
- Click the play button to run tests
- The **setup** project will always show - that's normal, just ignore it

## 📝 Writing New Tests

### Step 1: Copy the Template

```bash
cp tests/TEST_TEMPLATE.spec.ts tests/your-module.spec.ts
```

### Step 2: Update Module Name

Replace "Module Name" with your actual module name (e.g., "Weddings", "Funerals").

### Step 3: Update Test Logic

Replace the placeholder selectors and assertions with your actual module's elements.

### Example: Creating a Wedding Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Weddings Module', () => {
  test('should create a wedding with bride and groom', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to weddings
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Click create button
    await page.getByRole('link', { name: /New Wedding/i }).first().click();
    await expect(page).toHaveURL('/weddings/create');

    // Fill in wedding details
    await page.fill('input#notes', 'Beautiful outdoor ceremony');

    // Select template (if needed)
    await page.locator('#wedding_template_id').click();
    await page.locator('[role="option"]:has-text("Full Script")').click();

    // Add bride (using PeoplePicker - simplified)
    // Note: You may need to create test people first or use inline creation

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for success
    await page.waitForSelector('text=/Wedding created successfully/i', { timeout: 5000 });

    // Should redirect to wedding detail page
    await page.waitForURL(/\/weddings\/[a-f0-9-]+$/, { timeout: 5000 });

    // Verify wedding details are displayed
    await expect(page.locator('text=Beautiful outdoor ceremony')).toBeVisible();
  });
});
```

## 🎯 Test Writing Patterns

### ✅ CORRECT Pattern - Start at Your Destination

```typescript
test('should do something', async ({ page }) => {
  // Test is pre-authenticated via playwright/.auth/staff.json

  // ✅ Just navigate directly to where you need to be
  await page.goto('/your-module');

  // Your test logic here...
});
```

### ❌ WRONG Pattern - Manual Authentication

```typescript
test('should do something', async ({ page }) => {
  // ❌ DO NOT DO THIS - Authentication is already handled!
  await page.goto('/signup');
  await page.fill('input[type="email"]', 'test@example.com');
  // ...
});
```

### Common Test Patterns

#### Creating Records

```typescript
await page.goto('/module/create');
await page.fill('input#field', 'value');
await page.click('button[type="submit"]');
await page.waitForSelector('text=/created successfully/i');
await page.waitForURL(/\/module\/[a-f0-9-]+$/);
```

#### Editing Records

```typescript
await page.goto(`/module/${recordId}/edit`);
await page.fill('input#field', 'updated value');
await page.click('button[type="submit"]');
await page.waitForSelector('text=/updated successfully/i');
```

#### Testing Dropdowns

```typescript
await page.locator('#dropdown_field').click();
await page.locator('[role="option"]:has-text("Option Text")').click();
```

#### Testing Empty States

```typescript
await page.goto('/module');
await expect(page.locator('text=/No records yet/i')).toBeVisible();
await expect(page.getByRole('link', { name: /Create/i })).toBeVisible();
```

#### Testing Form Validation

```typescript
await page.goto('/module/create');
await page.click('button[type="submit"]'); // Submit empty form
await expect(page).toHaveURL('/module/create'); // Should stay on page
```

#### Testing Breadcrumbs

```typescript
const breadcrumbNav = page.getByLabel('breadcrumb');
await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
await breadcrumbNav.getByRole('link', { name: 'Module' }).click();
await expect(page).toHaveURL('/module');
```

## 🔍 Debugging Tests

### Using Playwright UI

```bash
npm run test:ui
```

1. Select a test from the sidebar
2. Click the play button to run
3. Use the timeline at the top to step through actions
4. Inspect DOM state at each step
5. See console logs and network requests

### Using Playwright Inspector

```bash
# Run with debug flag
npx playwright test --debug tests/events.spec.ts
```

This opens the Playwright Inspector where you can:
- Step through test actions one by one
- Inspect page state at each step
- Modify and re-run test code
- See all locators and assertions

### Using Trace Viewer

```bash
# Run test and generate trace
npx playwright test --trace on tests/events.spec.ts

# Open trace viewer
npx playwright show-trace trace.zip
```

## 🐛 Common Issues

### Test Timeout Errors

**Problem:** Test fails with "Test timeout of 30000ms exceeded"

**Solutions:**
1. Increase timeout for specific operation:
   ```typescript
   await page.waitForSelector('text=/Success/i', { timeout: 10000 });
   ```

2. Check if element selector is correct:
   ```typescript
   // Debug: See what elements are on page
   console.log(await page.content());
   ```

3. Wait for page to be fully loaded:
   ```typescript
   await page.goto('/path', { waitUntil: 'networkidle' });
   ```

### Element Not Found

**Problem:** `Error: locator.click: Target closed` or element not visible

**Solutions:**
1. Wait for element to be visible:
   ```typescript
   await page.waitForSelector('#element', { state: 'visible' });
   ```

2. Use more specific selectors:
   ```typescript
   // Instead of: page.locator('button')
   // Use:
   page.getByRole('button', { name: 'Submit' })
   ```

3. Check if element is in a modal or different part of page:
   ```typescript
   await page.locator('[role="dialog"]').getByText('Text').click();
   ```

### Test User Already Exists

**Problem:** Test fails because user already exists

**Solution:** This should never happen with the automatic cleanup, but if it does:
1. The cleanup runs automatically after tests
2. If interrupted (Ctrl+C), run tests again - cleanup will retry
3. Check Supabase dashboard and manually delete test users if needed

## 📚 References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)

## 🎯 Next Steps

1. **Run existing tests** to see them working:
   ```bash
   npm run test:headed
   ```

2. **Explore Playwright UI**:
   ```bash
   npm run test:ui
   ```

3. **Write tests for a new module**:
   - Copy `tests/TEST_TEMPLATE.spec.ts`
   - Update for your module (weddings, funerals, baptisms, etc.)
   - Run your new tests

4. **Add to CI/CD** (future):
   - Tests run automatically on pull requests
   - Catches regressions before deployment

## 💡 Tips

- **Write tests as you build features** - Easier than writing them later
- **Test the happy path first** - Basic create/read/update flows
- **Add edge cases gradually** - Validation, error handling, empty states
- **Use descriptive test names** - "should create wedding with bride and groom"
- **Keep tests independent** - Each test should work on its own
- **Use the Playwright UI** - It's an excellent debugging tool
- **Reference existing tests** - events.spec.ts and readings.spec.ts are good examples
