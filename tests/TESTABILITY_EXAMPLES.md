# Testability Examples: Before & After

This document shows practical examples of improving component testability. Each example shows the "before" (harder to test) and "after" (easier to test) versions.

## Example 1: Form with Missing Labels

### ❌ Before - Hard to Test

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

      <div onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 cursor-pointer">
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

**Test code (brittle):**
```typescript
// Have to use fragile CSS selectors
await page.fill('textarea', 'Beautiful ceremony')
await page.fill('input[type="date"]', '2025-06-15')
await page.click('.bg-blue-500') // Very fragile!
```

---

### ✅ After - Easy to Test

```tsx
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function WeddingForm() {
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState('')

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="notes">Wedding Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="wedding-date">Date</Label>
          <Input
            id="wedding-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <Button type="submit">Create Wedding</Button>
      </div>
    </form>
  )
}
```

**Improvements:**
- ✅ Proper `<Label>` with `htmlFor` attributes
- ✅ Semantic `<Button>` element
- ✅ IDs on all inputs
- ✅ Descriptive button text
- ✅ Accessible to screen readers

**Test code (stable):**
```typescript
// Stable, semantic selectors
await page.getByLabel('Wedding Notes').fill('Beautiful ceremony')
await page.getByLabel('Date').fill('2025-06-15')
await page.getByRole('button', { name: 'Create Wedding' }).click()
```

---

## Example 2: List Page Without Test IDs

### ❌ Before - Hard to Test

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

**Test code (fragile):**
```typescript
// Very brittle selectors
await page.click('.bg-blue-500')
await expect(page.locator('.border').first()).toBeVisible()
await page.locator('a').filter({ hasText: 'View' }).first().click()
```

---

### ✅ After - Easy to Test

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

**Improvements:**
- ✅ Proper `<h1>` heading
- ✅ Descriptive link text ("New Wedding" not "Add New")
- ✅ Test IDs on cards with entity IDs
- ✅ Clear empty state with actionable message
- ✅ Semantic button/link components

**Test code (stable):**
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

## Example 3: Picker Modal Without Accessibility

### ❌ Before - Hard to Test

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

**Test code (fragile):**
```typescript
// Very fragile
await page.click('.cursor-pointer')
await page.fill('input[placeholder="Search..."]', 'John')
await page.click('.hover\\:bg-gray-100')
```

---

### ✅ After - Easy to Test

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

**Improvements:**
- ✅ Proper `<Dialog>` component with ARIA attributes
- ✅ Semantic `<Button>` for trigger
- ✅ Test ID on trigger (with optional override)
- ✅ `aria-label` on search input
- ✅ Test IDs on person options
- ✅ Fully keyboard accessible

**Test code (stable):**
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

## Example 4: Submit Button Without Loading State

### ❌ Before - Hard to Test

```tsx
<button type="submit" onClick={handleSubmit}>
  Submit
</button>
```

**Problems:**
- No loading state
- Generic text ("Submit" instead of "Create Wedding")
- Tests don't know when submission is complete

---

### ✅ After - Easy to Test

```tsx
import { SaveButton } from '@/components/save-button'

<SaveButton isLoading={isLoading}>
  {wedding ? 'Update Wedding' : 'Create Wedding'}
</SaveButton>
```

**Improvements:**
- ✅ Shows loading spinner
- ✅ Descriptive text that changes based on mode
- ✅ Disabled during submission
- ✅ Tests can wait for button to be re-enabled

**Test code:**
```typescript
const submitButton = page.getByRole('button', { name: /Create Wedding|Update Wedding/i })

// Click submit
await submitButton.click()

// Button shows loading state
await expect(page.getByRole('button', { name: 'Saving...' })).toBeVisible()

// Wait for completion (button re-enabled)
await expect(submitButton).toBeEnabled({ timeout: TEST_TIMEOUTS.FORM_SUBMIT })
```

---

## Example 5: Dropdown Without Proper Semantics

### ❌ Before - Hard to Test

```tsx
<div>
  <div>Status</div>
  <div onClick={() => setShowDropdown(!showDropdown)}>
    {status || 'Select...'}
  </div>
  {showDropdown && (
    <div>
      <div onClick={() => selectStatus('ACTIVE')}>Active</div>
      <div onClick={() => selectStatus('COMPLETED')}>Completed</div>
    </div>
  )}
</div>
```

**Problems:**
- No semantic `<select>` or proper `<Select>` component
- No label association
- Not keyboard accessible
- No ARIA attributes

---

### ✅ After - Easy to Test

```tsx
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<div>
  <Label htmlFor="status">Status</Label>
  <Select value={status} onValueChange={setStatus}>
    <SelectTrigger id="status">
      <SelectValue placeholder="Select status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="ACTIVE">Active</SelectItem>
      <SelectItem value="COMPLETED">Completed</SelectItem>
      <SelectItem value="CANCELLED">Cancelled</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Improvements:**
- ✅ Proper `<Select>` component with ARIA
- ✅ Label association
- ✅ Keyboard accessible
- ✅ ID for targeting

**Test code:**
```typescript
// Using ID
await page.locator('#status').click()
await page.getByRole('option', { name: 'Active' }).click()

// Or using label
await page.getByLabel('Status').click()
await page.getByRole('option', { name: 'Active' }).click()
```

---

## Summary: Quick Wins for Testability

### 1. Add Labels to All Inputs
```tsx
// Before
<input id="name" />

// After
<Label htmlFor="name">Full Name</Label>
<Input id="name" />
```

### 2. Use Semantic Buttons
```tsx
// Before
<div onClick={handleClick}>Click me</div>

// After
<Button onClick={handleClick}>Save Changes</Button>
```

### 3. Add Test IDs to Dynamic Content
```tsx
// Before
<Card>{wedding.name}</Card>

// After
<Card data-testid={`wedding-card-${wedding.id}`}>{wedding.name}</Card>
```

### 4. Make Button Text Descriptive
```tsx
// Before
<Button>Submit</Button>

// After
<Button>{wedding ? 'Update Wedding' : 'Create Wedding'}</Button>
```

### 5. Add aria-label to Icon Buttons
```tsx
// Before
<Button><TrashIcon /></Button>

// After
<Button aria-label="Delete wedding"><TrashIcon /></Button>
```

### 6. Use Proper Headings
```tsx
// Before
<div className="text-2xl font-bold">Our Weddings</div>

// After
<h1 className="text-2xl font-bold">Our Weddings</h1>
```

---

## Testing the Improvements

Before making changes:
```bash
npm run test:headed tests/weddings.spec.ts
```

After making changes:
```bash
# Tests should be faster, more stable, and easier to read
npm run test:headed tests/weddings.spec.ts
```

The same tests should pass, but with more stable selectors that won't break when styling changes.

---

## Checklist: Is My Component Testable?

- [ ] All form inputs have `<Label>` with `htmlFor`
- [ ] All buttons are semantic `<Button>` elements (not divs)
- [ ] All buttons have descriptive text or `aria-label`
- [ ] Dynamic lists have `data-testid` with entity IDs
- [ ] Pickers/modals have `data-testid` on triggers
- [ ] Search inputs have labels or `aria-label`
- [ ] Page headings use proper `<h1>`, `<h2>`, etc.
- [ ] Links have descriptive text (not "click here")
- [ ] Empty states have clear, testable text
- [ ] Loading states are visible to tests

If you can check all these boxes, your component is highly testable!
