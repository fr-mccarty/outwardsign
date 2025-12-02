# Test Suite

This directory contains all end-to-end tests for Outward Sign using Playwright.

## Quick Start

```bash
# Run all tests (with automatic setup and cleanup)
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests with Playwright UI (for debugging)
npm run test:ui
```

**⚠️ IMPORTANT:** Always use `npm test` (not `npx playwright test` directly). The npm command handles automatic test user setup and cleanup.

## Documentation

For complete testing documentation, see:

- **[TESTING_QUICKSTART.md](../docs/TESTING_QUICKSTART.md)** - Quick setup guide for running tests
- **[TESTING_GUIDE.md](../docs/TESTING_GUIDE.md)** - Comprehensive guide for writing tests
- **[TESTING_ARCHITECTURE.md](../docs/TESTING_ARCHITECTURE.md)** - Testability patterns and standards
- **[TESTING_REGISTRY.md](../docs/testing/TESTING_REGISTRY.md)** - Complete inventory of all tests

## Test Structure

```
tests/
├── auth.setup.ts              # Authentication setup (runs before tests)
├── TEST_TEMPLATE.spec.ts      # Template for creating new tests
├── helpers/                   # Test helper utilities
├── utils/                     # Test utility functions
├── fixtures/                  # Test fixtures and data
└── *.spec.ts                  # Test files (organized by module/feature)
```

## Writing Tests

**✅ CORRECT Pattern:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('My Module Tests', () => {
  test('should do something', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json
    await page.goto('/my-module');
    // Your test logic here...
  });
});
```

**❌ WRONG Pattern:**
```typescript
// ❌ DO NOT create setupTestUser() functions
// ❌ DO NOT navigate to /signup or /login in tests
// ❌ DO NOT try to authenticate manually
```

**Key Points:**
- Tests are **pre-authenticated automatically** - no manual auth setup needed
- Each test run gets a **fresh, isolated environment** with unique credentials
- All test data is **automatically cleaned up** after tests complete
- Copy `TEST_TEMPLATE.spec.ts` to create new test files
- See existing tests for reference patterns

## Test Coverage

This test suite includes comprehensive coverage for:

- **Authentication & Permissions** - Login, signup, role-based access
- **Core Modules** - Masses, Weddings, Funerals, Baptisms, Presentations, Quinceañeras, Groups
- **Shared Features** - Calendar, People, Events, Locations, Settings
- **Pickers** - Person, Event, Location, Mass Role, Mass Intention pickers
- **Forms & Validation** - Form inputs, validation, error handling
- **Data Tables** - Sorting, filtering, pagination
- **Reports** - Mass intention reports, weekend summaries
- **Settings** - Parish settings, event types, readings, petitions, user settings
- **Team Management** - Invitations, role assignments, permissions

See [TESTING_REGISTRY.md](../docs/testing/TESTING_REGISTRY.md) for complete test inventory.
