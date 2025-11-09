# Playwright Testing Guide

This directory contains end-to-end tests for the Outward Sign application using Playwright.

## Table of Contents

- [Quick Start](#quick-start)
- [Authentication Strategy](#authentication-strategy)
- [Setup Instructions](#setup-instructions)
- [Running Tests](#running-tests)
- [How It Works](#how-it-works)
- [File Structure](#file-structure)
- [Writing New Tests](#writing-new-tests)
- [Troubleshooting](#troubleshooting)

## Quick Start

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Add Supabase service role key to .env.local (see Setup Instructions below)

# 3. Run tests with temporary user (recommended)
npm run test:with-temp-user

# Or run with headed browser for debugging
npm run test:with-temp-user:headed
```

These commands automatically:
1. ✅ Create a fresh test user and parish
2. ✅ Run all Playwright tests
3. ✅ Clean up test data when done

**Alternative**: If you want to keep test data between runs (for debugging), use:
```bash
npm run test:setup && npx playwright test
```

## Usage Guide

### Which Command Should I Use?

**For most situations, use the temporary user commands:**
- ✅ Running tests before committing code
- ✅ Running the full test suite
- ✅ CI/CD pipelines
- ✅ When you want clean, isolated test runs

**Use persistent user when:**
- 🔍 Debugging a specific failing test
- 🔍 Developing new tests and iterating quickly
- 🔍 Inspecting test data in Supabase after tests run

### Common Workflows

**Daily Development (Recommended)**
```bash
# Run all tests with automatic cleanup
npm run test:with-temp-user
```

**Debugging a Failing Test**
```bash
# 1. Create persistent test user (only needed once)
npm run test:setup

# 2. Run specific test with headed browser (can run multiple times)
npx playwright test presentation.spec.ts --headed

# 3. When done debugging, manually delete test data in Supabase
#    or just run with-temp-user to start fresh
```

**Running Specific Tests**
```bash
# Single test file with temp user
npm run test:with-temp-user presentation.spec.ts

# Tests matching a pattern with temp user
npm run test:with-temp-user -- --grep "should create"

# With headed browser for visibility
npm run test:with-temp-user:headed presentation.spec.ts
```

**Continuous Integration**
```bash
# In your CI pipeline (GitHub Actions, etc.)
npm run test:with-temp-user
```

## Authentication Strategy

This project uses a **reusable auth state** approach for Playwright testing, which provides:

- **~10x Faster Tests**: Login happens once, not for every test
- **Cleaner Test Code**: No repetitive signup/login/onboarding code
- **More Reliable**: Single test user instead of random emails
- **Better Isolation**: All tests share the same authenticated parish context

### How It Differs from Old Approach

**Before (Slow):**
```typescript
test('my test', async ({ page }) => {
  await setupTestUser(page); // 30+ lines, 10-15 seconds
  // ... actual test
});
```

**After (Fast):**
```typescript
test('my test', async ({ page }) => {
  // Already authenticated!
  await page.goto('/presentations');
  // ... actual test
});
```

## Setup Instructions

### 1. Install Dependencies

Make sure you have the required dependencies:

```bash
npm install
```

### 2. Get Supabase Service Role Key

To run the automated setup script, you need the Supabase service role key:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **Outward Sign** project
3. Go to **Project Settings** → **API**
4. Find the **service_role** key (under "Project API keys")
5. Click the copy icon to copy the key

### 3. Add Service Role Key to .env.local

Open `.env.local` at the project root and replace the placeholder:

```bash
# Before
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# After
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **⚠️ IMPORTANT**: The service role key is a secret that bypasses Row Level Security. Never commit this to git! It's already in `.gitignore`.

### 4. Run the Setup Script

Run the automated script to create the test user, parish, and all necessary links:

```bash
npm run test:setup
```

This script will:
- ✅ Create test user with email `test-staff@outwardsign.test`
- ✅ Create test parish "Playwright Test Parish"
- ✅ Link user to parish with `staff` role
- ✅ Create user settings with selected parish

If the user or parish already exists, the script will update them instead of creating duplicates.

**Expected output:**
```
🚀 Starting test user setup...

1️⃣  Checking if user test-staff@outwardsign.test exists...
   ✅ User created with ID: abc-123-...

2️⃣  Checking if test parish exists...
   ✅ Parish created with ID: xyz-789-...

3️⃣  Linking user to parish with staff role...
   ✅ User linked to parish with staff role

4️⃣  Setting up user settings...
   ✅ Created user settings

✨ Test user setup complete!
```

### 5. Verify Environment Variables

The test credentials are defined in `.env.local`:

```bash
TEST_USER_EMAIL=test-staff@outwardsign.test
TEST_USER_PASSWORD=TestPassword123!
TEST_PARISH_NAME=Playwright Test Parish
TEST_PARISH_CITY=Test City
TEST_PARISH_STATE=TS
```

> **Note**: `.env.local` is git-ignored for security. Each developer needs to create this file locally and run the setup script.

## Running Tests

### First Time or After Cleanup

If this is your first time running tests, or if you've deleted the test user/parish, run the setup script first:

```bash
# Create test user and run all tests
npm run test:setup && npx playwright test

# Create test user and run specific test file
npm run test:setup && npx playwright test presentation.spec.ts
```

**When to run `npm run test:setup`:**
- First time setting up tests on your machine
- After manually deleting test data from Supabase
- If tests fail with authentication errors
- If you see "User doesn't exist" errors
- After changing TEST_USER_EMAIL in `.env.local`

Once the test user is created, you can run tests directly without the setup step.

### Run Tests with Temporary User (Recommended)

These commands create a temporary test user, run tests, then automatically clean up all test data:

```bash
# Run all tests with temp user (headless)
npm run test:with-temp-user

# Run all tests with temp user (headed browser, easier to debug)
npm run test:with-temp-user:headed

# Run specific test file with temp user
npm run test:with-temp-user presentation.spec.ts

# Run tests matching a pattern with temp user
npm run test:with-temp-user -- --grep "should create presentation"
```

**Benefits:**
- ✅ Fresh test environment every time
- ✅ No leftover test data in your database
- ✅ Consistent results across test runs
- ✅ Automatically cleans up even if tests fail or you press Ctrl+C

### Run Tests with Persistent User

Use these if you want to keep the test user/data between runs (faster for debugging):

```bash
# With Playwright UI (recommended for development)
npm run test:headed

# Headless mode (CI/production)
npx playwright test

# Watch mode (re-runs tests on file changes)
npx playwright test --ui
```

### Run Specific Tests

```bash
# Run a single test file
npx playwright test presentation.spec.ts

# Run tests matching a pattern
npx playwright test --grep "should create presentation"

# Run only the auth setup (useful for debugging)
npx playwright test --project=setup
```

### Debug Tests

```bash
# Open Playwright Inspector
npx playwright test --debug

# Run with headed browser and slow motion
npx playwright test --headed --slow-mo=1000
```

## How It Works

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
   presentation.spec.ts
   └─> Loads auth state from playwright/.auth/staff.json
   └─> Starts with user already logged in
   └─> Test runs immediately without login
   ```

### Auth State Caching

The authentication state is saved to `playwright/.auth/staff.json` and reused across test runs until:

- You delete the file manually
- You change test credentials in `.env.local`
- You explicitly re-run the setup project

To force re-authentication:

```bash
# Delete cached auth state
rm -rf playwright/.auth

# Re-run setup
npx playwright test --project=setup
```

## File Structure

```
tests/
├── README.md                 # This file
├── auth.setup.ts             # Global auth setup (runs once)
├── helpers/
│   └── auth.ts              # Auth utility functions
├── presentation.spec.ts      # Presentation module tests
├── readings.spec.ts          # Readings module tests
└── signup.spec.ts           # Signup flow tests (no auth needed)

playwright/.auth/
└── staff.json               # Cached auth state (git-ignored)
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

**`playwright.config.ts`** (project root)
- Defines two projects: `setup` and `chromium`
- `setup` runs `auth.setup.ts` first
- `chromium` depends on `setup` and loads the saved auth state

## Writing New Tests

### Basic Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Module', () => {
  test('should do something', async ({ page }) => {
    // User is already authenticated!

    // Navigate to your module
    await page.goto('/my-module');

    // Write your test
    await expect(page).toHaveURL('/my-module');
    // ... rest of test
  });
});
```

### Using Auth Helpers

```typescript
import { test, expect } from '@playwright/test';
import { verifyAuthenticated, resetToDashboard } from './helpers/auth';

test.describe('My Module', () => {
  // Optional: Reset to dashboard before each test
  test.beforeEach(async ({ page }) => {
    await resetToDashboard(page);
  });

  test('should verify auth', async ({ page }) => {
    // Verify user is authenticated
    await verifyAuthenticated(page);

    // Continue with test
    await page.goto('/my-module');
    // ...
  });
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

## Troubleshooting

### Tests Fail with "Not Authenticated" Errors

**Solution**: Delete cached auth and re-run setup

```bash
rm -rf playwright/.auth
npx playwright test --project=setup
```

### "TEST_USER_EMAIL and TEST_USER_PASSWORD must be set" Error

**Problem**: `.env.local` is missing or not loaded

**Solution**:
1. Verify `.env.local` exists at project root (not in tests/ directory)
2. Ensure it contains `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`
3. Restart your terminal/IDE to pick up env changes

### Setup Script Fails at Onboarding

**Problem**: Test user already has a parish but setup expects onboarding

**Solution**: Either:
- **Option A**: Delete the test user's parish in Supabase and re-run setup
- **Option B**: Update `auth.setup.ts` to handle existing parishes

### Tests are Slow Despite Auth Caching

**Problem**: Setup is running on every test run

**Solution**:
- Check if `playwright/.auth/staff.json` exists
- Verify `playwright.config.ts` has `dependencies: ['setup']` in chromium project
- Make sure you're not deleting `.auth` directory between runs

### Test User Doesn't Have Permission to Create Records

**Problem**: Test user doesn't have `staff` role

**Solution**: Run this SQL in Supabase:

```sql
-- Check current role
SELECT email, role FROM profiles
WHERE email = 'test-staff@outwardsign.test';

-- If role is not 'staff', update it
UPDATE profiles
SET role = 'staff'
WHERE email = 'test-staff@outwardsign.test';
```

### Tests Work Locally but Fail in CI

**Problem**: CI doesn't have test user credentials

**Solution**: Add environment variables to your CI platform:
- `TEST_USER_EMAIL=test-staff@outwardsign.test`
- `TEST_USER_PASSWORD=TestPassword123!`

For GitHub Actions:
```yaml
env:
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

## Advanced Configuration

### Testing with Different Roles

To test with different user roles (admin, parishioner), create additional setup scripts:

```typescript
// tests/auth.setup.admin.ts
setup('authenticate as admin', async ({ page }) => {
  // Login as admin user
  // Save to playwright/.auth/admin.json
});

// playwright.config.ts
projects: [
  { name: 'setup-staff', testMatch: /auth\.setup\.ts/ },
  { name: 'setup-admin', testMatch: /auth\.setup\.admin\.ts/ },
  {
    name: 'chromium-staff',
    use: { storageState: 'playwright/.auth/staff.json' },
    dependencies: ['setup-staff'],
  },
  {
    name: 'chromium-admin',
    use: { storageState: 'playwright/.auth/admin.json' },
    dependencies: ['setup-admin'],
  },
]
```

### Running Tests in Parallel with Isolation

By default, Playwright runs tests in parallel. To ensure test isolation:

```typescript
test.describe.serial('Sequential tests', () => {
  // Tests run one at a time in order
});

test.describe.configure({ mode: 'parallel' }, () => {
  // Tests run in parallel (default)
});
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Authentication Guide](https://playwright.dev/docs/auth)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
