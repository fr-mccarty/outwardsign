# Testing Guide for Outward Sign

> **Purpose:** Comprehensive guide for writing and maintaining end-to-end tests using Playwright.
>
> **See Also:**
> - **[TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md)** - Quick setup and run commands
> - **[TESTING_ARCHITECTURE.md](./TESTING_ARCHITECTURE.md)** - Testability standards and component patterns

Comprehensive guide for writing and maintaining end-to-end tests using Playwright.

## Table of Contents

- [Quick Start](#quick-start)
- [Current Test Coverage](#current-test-coverage)
- [Understanding the Test Setup](#understanding-the-test-setup)
- [Writing New Tests](#writing-new-tests)
- [Test Writing Patterns](#test-writing-patterns)
- [Page Object Model](#page-object-model)
- [File Structure](#file-structure)
- [Debugging Tests](#debugging-tests)
- [Common Test Patterns](#common-test-patterns)
- [Command Reference](#command-reference)

---

## Quick Start

**See [TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md) for setup instructions and running tests.**

This guide assumes you've already completed the quick start and are ready to write new tests.

---

## Current Test Coverage

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

---

## Understanding the Test Setup

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

### Execution Flow

1. **Setup Phase** (runs once before all tests):
   ```
   auth.setup.ts
   └─> Logs in with TEST_USER_EMAIL/PASSWORD
   └─> Completes onboarding if needed (creates test parish)
   └─> Saves cookies/storage to playwright/.auth/staff.json
   ```

2. **Test Phase** (each test):
   ```
   your-test.spec.ts
   └─> Loads auth state from playwright/.auth/staff.json
   └─> Starts with user already logged in
   └─> Test runs immediately without login
   ```

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

---

## Writing New Tests

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

    // Add bride (using PeoplePicker)
    await page.getByTestId('bride-picker-trigger').click();
    await page.getByLabel('Search people').fill('Teresa');
    await page.getByTestId('person-option-123').click();

    // Submit the form
    await page.getByRole('button', { name: 'Create Wedding' }).click();

    // Wait for redirect to detail page
    await page.waitForURL(/\/weddings\/[a-f0-9-]+$/, { timeout: 5000 });

    // Verify wedding details are displayed
    await expect(page.locator('text=Beautiful outdoor ceremony')).toBeVisible();
  });
});
```

---

## Test Writing Patterns

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

### Tests That Don't Need Auth

Some tests (like signup flow) shouldn't use authenticated state:

```typescript
import { test, expect } from '@playwright/test';

// Use test.use() to override storageState for this test only
test.use({ storageState: { cookies: [], origins: [] } });

test('should sign up new user', async ({ page }) => {
  // This test starts with no auth
  await page.goto('/signup');
  // ... test signup flow
});
```

---

## Common Test Patterns

### Creating Records

```typescript
await page.goto('/module/create');
await page.fill('input#field', 'value');
await page.getByRole('button', { name: 'Create' }).click();

// Wait for navigation (proves success)
await page.waitForURL(/\/module\/[a-f0-9-]+$/, { timeout: 5000 });
```

### Editing Records

```typescript
await page.goto(`/module/${recordId}/edit`);
await page.fill('input#field', 'updated value');
await page.getByRole('button', { name: 'Update' }).click();

// Wait for navigation
await page.waitForURL(`/module/${recordId}`, { timeout: 5000 });
```

### Testing Dropdowns

```typescript
// Using shadcn Select component
await page.locator('#dropdown_field').click();
await page.getByRole('option', { name: 'Option Text' }).click();
```

### Testing Empty States

```typescript
await page.goto('/module');
await expect(page.locator('text=/No records yet/i')).toBeVisible();
await expect(page.getByRole('link', { name: /Create/i })).toBeVisible();
```

### Testing Form Validation

```typescript
await page.goto('/module/create');
await page.getByRole('button', { name: 'Create' }).click(); // Submit empty form
await expect(page).toHaveURL('/module/create'); // Should stay on page
```

### Testing Breadcrumbs

```typescript
const breadcrumbNav = page.getByLabel('breadcrumb');
await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
await breadcrumbNav.getByRole('link', { name: 'Module' }).click();
await expect(page).toHaveURL('/module');
```

### Testing Pickers

```typescript
// Open picker
await page.getByTestId('people-picker-trigger').click();

// Search
await page.getByLabel('Search people').fill('John');

// Select from list
await page.getByTestId('person-option-123').click();

// Verify selection
await expect(page.getByTestId('people-picker-trigger')).toContainText('John');
```

---

## Page Object Model

### What is it?

Page Object Model (POM) encapsulates page interactions into reusable classes. This reduces duplication and makes tests more maintainable.

### When to Use

- **Use POM for:** Modules with multiple tests (weddings, funerals, events, readings)
- **Skip POM for:** Simple one-off tests or very small modules

### Structure

```
tests/
├── page-objects/
│   ├── wedding.page.ts
│   ├── event.page.ts
│   └── base.page.ts
├── utils/
│   └── test-config.ts
└── weddings.spec.ts
```

### Example Implementation

```typescript
// tests/page-objects/wedding.page.ts
import { Page, expect } from '@playwright/test'
import { TEST_TIMEOUTS } from '../utils/test-config'

export class WeddingPage {
  constructor(private page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto('/weddings')
  }

  async gotoCreate() {
    await this.page.goto('/weddings/create')
  }

  async gotoEdit(id: string) {
    await this.page.goto(`/weddings/${id}/edit`)
  }

  async gotoView(id: string) {
    await this.page.goto(`/weddings/${id}`)
  }

  // Actions
  async clickNewWedding() {
    await this.page.getByRole('link', { name: /New Wedding/i }).first().click()
  }

  async fillWeddingNotes(notes: string) {
    await this.page.fill('#notes', notes)
  }

  async selectBride(brideName: string) {
    await this.page.getByTestId('bride-picker-trigger').click()
    await this.page.getByLabel('Search people').fill(brideName)
    await this.page.getByRole('button', { name: brideName }).click()
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /Create Wedding|Update Wedding/i }).click()
  }

  async waitForViewPage(id?: string) {
    const pattern = id ? `/weddings/${id}` : /\/weddings\/[a-f0-9-]+$/
    await this.page.waitForURL(pattern, { timeout: TEST_TIMEOUTS.FORM_SUBMIT })
  }

  // Assertions
  async expectToBeOnListPage() {
    await expect(this.page).toHaveURL('/weddings')
  }

  async expectToBeOnCreatePage() {
    await expect(this.page).toHaveURL('/weddings/create')
  }

  async expectWeddingCardVisible(id: string) {
    await expect(this.page.getByTestId(`wedding-card-${id}`)).toBeVisible()
  }

  async expectEmptyState() {
    await expect(this.page.locator('text=/No weddings yet/i')).toBeVisible()
  }
}
```

### Usage in Tests

```typescript
// tests/weddings.spec.ts
import { test, expect } from '@playwright/test'
import { WeddingPage } from './page-objects/wedding.page'

test.describe('Weddings Module', () => {
  test('should create a new wedding', async ({ page }) => {
    const weddingPage = new WeddingPage(page)

    // Navigation
    await weddingPage.goto()
    await weddingPage.clickNewWedding()
    await weddingPage.expectToBeOnCreatePage()

    // Fill form
    await weddingPage.fillWeddingNotes('Beautiful outdoor ceremony')
    await weddingPage.selectBride('Teresa Garcia')

    // Submit
    await weddingPage.submitForm()
    await weddingPage.waitForViewPage()

    // Verify
    await expect(page.locator('text=Beautiful outdoor ceremony')).toBeVisible()
  })
})
```

---

## File Structure

```
tests/
├── README.md                 # Basic testing overview (legacy)
├── TESTING_GUIDE.md          # This comprehensive guide (legacy - see docs/)
├── QUICK_REFERENCE.md        # Command reference (legacy - see docs/)
├── TEST_ARCHITECTURE.md      # Testability patterns (legacy - see docs/)
├── TESTABILITY_EXAMPLES.md   # Before/after examples (legacy - see docs/)
├── TEST_TEMPLATE.spec.ts     # Template for new tests
├── auth.setup.ts             # Global auth setup (runs once)
├── helpers/
│   └── auth.ts              # Auth utility functions
├── page-objects/            # Page Object Model classes
│   └── (create as needed)
├── utils/
│   └── test-config.ts       # Shared constants (timeouts, selectors)
├── events.spec.ts           # Events module tests
├── readings.spec.ts         # Readings module tests
├── presentation.spec.ts     # Presentation module tests
└── signup.spec.ts           # Signup flow tests (no auth needed)

playwright/.auth/
└── staff.json               # Cached auth state (git-ignored)

docs/
├── TESTING_QUICKSTART.md    # Quick start guide for running tests
├── TESTING_ARCHITECTURE.md  # Testability patterns and standards
└── TESTING_GUIDE.md         # This file (comprehensive guide)
```

### Key Files

**`auth.setup.ts`**
- Runs before all tests as a separate "setup" project
- Logs in and saves authentication state
- Only runs if auth state doesn't exist or is invalidated

**`helpers/auth.ts`**
- Utility functions for auth-related operations
- `verifyAuthenticated()` - Check if user is logged in
- `resetToDashboard()` - Navigate to clean state between tests
- `getTestCredentials()` - Get test user credentials from env

**`TEST_TEMPLATE.spec.ts`**
- Starting point for new test files
- Copy and customize for each module

**`playwright.config.ts`** (project root)
- Defines test projects: `setup` and `chromium`
- `setup` runs `auth.setup.ts` first
- `chromium` depends on `setup` and loads the saved auth state

---

## Debugging Tests

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

### Debug Helpers

```typescript
// Pause test execution and open inspector
await page.pause()

// Take a screenshot
await page.screenshot({ path: 'debug-screenshot.png' })

// Print page HTML to console
console.log(await page.content())

// Wait for specific timeout (for debugging)
await page.waitForTimeout(5000)
```

---

## Command Reference

### Run Tests

```bash
# Interactive UI (best for debugging)
npm run test:ui

# Watch tests run in browser
npm run test:headed

# Run all tests (fast, no UI)
npm test

# Run specific test file
npm run test:headed tests/events.spec.ts

# Run specific test by name (BEST for fixing individual failing tests)
npm run test:headed -- --grep "should create, view, edit, and verify print view"

# Run multiple test files
npm run test:headed tests/events.spec.ts tests/readings.spec.ts
```

### 🔧 Efficient Test Fixing Workflow

**When fixing multiple failing tests, follow this workflow to save time:**

1. **Identify failing tests** from the test run output
2. **Fix ONE test at a time** in the code
3. **Verify the fix** by running ONLY that specific test:
   ```bash
   npm run test:headed -- --grep "exact test name"
   ```
4. **Repeat** for each failing test
5. **Final verification** - run the full suite once all fixes are complete:
   ```bash
   npm test
   ```

**Example workflow:**
```bash
# First test run shows 3 failures:
# - baptisms: "should create, view, edit..."
# - funerals: "should create, view, edit..."
# - quinceaneras: "should show empty state..."

# Fix baptisms test, then verify ONLY that test:
npm run test:headed -- --grep "Baptisms Module.*should create, view, edit"

# Fix funerals test, then verify ONLY that test:
npm run test:headed -- --grep "Funerals Module.*should create, view, edit"

# Fix quinceaneras test, then verify ONLY that test:
npm run test:headed -- --grep "should show empty state when no quinceaneras"

# All individual tests passing? Run full suite:
npm test
```

**Why this approach?**
- ⚡ Faster feedback loop (5-10 seconds vs 60+ seconds)
- 🎯 Focused debugging on one issue at a time
- 💰 Saves compute time and resources
- ✅ Validates each fix before moving on

### Debug Tests

```bash
# Open Playwright Inspector
npx playwright test --debug tests/events.spec.ts

# Run with headed browser and slow motion
npx playwright test --headed --slow-mo=1000 tests/events.spec.ts

# Generate trace
npx playwright test --trace on tests/events.spec.ts

# Open trace viewer
npx playwright show-trace trace.zip

# Show Playwright report
npx playwright show-report
```

### Specific Test Execution

```bash
# Run only the auth setup (useful for debugging)
npx playwright test --project=setup

# Run with headed browser
npx playwright test --headed

# Run in parallel (default)
npx playwright test

# Run in serial (one at a time)
npx playwright test --workers=1

# Update snapshots (if using visual regression)
npx playwright test --update-snapshots
```

### Common Selectors Reference

```typescript
// By role (preferred)
page.getByRole('button', { name: 'Submit' })
page.getByRole('link', { name: /New Record/i })

// By label
page.getByLabel('Event Name')

// By test ID
page.getByTestId('my-element')

// By ID
page.locator('#field_name')

// By text
page.locator('text=Exact text')
page.locator('text=/regex pattern/i')

// First match
page.locator('button').first()

// Within a section
page.locator('[role="dialog"]').getByText('Text')
```

### Common Actions Reference

```typescript
// Fill input
await page.fill('input#email', 'test@example.com')
await page.getByLabel('Name').fill('John Doe')

// Click button
await page.click('button[type="submit"]')
await page.getByRole('button', { name: 'Submit' }).click()

// Select dropdown (shadcn)
await page.locator('#dropdown').click()
await page.getByRole('option', { name: 'Option' }).click()

// Check checkbox
await page.getByRole('checkbox', { name: 'Agree' }).check()

// Wait for navigation
await page.waitForURL('/expected-path')
await page.waitForURL(/\/regex\//, { timeout: 5000 })

// Wait for element
await page.waitForSelector('text=/Success/i', { timeout: 5000 })

// Wait for element to be visible
await page.waitForSelector('#element', { state: 'visible' })
```

### Common Assertions Reference

```typescript
// URL assertions
await expect(page).toHaveURL('/path')
await expect(page).toHaveURL(/\/regex\//)

// Element assertions
await expect(element).toBeVisible()
await expect(element).toBeHidden()
await expect(element).toBeEnabled()
await expect(element).toBeDisabled()
await expect(element).toHaveText('Expected text')
await expect(element).toContainText('partial')
await expect(element).toHaveValue('value')

// Count assertions
await expect(page.locator('.item')).toHaveCount(5)

// Attribute assertions
await expect(element).toHaveAttribute('aria-label', 'Delete')
```

---

## Best Practices

✅ **DO:**
- Start tests by navigating to your module (`await page.goto('/module')`)
- Use descriptive test names ("should create wedding with bride and groom")
- Wait for elements before interacting (`waitForSelector`)
- Use role-based selectors (`getByRole`) when possible
- Test the happy path first, then edge cases
- Use Page Object Model for complex modules
- Use centralized timeout constants
- **When fixing failing tests:** Run ONLY the specific failing test to verify the fix, then move on to the next failing test. Only run the full suite after ALL fixes are complete.

❌ **DON'T:**
- Don't create authentication functions (already handled)
- Don't navigate to /signup or /login (except in signup.spec.ts)
- Don't rely on data from previous tests
- Don't use overly generic selectors (`page.locator('button')`)
- Don't hardcode timeout values everywhere
- Don't test for toast messages after successful form submissions (see TESTING_ARCHITECTURE.md)
- **Don't re-run the entire test suite after each fix** - validate individual tests first to save time

---

## Next Steps

1. **Explore existing tests**: Open `npm run test:ui` to see test structure
2. **Copy the template**: `cp tests/TEST_TEMPLATE.spec.ts tests/weddings.spec.ts`
3. **Write your first test**: Follow the patterns in this guide
4. **Run your test**: `npm run test:headed tests/weddings.spec.ts`
5. **Review architecture**: See `TESTING_ARCHITECTURE.md` for testability patterns

---

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)
- [TESTING_ARCHITECTURE.md](./TESTING_ARCHITECTURE.md) - Testability patterns and standards
- [TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md) - Quick start guide for running tests
