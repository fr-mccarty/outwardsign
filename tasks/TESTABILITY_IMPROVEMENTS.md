# Mass Intention Picker - Testability Improvements

## Current Status

The test file `tests/masses-mass-intention-picker.spec.ts` already exists with comprehensive coverage but is failing due to testability issues.

## Issues Identified

1. **Mass Intention Card Not Found** - Tests cannot reliably locate the Mass Intention card section
2. **Timing Issues** - Page reloads and React hydration cause flakiness
3. **Complex Selectors** - Unlink button uses fragile selectors (`.border.rounded-md`)

## Required Component Changes

### 1. Add Test IDs to Mass Form (`src/app/(main)/masses/mass-form.tsx`)

#### Mass Intention Card Section (lines 457-523)

**Add test ID to the Card wrapper:**
```tsx
{/* Mass Intention */}
{isEditing && mass?.id && (
  <Card data-testid="mass-intention-card">  {/* ADD THIS */}
    <CardHeader>
      <CardTitle>Mass Intention</CardTitle>
```

**Add test ID to Link button:**
```tsx
<Button
  type="button"
  variant="outline"
  onClick={() => setMassIntentionPickerOpen(true)}
  data-testid="link-mass-intention-button"  {/* ADD THIS */}
>
  <Plus className="h-4 w-4 mr-2" />
  Link Mass Intention
</Button>
```

**Add test ID to Unlink button:**
```tsx
<Button
  type="button"
  variant="ghost"
  size="sm"
  onClick={handleUnlinkMassIntention}
  data-testid="unlink-mass-intention-button"  {/* ADD THIS */}
>
  <X className="h-4 w-4" />
</Button>
```

**Add test ID to the mass intention display container:**
```tsx
{massIntention ? (
  <div className="border rounded-md p-4 space-y-3" data-testid="mass-intention-display">  {/* ADD THIS */}
    <div className="flex items-start justify-between">
```

### 2. Add Test ID to Mass Intention Picker (`src/components/mass-intention-picker.tsx`)

The picker already uses CorePicker which provides good semantic selectors. No changes needed here.

## Updated Test Selectors

After adding the test IDs above, update the test file to use these selectors:

### Old (Fragile) Selectors:
```ts
// ❌ Fragile - relies on heading text and timing
await expect(page.getByRole('heading', { name: 'Mass Intention' })).toBeVisible({ timeout: 15000 });

// ❌ Fragile - complex CSS selector
const unlinkButton = page.locator('.border.rounded-md').getByRole('button').filter({ has: page.locator('svg') });
```

### New (Reliable) Selectors:
```ts
// ✅ Reliable - uses test ID
await expect(page.getByTestId('mass-intention-card')).toBeVisible({ timeout: 10000 });

// ✅ Reliable - uses test ID
await page.getByTestId('link-mass-intention-button').click();

// ✅ Reliable - uses test ID
await page.getByTestId('unlink-mass-intention-button').click();

// ✅ Reliable - uses test ID for container
await expect(page.getByTestId('mass-intention-display')).toBeVisible();
```

## Alternative: Simplified Test Pattern

If the existing tests continue to fail due to server-side rendering issues, here's a simplified pattern that focuses on the core user flow:

```ts
test('should add mass intention to mass using picker', async ({ page }) => {
  // 1. Create mass intention
  await page.goto('/mass-intentions/create');
  const intentionText = `Test Intention ${Date.now()}`;
  await page.fill('#mass_offered_for', intentionText);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+\/edit/);

  // 2. Create mass
  await page.goto('/masses/create');
  await page.fill('#note', 'Test Mass');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit/);

  // 3. Wait for card to hydrate (give it time)
  await page.waitForTimeout(2000);

  // 4. Open picker using testId
  await page.getByTestId('link-mass-intention-button').click();

  // 5. Select intention
  await page.getByText(intentionText).click();

  // 6. Verify linked
  await expect(page.getByTestId('mass-intention-display')).toContainText(intentionText);
});
```

## Next Steps

1. Add the test IDs to the components as specified above
2. Update the existing test file to use the new test IDs
3. Run the tests again to verify they pass
4. If tests still fail, investigate the server-side rendering and hydration timing issues

## Testing Philosophy

- **Use test IDs for dynamic UI sections** that are conditionally rendered based on state
- **Prefer semantic selectors** (role, label) for static UI elements
- **Add longer timeouts** for elements that depend on React hydration after SSR
- **Test behavior, not implementation** - focus on what users see and do
