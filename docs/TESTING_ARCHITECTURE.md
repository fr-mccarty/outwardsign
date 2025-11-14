# Test Architecture & Testability Guide

> **Purpose:** Standards for building testable components and writing reliable tests. Component patterns, selector strategies, and testability requirements.
>
> **See Also:**
> - **[TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md)** - Quick setup and run commands
> - **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive guide for writing tests

This document defines standards for building testable components and writing reliable tests.

## Table of Contents

- [Key Testing Principles](#key-testing-principles)
- [Selector Strategy](#selector-strategy)
- [Test ID Conventions](#test-id-conventions)
- [Component Testability Patterns](#component-testability-patterns)
- [Accessibility & Testing](#accessibility--testing)
- [Common Patterns by Component Type](#common-patterns-by-component-type)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
- [Testability Checklist](#testability-checklist)

---

## Key Testing Principles

**Quick Reference - Follow these principles when writing tests:**

1. **Use role-based selectors first** → `getByRole('button', { name: 'Save' })` > `getByLabel('Name')` > `getByTestId('form-submit')`

2. **Add `data-testid` to complex components** → Pickers, dynamic lists, cards with entity IDs, calendar events

3. **All form inputs must have proper labels** → `<Label htmlFor="name">` + `<Input id="name">` for accessibility and testability

4. **Use centralized timeout constants** → Import from `tests/utils/test-config.ts` instead of hardcoding values

5. **Follow Page Object Model for complex modules** → Encapsulate page interactions for modules with multiple tests

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

---

## Component Testability Patterns

### 1. Forms

**Requirements:**
- All inputs must have proper labels (`<Label>` + `htmlFor`)
- Submit buttons must have descriptive text
- Critical action buttons should have `data-testid` if ambiguous

#### ❌ Before - Hard to Test

```tsx
export function WeddingForm() {
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState('')

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <div className="text-sm font-medium mb-1">Wedding Notes</div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Date</div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2">
        Submit
      </div>
    </form>
  )
}
```

**Problems:**
- No `<Label>` elements with `htmlFor` - can't use `getByLabel()`
- Submit button is a `<div>` - can't use `getByRole('button')`
- No IDs on inputs - harder to target
- Not accessible for screen readers

#### ✅ After - Easy to Test

```tsx
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function WeddingForm({ wedding }: { wedding?: WeddingWithRelations }) {
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState('')

  return (
    <form onSubmit={handleSubmit}>
      <FormField>
        <Label htmlFor="notes">Wedding Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </FormField>

      <FormField>
        <Label htmlFor="wedding-date">Date</Label>
        <Input
          id="wedding-date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </FormField>

      <Button type="submit">
        {wedding ? 'Update Wedding' : 'Create Wedding'}
      </Button>
    </form>
  )
}
```

**Test code:**
```typescript
// Stable, semantic selectors
await page.getByLabel('Wedding Notes').fill('Beautiful ceremony')
await page.getByLabel('Date').fill('2025-06-15')
await page.getByRole('button', { name: 'Create Wedding' }).click()
```

---

### 2. List Pages

**Requirements:**
- Each card/item should have `data-testid` with entity ID
- "Create New" button should use consistent naming pattern
- Empty state should have clear, testable text
- Search/filter inputs should have labels or placeholders

#### ❌ Before - Hard to Test

```tsx
export function WeddingsListClient({ weddings }: { weddings: Wedding[] }) {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Weddings</h2>
        <a href="/weddings/create" className="bg-blue-500 text-white px-4 py-2">
          Add New
        </a>
      </div>

      {weddings.length === 0 ? (
        <div>No results</div>
      ) : (
        <div className="grid gap-4">
          {weddings.map(wedding => (
            <div key={wedding.id} className="border rounded p-4">
              <div className="font-semibold">
                {wedding.bride?.last_name} - {wedding.groom?.last_name}
              </div>
              <a href={`/weddings/${wedding.id}`}>View</a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Problems:**
- Heading is a styled `<h2>` but should be `<h1>` (main page heading)
- "Add New" link has generic text
- No test IDs on cards
- Empty state is too generic
- Links have no descriptive text

#### ✅ After - Easy to Test

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function WeddingsListClient({ weddings }: { weddings: Wedding[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Our Weddings</h1>
        <Button asChild>
          <Link href="/weddings/create">New Wedding</Link>
        </Button>
      </div>

      {weddings.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground mb-4">
              No weddings yet. Create your first wedding to get started.
            </p>
            <Button asChild className="mx-auto">
              <Link href="/weddings/create">Create Wedding</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {weddings.map(wedding => (
            <Card key={wedding.id} data-testid={`wedding-card-${wedding.id}`}>
              <CardHeader>
                <CardTitle>
                  {wedding.bride?.last_name} - {wedding.groom?.last_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/weddings/${wedding.id}`}>View Wedding</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Test code:**
```typescript
// Stable, semantic selectors
await expect(page.getByRole('heading', { name: 'Our Weddings' })).toBeVisible()
await page.getByRole('link', { name: 'New Wedding' }).click()

// Can target specific cards
await expect(page.getByTestId(`wedding-card-${weddingId}`)).toBeVisible()

// Empty state
await expect(page.locator('text=/No weddings yet/i')).toBeVisible()
await page.getByRole('link', { name: 'Create Wedding' }).click()
```

---

### 3. Picker Modals

**Requirements:**
- Trigger button should have `data-testid`
- Search input should have label or aria-label
- Create form should have testable submit button
- List items should have `data-testid` or be selectable by role

#### ❌ Before - Hard to Test

```tsx
export function PeoplePicker({ value, onSelect }: PickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="border rounded px-3 py-2 cursor-pointer"
      >
        {value ? value.name : 'Select person'}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50">
          <div className="bg-white rounded p-4">
            <div className="font-bold mb-2">Select Person</div>

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-2 py-1 w-full mb-4"
            />

            <div>
              {people.map(person => (
                <div
                  key={person.id}
                  onClick={() => handleSelect(person)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {person.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

**Problems:**
- Trigger is a `<div>` not a `<Button>`
- No test ID on trigger
- Search input has no label or aria-label
- Person options have no test IDs or semantic roles
- Not accessible (can't tab to elements)

#### ✅ After - Easy to Test

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PeoplePickerProps {
  value?: Person
  onSelect: (person: Person) => void
  dataTestId?: string
}

export function PeoplePicker({ value, onSelect, dataTestId }: PeoplePickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const handleSelect = (person: Person) => {
    onSelect(person)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-testid={dataTestId || 'people-picker-trigger'}
        >
          {value ? value.name : 'Select person'}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Person</DialogTitle>
          <DialogDescription>
            Choose a person from the parish directory
          </DialogDescription>
        </DialogHeader>

        <Input
          type="search"
          placeholder="Search people..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search people"
        />

        <div className="space-y-2">
          {people.map(person => (
            <Button
              key={person.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleSelect(person)}
              data-testid={`person-option-${person.id}`}
            >
              {person.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Test code:**
```typescript
// Stable, semantic selectors
await page.getByTestId('people-picker-trigger').click()
await page.getByRole('dialog').waitFor()
await page.getByLabel('Search people').fill('John')
await page.getByTestId(`person-option-${personId}`).click()

// Or use role-based
await page.getByRole('button', { name: 'Select person' }).click()
```

**Usage in forms:**
```tsx
<Label htmlFor="bride">Bride</Label>
<PeoplePicker
  value={bride}
  onSelect={setBride}
  dataTestId="bride-picker-trigger"
/>
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
```

Test with: `page.getByRole('dialog')`

---

## Common Patterns by Component Type

### Submit Buttons

```tsx
// Component
<Button type="submit" disabled={isLoading}>
  {isLoading ? 'Saving...' : (wedding ? 'Update Wedding' : 'Create Wedding')}
</Button>

// Test
await page.getByRole('button', { name: /Create Wedding|Update Wedding/i }).click()
```

### Search Inputs

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

### Select Dropdowns

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

### Date Inputs

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

### Checkboxes

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

### ❌ 6. Testing Toast Notifications

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

## Testability Checklist

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

## Summary: Quick Wins for Testability

### 1. Add Labels to All Inputs
```tsx
// Before: <input id="name" />
// After:
<Label htmlFor="name">Full Name</Label>
<Input id="name" />
```

### 2. Use Semantic Buttons
```tsx
// Before: <div onClick={handleClick}>Click me</div>
// After: <Button onClick={handleClick}>Save Changes</Button>
```

### 3. Add Test IDs to Dynamic Content
```tsx
// Before: <Card>{wedding.name}</Card>
// After: <Card data-testid={`wedding-card-${wedding.id}`}>{wedding.name}</Card>
```

### 4. Make Button Text Descriptive
```tsx
// Before: <Button>Submit</Button>
// After: <Button>{wedding ? 'Update Wedding' : 'Create Wedding'}</Button>
```

### 5. Add aria-label to Icon Buttons
```tsx
// Before: <Button><TrashIcon /></Button>
// After: <Button aria-label="Delete wedding"><TrashIcon /></Button>
```

### 6. Use Proper Headings
```tsx
// Before: <div className="text-2xl font-bold">Our Weddings</div>
// After: <h1 className="text-2xl font-bold">Our Weddings</h1>
```

---

## Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators](https://playwright.dev/docs/locators)
- [ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
- [WebAIM: Accessible Forms](https://webaim.org/techniques/forms/)
