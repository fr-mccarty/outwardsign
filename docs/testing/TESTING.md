# Testing Guide

> **Single source of truth** for all testing in Outward Sign.

## Quick Reference

```bash
npm run test                              # Run all tests (headless)
npm run test -- tests/events.spec.ts      # Run specific file
npm run test -- --grep "creates wedding"  # Run by name
npm run test:ui                           # Interactive debugger
```

Tests are **pre-authenticated** - no login code needed.

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

test.describe('Weddings', () => {
  test('create, view, and edit workflow', async ({ page }) => {
    // Create
    await page.goto('/weddings/create');
    await page.fill('#notes', 'Test wedding');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/);

    // Extract ID and verify view
    const id = page.url().split('/').at(-2);
    await page.goto(`/weddings/${id}`);
    await expect(page.locator('text=Test wedding')).toBeVisible();

    // Edit
    await page.goto(`/weddings/${id}/edit`);
    await page.fill('#notes', 'Updated notes');
    await page.locator('button[type="submit"]').click();
    await page.goto(`/weddings/${id}`);
    await expect(page.locator('text=Updated notes')).toBeVisible();
  });

  test('shows empty state with create button', async ({ page }) => {
    await page.goto('/weddings');
    await expect(page.getByRole('link', { name: /New Wedding/i })).toBeVisible();
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
  await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/);
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

// GOOD - wait for specific conditions
await page.waitForURL(/\/weddings\/[a-f0-9-]+$/);
await expect(page.getByRole('dialog')).toBeVisible();
```

---

## Selector Priority

Use selectors in this order:

1. **Role** (best): `page.getByRole('button', { name: 'Save' })`
2. **Label**: `page.getByLabel('Email')`
3. **Test ID** (last resort): `page.getByTestId('wedding-card')`

Avoid: CSS selectors, XPath, complex chaining

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
- [ ] Test names are short and scannable
- [ ] Tests actual behavior, not framework internals
