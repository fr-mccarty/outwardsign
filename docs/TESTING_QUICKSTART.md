# Testing Quick Start

> **Purpose:** Get tests running in 5 minutes. Quick setup and essential commands.
>
> **See Also:**
> - **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive guide for writing tests
> - **[TESTING_ARCHITECTURE.md](./TESTING_ARCHITECTURE.md)** - Testability standards and best practices
> - **[TESTING_REGISTRY.md](./TESTING_REGISTRY.md)** - Complete registry of all tests with descriptions

**Goal:** Get tests running in 5 minutes.

## Prerequisites

1. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

2. Add Supabase service role key to `.env.local`:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → **Project Settings** → **API**
   - Copy the **service_role** key
   - Add to `.env.local`:
     ```bash
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - **IMPORTANT**: Never commit this key to git (already in `.gitignore`)

## Run Tests - Three Modes

### 1. Playwright UI (Best for Development)

**ONE-TIME SETUP** (only needed once):
```bash
npm run test:ui:setup
```

**Then use Playwright UI anytime**:
```bash
npm run test:ui
```

**Features:**
- Interactive test selection
- Time-travel debugging
- Watch mode for active development
- See test code side-by-side with execution
- Uses persistent test user (not cleaned up automatically)

**Navigation:**
- Left Sidebar → Expand **"chromium"** project
- Click test files to see individual tests
- Click play button to run tests
- Use timeline to step through execution
- **Ignore the "setup" project** - runs automatically

### 2. Headed Mode (Watch Tests Run)

```bash
npm run test:headed
```

**Features:**
- See browser window as tests execute
- Great for understanding test flow
- Automatically creates and cleans up test data

**Run specific tests:**
```bash
npm run test:headed tests/events.spec.ts
npm run test:headed -- --grep "should create"
```

### 3. Headless Mode (Fastest - CI/CD)

```bash
npm test
```

**Features:**
- No browser window shown
- Quickest way to run full test suite
- Best for CI/CD pipelines
- Complete isolation and cleanup

## Understanding Test Modes

**With Temporary User** (npm test, npm run test:headed):
- ✅ Fresh database state every run
- ✅ Complete test isolation
- ✅ Automatic cleanup of all test data
- ✅ No manual setup required
- Use for: Running tests before commits, full test suite, CI/CD

**With Persistent User** (npm run test:ui after setup):
- 🔍 Keeps test data between runs
- 🔍 Faster iteration during development
- 🔍 Can inspect data in Supabase after tests
- Use for: Debugging specific tests, developing new tests

## Run Specific Tests

```bash
# Single test file
npm run test:headed tests/events.spec.ts

# Single test file with line reporter (cleaner output - recommended)
npm test -- tests/module-deletion.spec.ts --reporter=line

# Tests matching a pattern
npm run test:headed -- --grep "should create event"

# Multiple test files
npm run test:headed tests/events.spec.ts tests/readings.spec.ts
```

## Debugging Tests

```bash
# Open Playwright Inspector (step through tests)
npx playwright test --debug tests/events.spec.ts

# Run with slow motion
npx playwright test --headed --slow-mo=1000

# Generate trace for analysis
npx playwright test --trace on tests/events.spec.ts
npx playwright show-trace trace.zip
```

## Common Issues

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
3. Restart your terminal/IDE

### Test Timeout Errors

**Problem**: Test fails with "Test timeout of 30000ms exceeded"

**Solutions**:
1. Increase timeout for specific operation:
   ```typescript
   await page.waitForSelector('text=/Success/i', { timeout: 10000 })
   ```
2. Wait for page to be fully loaded:
   ```typescript
   await page.goto('/path', { waitUntil: 'networkidle' })
   ```
3. Check if element selector is correct (use Playwright UI to inspect)

### Element Not Found Errors

**Solutions**:
1. Wait for element to be visible:
   ```typescript
   await page.waitForSelector('#element', { state: 'visible' })
   ```
2. Use more specific selectors:
   ```typescript
   // Instead of: page.locator('button')
   page.getByRole('button', { name: 'Submit' })
   ```
3. Check if element is in a modal or dialog:
   ```typescript
   await page.locator('[role="dialog"]').getByText('Text').click()
   ```

## What's Next?

After running tests successfully:

1. **Explore existing tests**: Open `npm run test:ui` to see test structure
2. **Learn testing patterns**: See `docs/TESTING_GUIDE.md`
3. **Understand testability**: See `docs/TESTING_ARCHITECTURE.md`
4. **Write new tests**: Copy `tests/TEST_TEMPLATE.spec.ts` as a starting point

## Quick Reference

### Current Test Files

| Module | File | Tests | Status |
|--------|------|-------|--------|
| Events | `tests/events.spec.ts` | 7 | ✅ Working |
| Readings | `tests/readings.spec.ts` | 5 | ✅ Working |
| Presentations | `tests/presentation.spec.ts` | 3 | ⚠️ Mostly skipped |
| Signup | `tests/signup.spec.ts` | 3 | ✅ Working |

### Essential Commands

```bash
# Run all tests (with automatic cleanup)
npm test

# Run with visible browser
npm run test:headed

# Interactive debugging UI
npm run test:ui

# Run specific test file
npm run test:headed tests/events.spec.ts

# Debug with inspector
npx playwright test --debug
```

## CI/CD Integration

For continuous integration:
```bash
npm test  # Runs headless with automatic cleanup
```

Add to GitHub Actions:
```yaml
env:
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```
