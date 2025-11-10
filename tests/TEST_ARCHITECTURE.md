# Test Architecture & Testability Guide

This document defines how to structure the application to be testable and maintainable. These patterns ensure that both human developers and AI agents can write reliable, stable tests.

## Key Testing Principles

**Quick Reference - Follow these principles when writing tests:**

1. **Use role-based selectors first** → `getByRole('button', { name: 'Save' })` > `getByLabel('Name')` > `getByTestId('form-submit')` ([Details](#selector-strategy))

2. **Add `data-testid` to complex components** → Pickers, dynamic lists, cards with entity IDs, calendar events ([Details](#test-id-conventions))

3. **All form inputs must have proper labels** → `<Label htmlFor="name">` + `<Input id="name">` for accessibility and testability ([Details](#component-testability-patterns))

4. **Use centralized timeout constants** → Import from `tests/utils/test-config.ts` instead of hardcoding values ([Details](#anti-patterns-to-avoid))

5. **Follow Page Object Model for complex modules** → Encapsulate page interactions for modules with multiple tests ([Details](#page-object-model))

---

## Table of Contents

- [Selector Strategy](#selector-strategy)
- [Test ID Conventions](#test-id-conventions)
- [Component Testability Patterns](#component-testability-patterns)
- [Page Object Model](#page-object-model)
- [Accessibility & Testing](#accessibility--testing)
- [Common Patterns by Component Type](#common-patterns-by-component-type)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Selector Strategy

### Priority Order (Best to Worst)

Use selectors in this priority order:

1. **Role-based selectors** (Best - Accessible & Stable)
   ```typescript
   page.getByRole('button', { name: 'Save Wedding' })
   page.getByRole('heading', { name: 'Create Event' })
   page.getByRole('link', { name: /New Wedding/i })
   ```

2. **Label text** (Good - User-facing)
   ```typescript
   page.getByLabel('Event Name')
   page.getByLabel('Bride')
   ```

3. **Test IDs** (Good - Explicit test hooks)
   ```typescript
   page.getByTestId('wedding-form-submit')
   page.getByTestId('bride-picker-trigger')
   ```

4. **HTML IDs** (Acceptable - Form fields)
   ```typescript
   page.locator('#name')
   page.locator('#start_date')
   ```

5. **Text content** (Use sparingly - Fragile)
   ```typescript
   page.locator('text=Event created successfully')
   ```

6. **CSS selectors** (Last resort - Very fragile)
   ```typescript
   page.locator('button.primary') // Avoid if possible
   ```

### When to Use Each

| Selector Type | Use Case | Example |
|--------------|----------|---------|
| `getByRole` | Buttons, links, headings, inputs with proper semantics | Navigation, form submission |
| `getByLabel` | Form fields with labels | Input fields, textareas, selects |
| `getByTestId` | Complex components, dynamic content, lists | Card grids, picker modals, calendar events |
| `#id` | Form inputs that have IDs | Simple form fields |
| `text=` | Toast messages, confirmation dialogs | Success/error notifications |

---

## Test ID Conventions

### Naming Pattern

```
data-testid="{module}-{component}-{element}-{action}"
```

### Examples

```typescript
// Module forms
data-testid="wedding-form"
data-testid="wedding-form-submit"
data-testid="wedding-form-cancel"

// Pickers
data-testid="bride-picker-trigger"
data-testid="bride-picker-search"
data-testid="bride-picker-create"

// List items
data-testid="wedding-card-12345"
data-testid="event-list-item-67890"

// Actions
data-testid="wedding-delete-button"
data-testid="event-edit-link"

// Status indicators
data-testid="wedding-status-badge"
data-testid="event-date-display"
```

### When to Add Test IDs

**✅ ADD test IDs for:**
- Complex interactive components (pickers, modals, calendars)
- Dynamic lists where count/order matters
- Components that are hard to target with role/label selectors
- Action buttons in cards/panels when multiple similar buttons exist
- Status indicators and badges

**❌ DON'T add test IDs for:**
- Simple form inputs (use labels or IDs)
- Buttons with unique, stable text (use role + name)
- Headings and static text (use role or text content)
- Links with descriptive text (use role + name)

### Implementation

```tsx
// ✅ CORRECT - Add to complex components
export function WeddingCard({ wedding }: { wedding: Wedding }) {
  return (
    <Card data-testid={`wedding-card-${wedding.id}`}>
      <CardHeader>
        <CardTitle>{wedding.bride?.last_name} - {wedding.groom?.last_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          data-testid={`wedding-view-${wedding.id}`}
          asChild
        >
          <Link href={`/weddings/${wedding.id}`}>View</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ✅ CORRECT - Simple buttons don't need test IDs
<Button type="submit">Save Wedding</Button> // Use getByRole('button', { name: 'Save Wedding' })

// ✅ CORRECT - Form fields with labels don't need test IDs
<Label htmlFor="bride-name">Bride Name</Label>
<Input id="bride-name" /> // Use getByLabel('Bride Name')
```

---

## Component Testability Patterns

### Forms

**Requirements:**
- All inputs must have proper labels (`<Label>` + `htmlFor`)
- Submit buttons must have descriptive text
- Form should have `id` attribute if used in wrapper
- Critical action buttons should have `data-testid`

```tsx
// ✅ CORRECT - Testable form
export function WeddingForm({ wedding }: { wedding?: WeddingWithRelations }) {
  return (
    <form onSubmit={handleSubmit}>
      <FormField>
        <Label htmlFor="notes">Wedding Notes</Label>
        <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
      </FormField>

      <FormField>
        <Label htmlFor="bride">Bride</Label>
        <PeoplePicker
          value={bride.value}
          onSelect={bride.setValue}
          placeholder="Select bride"
          data-testid="bride-picker-trigger"
        />
      </FormField>

      <Button type="submit">
        {wedding ? 'Update Wedding' : 'Create Wedding'}
      </Button>
      <Button type="button" variant="outline" onClick={() => router.back()}>
        Cancel
      </Button>
    </form>
  )
}
```

### List Pages

**Requirements:**
- Each card/item should have `data-testid` with entity ID
- "Create New" button should use consistent naming pattern
- Empty state should have clear, testable text
- Search/filter inputs should have labels or placeholders

```tsx
// ✅ CORRECT - Testable list page
export function WeddingsListClient({ initialData }: { initialData: Wedding[] }) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1>Our Weddings</h1>
        <Button asChild>
          <Link href="/weddings/create">New Wedding</Link>
        </Button>
      </div>

      {weddings.length === 0 ? (
        <Card>
          <CardContent>
            <p>No weddings yet. Create your first wedding to get started.</p>
            <Button asChild>
              <Link href="/weddings/create">Create Wedding</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {weddings.map(wedding => (
            <Card key={wedding.id} data-testid={`wedding-card-${wedding.id}`}>
              {/* Card content */}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
```

### Picker Modals

**Requirements:**
- Trigger button should have `data-testid`
- Search input should have label or aria-label
- Create form should have testable submit button
- List items should have `data-testid` or be selectable by role

```tsx
// ✅ CORRECT - Testable picker
export function PeoplePicker({ value, onSelect, dataTestId }: PickerProps) {
  return (
    <Dialog open={showPicker} onOpenChange={setShowPicker}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          data-testid={dataTestId || 'people-picker-trigger'}
        >
          {value ? value.name : 'Select person'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Person</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search people..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          aria-label="Search people"
        />

        <div className="space-y-2">
          {people.map(person => (
            <Button
              key={person.id}
              data-testid={`person-option-${person.id}`}
              onClick={() => handleSelect(person)}
            >
              {person.name}
            </Button>
          ))}
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreatePerson}>
            <Input id="person-name" placeholder="Full name" />
            <Button type="submit" data-testid="person-create-submit">
              Create Person
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
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
import { TEST_TIMEOUTS, TEST_SELECTORS } from '../utils/test-config'

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
    await this.page.fill('[aria-label="Search people"]', brideName)
    await this.page.getByRole('button', { name: brideName }).click()
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /Create Wedding|Update Wedding/i }).click()
  }

  async waitForSuccessToast() {
    await this.page.waitForSelector(TEST_SELECTORS.TOAST_SUCCESS, {
      timeout: TEST_TIMEOUTS.TOAST
    })
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
    await weddingPage.selectBride('Maria Garcia')

    // Submit
    await weddingPage.submitForm()
    await weddingPage.waitForSuccessToast()
    await weddingPage.waitForViewPage()

    // Verify
    await expect(page.locator('text=Beautiful outdoor ceremony')).toBeVisible()
  })
})
```

---

## Accessibility & Testing

**IMPORTANT:** Improving accessibility also improves testability. The same semantic HTML that helps screen readers also helps test selectors.

### Required Accessibility Patterns

#### 1. Buttons

```tsx
// ✅ CORRECT - Accessible and testable
<Button type="submit">Create Wedding</Button>
<Button onClick={handleDelete} aria-label="Delete wedding">
  <TrashIcon />
</Button>

// ❌ WRONG - Not accessible or testable
<div onClick={handleSubmit}>Submit</div> // Not a button
<Button><TrashIcon /></Button> // No text or aria-label
```

Test with: `page.getByRole('button', { name: 'Create Wedding' })`

#### 2. Form Fields

```tsx
// ✅ CORRECT - Accessible and testable
<Label htmlFor="bride-name">Bride Name</Label>
<Input id="bride-name" value={brideName} />

// ✅ CORRECT - Using aria-label when visual label isn't appropriate
<Input
  placeholder="Search people..."
  aria-label="Search people"
  value={search}
/>

// ❌ WRONG - Not accessible or testable
<div>Bride Name</div>
<Input value={brideName} /> // No label association
```

Test with: `page.getByLabel('Bride Name')`

#### 3. Headings

```tsx
// ✅ CORRECT - Proper heading hierarchy
<h1>Our Weddings</h1>
<h2>Wedding Details</h2>

// ❌ WRONG - Div with styling
<div className="text-2xl font-bold">Our Weddings</div>
```

Test with: `page.getByRole('heading', { name: 'Our Weddings' })`

#### 4. Links

```tsx
// ✅ CORRECT - Descriptive link text
<Link href="/weddings/create">New Wedding</Link>
<Link href={`/weddings/${wedding.id}`}>View Wedding Details</Link>

// ❌ WRONG - Generic text
<Link href="/weddings/123">Click here</Link>
```

Test with: `page.getByRole('link', { name: /New Wedding/i })`

#### 5. Dialogs/Modals

```tsx
// ✅ CORRECT - Proper dialog structure
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent aria-describedby="dialog-description">
    <DialogHeader>
      <DialogTitle>Select Person</DialogTitle>
      <DialogDescription id="dialog-description">
        Choose a person from the list or create a new one
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>

// Test with: page.getByRole('dialog')
```

---

## Common Patterns by Component Type

### 1. Submit Buttons

```tsx
// Component
<Button type="submit" disabled={isLoading}>
  {isLoading ? 'Saving...' : (wedding ? 'Update Wedding' : 'Create Wedding')}
</Button>

// Test
await page.getByRole('button', { name: /Create Wedding|Update Wedding/i }).click()
```

### 2. Cancel/Back Buttons

```tsx
// Component
<Button type="button" variant="outline" onClick={() => router.back()}>
  Cancel
</Button>

// Test
await page.getByRole('button', { name: 'Cancel' }).click()
```

### 3. Search Inputs

```tsx
// Component
<Input
  type="search"
  placeholder="Search weddings..."
  aria-label="Search weddings"
  value={search}
  onChange={e => setSearch(e.target.value)}
/>

// Test
await page.getByLabel('Search weddings').fill('Garcia')
```

### 4. Select Dropdowns

```tsx
// Component (using shadcn Select)
<Select value={status} onValueChange={setStatus}>
  <SelectTrigger id="status">
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="ACTIVE">Active</SelectItem>
    <SelectItem value="COMPLETED">Completed</SelectItem>
  </SelectContent>
</Select>

// Test
await page.locator('#status').click()
await page.getByRole('option', { name: 'Active' }).click()
```

### 5. Date Inputs

```tsx
// Component
<Label htmlFor="wedding-date">Wedding Date</Label>
<Input
  id="wedding-date"
  type="date"
  value={weddingDate}
  onChange={e => setWeddingDate(e.target.value)}
/>

// Test
await page.fill('#wedding-date', '2025-06-15')
// OR
await page.getByLabel('Wedding Date').fill('2025-06-15')
```

### 6. Textareas

```tsx
// Component
<Label htmlFor="notes">Notes</Label>
<Textarea
  id="notes"
  value={notes}
  onChange={e => setNotes(e.target.value)}
  placeholder="Add any special notes..."
/>

// Test
await page.fill('#notes', 'Beautiful outdoor ceremony')
// OR
await page.getByLabel('Notes').fill('Beautiful outdoor ceremony')
```

### 7. Checkboxes

```tsx
// Component
<div className="flex items-center space-x-2">
  <Checkbox
    id="has-rehearsal"
    checked={hasRehearsal}
    onCheckedChange={setHasRehearsal}
  />
  <Label htmlFor="has-rehearsal">Include Rehearsal</Label>
</div>

// Test
await page.getByRole('checkbox', { name: 'Include Rehearsal' }).check()
```

### 8. Status Badges

```tsx
// Component
<Badge data-testid={`wedding-status-${wedding.id}`}>
  {wedding.status}
</Badge>

// Test
await expect(page.getByTestId(`wedding-status-${weddingId}`)).toHaveText('Active')
```

---

## Anti-Patterns to Avoid

### ❌ 1. Using Generic Selectors

```typescript
// ❌ WRONG - Too generic, fragile
await page.click('button')
await page.fill('input', 'value')

// ✅ CORRECT - Specific and stable
await page.getByRole('button', { name: 'Save Wedding' }).click()
await page.getByLabel('Event Name').fill('Parish Meeting')
```

### ❌ 2. Relying on CSS Classes

```typescript
// ❌ WRONG - Classes can change with styling
await page.click('.btn-primary')
await page.locator('.wedding-card').first()

// ✅ CORRECT - Use semantic selectors or test IDs
await page.getByRole('button', { name: 'Create Wedding' }).click()
await page.getByTestId('wedding-card-123')
```

### ❌ 3. Using nth() Without Reason

```typescript
// ❌ WRONG - Brittle, order-dependent
await page.locator('button').nth(2).click()

// ✅ CORRECT - Specific targeting
await page.getByRole('button', { name: 'Save' }).click()
```

### ❌ 4. Hard-coding Timeouts Everywhere

```typescript
// ❌ WRONG - Magic numbers scattered throughout
await page.waitForSelector('text=Success', { timeout: 5000 })
await page.waitForURL('/weddings', { timeout: 10000 })

// ✅ CORRECT - Use centralized constants
import { TEST_TIMEOUTS } from './utils/test-config'
await page.waitForSelector('text=Success', { timeout: TEST_TIMEOUTS.TOAST })
await page.waitForURL('/weddings', { timeout: TEST_TIMEOUTS.NAVIGATION })
```

### ❌ 5. Not Waiting for Navigation

```typescript
// ❌ WRONG - Race condition
await page.click('button[type="submit"]')
await expect(page).toHaveURL('/weddings/123') // Might fail

// ✅ CORRECT - Wait for navigation
await page.click('button[type="submit"]')
await page.waitForURL(/\/weddings\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT })
```

### ❌ 6. Testing Implementation Details

```typescript
// ❌ WRONG - Testing internal state
expect(component.state.isLoading).toBe(true)

// ✅ CORRECT - Testing user-visible behavior
await expect(page.getByRole('button', { name: 'Saving...' })).toBeVisible()
```

### ❌ 7. Testing Toast Notifications

**IMPORTANT: Do not test for toast/notification messages after successful form submissions.**

**Why?**
- Toasts are ephemeral UI feedback, not a source of truth
- They create timing race conditions (appear/disappear quickly)
- Navigation proves success better than a temporary notification
- If toast library changes, tests break unnecessarily

**What to test instead:**
- URL navigation (redirects prove the operation succeeded)
- Data visibility on the destination page
- Database state changes (if needed)

```typescript
// ❌ WRONG - Waiting for toast
await page.click('button[type="submit"]')
await page.waitForSelector('text=/created successfully/i', { timeout: 3000 })
await page.waitForURL('/events/123')

// ✅ CORRECT - Just wait for navigation
await page.click('button[type="submit"]')
await page.waitForURL(/\/events\/[a-f0-9-]+$/, { timeout: 5000 })
// Navigation itself proves the form submission succeeded

// ✅ ALSO GOOD - Verify data on destination page
await page.click('button[type="submit"]')
await page.waitForURL(/\/events\/[a-f0-9-]+$/)
await expect(page.getByRole('heading', { name: eventName })).toBeVisible()
```

**Exception:** You MAY test for error toasts when there's no navigation (validation errors, API failures) because the toast is the only user feedback.

```typescript
// ✅ ACCEPTABLE - Testing error feedback
await page.click('button[type="submit"]')
await expect(page.locator('text=/error|failed/i')).toBeVisible()
await expect(page).toHaveURL('/events/create') // Still on form page
```

---

## Summary Checklist

When building a new component or module, ensure:

- [ ] **Forms:**
  - All inputs have proper labels (`<Label>` + `htmlFor`)
  - Submit button has descriptive text
  - Action buttons are semantic `<Button>` elements

- [ ] **Lists:**
  - Cards/items have `data-testid` with entity ID
  - Empty state has clear, testable text
  - "Create New" link uses consistent naming

- [ ] **Pickers/Modals:**
  - Trigger button has `data-testid` or descriptive text
  - Search input has label or `aria-label`
  - Selectable items have test IDs or roles

- [ ] **Navigation:**
  - Links have descriptive text
  - Breadcrumbs use proper `<nav>` with `aria-label="breadcrumb"`

- [ ] **Accessibility:**
  - Proper heading hierarchy (`h1`, `h2`, `h3`)
  - Buttons for actions, not divs with onClick
  - Form fields associated with labels

- [ ] **Test Coverage:**
  - Can create new entity
  - Can edit existing entity
  - Can view entity details
  - Empty state is tested
  - Validation errors are tested

---

## Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators](https://playwright.dev/docs/locators)
- [ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
- [WebAIM: Accessible Forms](https://webaim.org/techniques/forms/)
