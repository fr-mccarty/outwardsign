# Testing Guide

> **Single source of truth** for all testing in Outward Sign.

## Quick Reference

### End-to-End Tests (Playwright)

```bash
npm run test                              # Run all E2E tests (headless)
npm run test -- tests/events.spec.ts      # Run specific file
npm run test -- --grep "creates wedding"  # Run by name
npm run test:ui                           # Interactive debugger
npm run test:headed                       # Run with browser visible
```

E2E tests are **pre-authenticated** - no login code needed.

### Unit Tests (Vitest)

```bash
npm run test:unit                         # Run all unit tests
npm run test:unit:watch                   # Watch mode (re-run on changes)
```

Unit tests are for testing utility functions, helpers, and pure logic in isolation.

---

## Test Philosophy

**Tests exist to catch regressions, not to document every behavior.**

### Guiding Principles

1. **Test user workflows, not implementation details**
2. **One test can cover multiple steps** (create → edit → verify is ONE test)
3. **Skip obvious behaviors** - if the framework handles it, don't test it
4. **Fail fast** - if a test is flaky, fix or delete it

---

## Limits & Constraints

### File Limits

| Metric | Limit | Rationale |
|--------|-------|-----------|
| Lines per test file | **150 max** | Forces focus; split if larger |
| Tests per file | **5 max** | Covers happy path + key edge cases |
| Lines per test | **30 max** | Long tests indicate over-testing |
| Page Object classes | **100 lines max** | Extract shared helpers to utils |

### Test Count Guidelines

Per feature/module:
- **1 happy path test** (the main workflow)
- **1-2 edge cases** (empty state, error handling)
- **0 tests for obvious behaviors**

**Total: 2-3 tests per module is usually sufficient.**

---

## What to Test

### DO Test

- **Critical user workflows**: Create → View → Edit → Delete
- **Permission boundaries**: Can staff access? Is admin blocked?
- **Empty states**: Does the page show helpful guidance?
- **Form validation**: Are required fields enforced?

### DO NOT Test

| Skip This | Why |
|-----------|-----|
| Third-party libraries (Supabase, Next.js, Radix) | Already tested by maintainers |
| Simple getters/setters | No logic to break |
| CSS/styling | Visual regression tests are separate |
| Every form field | Test 1-2 representative fields |
| Toast messages | Test navigation instead (proves success) |
| Loading states | Framework handles this |
| Breadcrumb rendering | If one works, they all work |

---

## Test Structure Template

### Minimal Module Test (Target: ~50 lines)

```typescript
import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Weddings', () => {
  test('create, view, and edit workflow', async ({ page }) => {
    // Create
    await page.goto('/weddings/create');
    await page.fill('#notes', 'Test wedding');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Extract ID and verify view
    const id = page.url().split('/').at(-2);
    await page.goto(`/weddings/${id}`);
    await expect(page.locator('text=Test wedding')).toBeVisible({ timeout: TEST_TIMEOUTS.RENDER });

    // Edit
    await page.goto(`/weddings/${id}/edit`);
    await page.fill('#notes', 'Updated notes');
    await page.locator('button[type="submit"]').click();
    await page.goto(`/weddings/${id}`);
    await expect(page.locator('text=Updated notes')).toBeVisible({ timeout: TEST_TIMEOUTS.RENDER });
  });

  test('shows empty state with create button', async ({ page }) => {
    await page.goto('/weddings');
    await expect(page.getByRole('link', { name: /New Wedding/i })).toBeVisible({ timeout: TEST_TIMEOUTS.RENDER });
  });
});
```

**That's it.** Two tests cover the entire module's core functionality.

---

## Naming Conventions

### Test Descriptions

**Keep them short and scannable:**

```typescript
// GOOD - scannable, action-focused
test('create and edit workflow', ...)
test('shows empty state', ...)
test('blocks unauthorized access', ...)
test('validates required fields', ...)

// BAD - verbose, redundant
test('should be able to create a new wedding and then edit it and verify changes persist', ...)
test('should show an empty state message when there are no weddings in the database', ...)
```

### File Names

```
{module}.spec.ts           # Main module tests (weddings.spec.ts)
{module}-{feature}.spec.ts # Specific feature (weddings-export.spec.ts)
```

---

## Anti-Patterns to Avoid

### 1. Over-commenting

```typescript
// BAD - comments restate the obvious
test('should create wedding', async ({ page }) => {
  // Navigate to the weddings page
  await page.goto('/weddings');
  // Click the create button
  await page.click('button');
  // Fill in the form...
});

// GOOD - code is self-documenting
test('create wedding', async ({ page }) => {
  await page.goto('/weddings/create');
  await page.fill('#notes', 'Test');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
});
```

### 2. Excessive Logging

```typescript
// BAD - clutters output
console.log('Starting test...');
console.log('Navigating to page...');
console.log('Filling form...');
console.log('Created wedding with ID: ' + id);
console.log('Test complete!');

// GOOD - no logging in happy path (errors are self-evident)
```

### 3. Redundant Assertions

```typescript
// BAD - testing the same thing multiple ways
await expect(page).toHaveURL('/weddings/create');
await expect(page.url()).toContain('/weddings/create');
await expect(page.locator('h1')).toHaveText('Create Wedding');
await expect(page.getByRole('heading')).toBeVisible();

// GOOD - one assertion per concept
await expect(page).toHaveURL('/weddings/create');
```

### 4. Testing Framework Behavior

```typescript
// BAD - testing that Next.js routing works
test('navigates to page', async ({ page }) => {
  await page.goto('/weddings');
  await expect(page).toHaveURL('/weddings'); // This always passes
});

// GOOD - test actual functionality
test('lists existing weddings', async ({ page }) => {
  await page.goto('/weddings');
  await expect(page.getByTestId('wedding-card')).toHaveCount(3);
});
```

### 5. Massive Page Objects

```typescript
// BAD - 300+ line Page Object with every possible method
class WeddingsPage {
  async navigateToList() { ... }
  async navigateToCreate() { ... }
  async clickNewButton() { ... }
  async fillBrideName() { ... }
  async fillGroomName() { ... }
  async fillDate() { ... }
  // ... 50 more methods
}

// GOOD - inline for simple tests, small helpers for repeated patterns
// Only create Page Objects when 3+ tests share significant setup
```

### 6. Artificial Waits

```typescript
// BAD - arbitrary timeouts
await page.waitForTimeout(2000);
await page.waitForTimeout(500);

// BAD - hardcoded timeout values
await page.waitForURL(/\/weddings\/[a-f0-9-]+$/, { timeout: 10000 });
await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

// GOOD - wait for specific conditions with TEST_TIMEOUTS constants
await page.waitForURL(/\/weddings\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });
```

---

## Selector Priority

Use selectors in this order:

1. **Role** (best): `page.getByRole('button', { name: 'Save' })`
2. **Label**: `page.getByLabel('Email')`
3. **Test ID** (last resort): `page.getByTestId('wedding-card')`

Avoid: CSS selectors, XPath, complex chaining

---

## Test Configuration Constants

**Location:** `tests/utils/test-config.ts`

All test timeout values and common selectors are centralized in this file.

### Timeout Constants

Use `TEST_TIMEOUTS` for all wait operations:

```typescript
import { TEST_TIMEOUTS } from '../utils/test-config'

// Quick checks, animations (1 second)
await expect(page.locator('...')).toBeVisible({ timeout: TEST_TIMEOUTS.QUICK })

// Dialog animations (3 seconds)
await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG })

// Toast messages (5 seconds)
await expect(page.locator(TEST_SELECTORS.TOAST_SUCCESS)).toBeVisible({
  timeout: TEST_TIMEOUTS.TOAST
})

// Form submission and redirect (10 seconds)
await page.waitForURL(/\/events\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT })

// Heavy SSR pages (30 seconds)
await page.goto('/dashboard', { timeout: TEST_TIMEOUTS.HEAVY_LOAD })
```

**Available timeouts:**
- `QUICK` - 1 second (animations, error detection)
- `SHORT` - 2 seconds (calendar checks)
- `DIALOG` - 3 seconds (modal animations)
- `TOAST` - 5 seconds (toast messages)
- `DATA_LOAD` - 5 seconds (list/table data)
- `RENDER` - 5 seconds (element rendering)
- `NAVIGATION` - 10 seconds (page.goto, waitForURL)
- `FORM_SUBMIT` - 10 seconds (form submission + redirect)
- `EXTENDED` - 15 seconds (slow operations)
- `AUTH` - 20 seconds (authentication flows)
- `HEAVY_LOAD` - 30 seconds (SSR pages with lots of data)

### Common Selectors

```typescript
import { TEST_SELECTORS } from '../utils/test-config'

// Success toast
await expect(page.locator(TEST_SELECTORS.TOAST_SUCCESS)).toBeVisible()

// Error toast
await expect(page.locator(TEST_SELECTORS.TOAST_ERROR)).toBeVisible()
```

**Important:** Do NOT define test timeout constants in `src/lib/constants.ts` or other files. All test configuration belongs in `tests/utils/test-config.ts`.

---

## Debugging

```bash
npm run test -- --debug tests/weddings.spec.ts   # Step-through debugger
npm run test:ui                                   # Visual test runner
```

In test code:
```typescript
await page.pause();  // Opens inspector at this point
```

---

## When to Write Tests

| Scenario | Action |
|----------|--------|
| New module | Write 2-3 tests covering core workflow |
| Bug fix | Add test ONLY if bug was critical and non-obvious |
| Refactor | Existing tests should still pass (don't add more) |
| New picker/component | Test via module integration, not in isolation |

---

## Checklist Before Committing Tests

- [ ] File under 150 lines
- [ ] 5 or fewer tests
- [ ] No `console.log` statements
- [ ] No `waitForTimeout` (use specific waits)
- [ ] No hardcoded timeout values (use `TEST_TIMEOUTS` constants)
- [ ] Import from `./utils/test-config` (not `@/lib/constants`)
- [ ] Test names are short and scannable
- [ ] Tests actual behavior, not framework internals

---

## Unit Testing with Vitest

### Overview

Vitest is used for testing utility functions, helpers, and pure logic in isolation. Unlike Playwright E2E tests which run in a browser, unit tests run in Node.js and are much faster.

**Location:** `tests/unit/`

### When to Use Unit Tests

| Use Unit Tests For | Use E2E Tests For |
|-------------------|-------------------|
| Pure utility functions | User workflows |
| Data transformations | Form submissions |
| Validation logic | Navigation flows |
| Formatters/helpers | Component interactions |
| Sanitization functions | Permission boundaries |

### Running Unit Tests

```bash
npm run test:unit           # Run once
npm run test:unit:watch     # Watch mode (re-run on file changes)
```

### Writing Unit Tests

**Location:** `tests/unit/{feature}.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/utils/my-utility'

describe('myFunction', () => {
  it('handles basic input', () => {
    expect(myFunction('input')).toBe('expected output')
  })

  it('handles edge cases', () => {
    expect(myFunction(null)).toBe('')
    expect(myFunction(undefined)).toBe('')
  })
})
```

### Path Aliases

Unit tests support the same `@/` path alias as the main application:

```typescript
import { sanitizeRichText } from '@/lib/utils/sanitize'
```

### Configuration

Vitest configuration is in `vitest.config.ts`:
- Environment: Node.js
- Test location: `tests/unit/**/*.test.ts`
- Path alias: `@/` maps to `./src/`

---

## Existing Test Files

### Unit Tests (`tests/unit/`)

| File | Purpose |
|------|---------|
| `sanitize.test.ts` | Tests sanitization utility (HTML stripping, markdown preservation, placeholder syntax) |

### E2E Tests (`tests/`)

| File | Purpose |
|------|---------|
| `weddings.spec.ts` | Wedding module CRUD workflow |
| `funerals.spec.ts` | Funeral module CRUD workflow |
| `events.spec.ts` | Dynamic events module |
| `events-view-edit.spec.ts` | Event view page (scripts only) and edit page (settings menu) |
| `masses.spec.ts` | Mass scheduling module |
| `mass-intentions.spec.ts` | Mass intentions CRUD |
| `people.spec.ts` | People directory module |
| `families.spec.ts` | Family management module |
| `groups.spec.ts` | Ministry groups module |
| `locations.spec.ts` | Locations module |
| `settings.spec.ts` | Settings pages |
| `navigation.spec.ts` | Sidebar and breadcrumb navigation |

---

## Sanitization Tests Reference

The sanitization utility (`src/lib/utils/sanitize.ts`) has comprehensive unit tests covering:

### Test Categories

1. **HTML Stripping**: Removes `<script>`, `<div>`, `<span>`, and other HTML tags
2. **Markdown Preservation**: Keeps `**bold**`, `*italic*`, `# headings`
3. **Custom Syntax**: Preserves `{red}text{/red}` liturgical highlighting
4. **Placeholders**: Preserves `{{field}}`, `{{field.property}}`, `{{field | a | b}}`
5. **Edge Cases**: Handles null, undefined, empty strings

### Running Sanitization Tests

```bash
npm run test:unit -- tests/unit/sanitize.test.ts
```

### Example Test Output

```
✓ tests/unit/sanitize.test.ts (15 tests) 5ms
  ✓ sanitizeTextInput > strips all HTML tags
  ✓ sanitizeTextInput > handles null/undefined/empty inputs
  ✓ sanitizeTextInput > trims whitespace
  ✓ sanitizeRichText > strips HTML tags while preserving markdown
  ✓ sanitizeRichText > preserves {red}{/red} custom syntax
  ✓ sanitizeRichText > preserves {{placeholder}} syntax
  ✓ sanitizeRichText > handles complex mixed content
  ✓ sanitizeRichText > handles null/undefined/empty inputs
  ✓ sanitizeFieldValues > sanitizes text fields with plain sanitization
  ✓ sanitizeFieldValues > sanitizes rich_text fields preserving markdown
  ✓ sanitizeFieldValues > sanitizes mass-intention fields as rich text
  ✓ sanitizeFieldValues > ignores non-text field types
  ✓ sanitizeFieldValues > handles empty/null field values
  ✓ wrapper functions > sanitizeContentBody works like sanitizeRichText
  ✓ wrapper functions > sanitizeSectionContent works like sanitizeRichText
```
