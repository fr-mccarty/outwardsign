# Form Components

> **Part of Component Registry** - See [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) for the complete component index.

This document covers all form-related components including form inputs, buttons, and form management hooks.

---

## Table of Contents

- [Form Input Components](#form-input-components)
- [Form Button Components](#form-button-components)
- [Form Management Hooks](#form-management-hooks)

---

## See Also

- **[FORMS.md](./FORMS.md)** - Form patterns, validation, and styling requirements
- **[VALIDATION.md](./VALIDATION.md)** - React Hook Form + Zod validation patterns
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Complete component index

---

## Form Components

### FormInput (Custom Component)
**Path:** `src/components/form-input.tsx`

**Purpose:** All-in-one form field component that takes props and internally renders the complete field structure (Label + Input/Textarea/Select + description). Provides consistent styling and layout for all form inputs.

**CRITICAL:** ALL form inputs, selects, and textareas MUST use this component (unless using React Hook Form with validation, see FormField below).

**How it works:** FormInput is a **props-based component** - you pass field configuration as props, and it renders everything internally including the label (connected via `htmlFor`/`id`), the input, and optional description.

**Supported Input Types:** FormInput supports plain inputs (text, email, password, number, date, time), textareas, and select dropdowns.

**Note:** This is the simpler version without validation error handling. For forms with React Hook Form + Zod validation, use FormField (ui) instead.

**Props:**
- `id` (required): Field identifier
- `label` (required): Field label text
- `value` (required): Current field value (string)
- `onChange` (required): Value change handler
- `inputType`: `'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'textarea' | 'select'` (default: 'text')
- `description`: Optional help text below label
- `required`: Show required indicator (HTML5 validation only, no visual indicator yet)
- `placeholder`: Placeholder text (text/textarea inputs only)
- `options`: Array of `{value, label}` for select inputs
- `rows`: Number of rows for textarea
- `maxLength`: Max character length (text inputs only)
- `min`, `max`, `step`: Number/date/time input constraints

**Usage:**
```tsx
// Text input
<FormInput
  id="title"
  label="Title"
  value={title}
  onChange={setTitle}
  required
/>

// Textarea
<FormInput
  id="description"
  label="Description"
  inputType="textarea"
  value={description}
  onChange={setDescription}
  rows={10}
/>

// Select
<FormInput
  id="module"
  label="Module"
  inputType="select"
  value={module}
  onChange={setModule}
  options={[
    { value: 'weddings', label: 'Weddings' },
    { value: 'funerals', label: 'Funerals' }
  ]}
  description="Optional help text"
/>
```

### FormField (UI Component with Validation)
**Path:** `src/components/ui/form-field.tsx`

**Purpose:** Enhanced version of FormInput with validation error support. All-in-one form field component that takes props and internally renders the complete field structure (Label + Input/Textarea/Select + description + error message). Provides consistent styling, accessibility, and layout for all form inputs with validation.

**CRITICAL:** Use this component when building forms with React Hook Form + Zod validation. For simple forms without validation, use FormInput instead.

**How it works:** FormField is a **props-based component** - you pass field configuration as props, and it renders everything internally including the label (connected via `htmlFor`/`id`), the input, optional description, and error messages. Shows red asterisk for required fields.

**Supported Input Types:** FormField supports plain inputs (text, email, password, number, date, time), textareas, select dropdowns, and checkboxes. For calendar-style date pickers, use `DatePickerField`. For radio buttons, file uploads, or other complex form elements not listed, use the base shadcn/ui components directly with proper Label association.

**Props:**
- `id` (required): Field identifier
- `label` (required): Field label text
- `value` (required): Current field value (string for text/textarea/select, boolean for checkbox)
- `onChange` (required): Value change handler
- `inputType`: `'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox'` (default: 'text')
- `description`: Optional help text below label
- `required`: Show required indicator
- `disabled`: Disable the field
- `error`: Validation error message
- `placeholder`: Placeholder text (text/textarea inputs only)
- `options`: Array of `{value, label}` for select inputs
- `rows`: Number of rows for textarea
- `maxLength`: Max character length (text inputs only)
- `min`, `max`, `step`: Number/date/time input constraints

**Usage:**
```tsx
// Text input
<FormField
  id="first_name"
  label="First Name"
  value={firstName}
  onChange={setFirstName}
  required
/>

// Textarea
<FormField
  id="notes"
  label="Notes"
  inputType="textarea"
  value={notes}
  onChange={setNotes}
  rows={12}
/>

// Select
<FormField
  id="status"
  label="Status"
  inputType="select"
  value={status}
  onChange={setStatus}
  options={[
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ]}
/>

// Checkbox
<FormField
  id="is_active"
  label="Active"
  inputType="checkbox"
  description="Check to mark as active"
  value={isActive}
  onChange={setIsActive}
/>

// Number input
<FormField
  id="age"
  label="Age"
  inputType="number"
  value={age}
  onChange={setAge}
  min="0"
  max="120"
/>

// Date input
<FormField
  id="event_date"
  label="Event Date"
  inputType="date"
  value={eventDate}
  onChange={setEventDate}
/>
```

---

### DatePickerField
**Path:** `src/components/date-picker-field.tsx`

**Purpose:** Date picker field with calendar popover for selecting dates. Provides a more user-friendly date selection experience than the native HTML date input.

**When to Use:**
- Use `DatePickerField` when you need a visual calendar picker for date selection
- Use `FormField` with `inputType="date"` for simple date inputs (native browser input)

**Key Features:**
- Calendar popover with visual date selection
- Formatted date display using `formatDatePretty()`
- Optional date disabling via callback function
- Auto-close on selection (optional)
- Required field indicator
- Description text support

**Props:**
- `id`: Field identifier (optional, auto-generated from label if not provided)
- `label` (required): Field label text
- `value` (required): Selected date (`Date | undefined`)
- `onValueChange` (required): Date change handler `(date: Date | undefined) => void`
- `placeholder`: Placeholder text (default: "Select a date")
- `description`: Optional help text below the field
- `required`: Show red asterisk indicator (default: `false`)
- `disabled`: Function to disable specific dates `(date: Date) => boolean`
- `closeOnSelect`: Auto-close popover when date is selected (default: `false`)

**Usage:**
```tsx
import { DatePickerField } from '@/components/date-picker-field'

// Basic usage
const [eventDate, setEventDate] = useState<Date | undefined>()

<DatePickerField
  label="Event Date"
  value={eventDate}
  onValueChange={setEventDate}
  required
/>

// With description and disabled dates
<DatePickerField
  label="Appointment Date"
  value={appointmentDate}
  onValueChange={setAppointmentDate}
  description="Select a date for your appointment"
  disabled={(date) => date < new Date()}  // Disable past dates
  closeOnSelect
/>

// With custom placeholder
<DatePickerField
  label="Birth Date"
  value={birthDate}
  onValueChange={setBirthDate}
  placeholder="Choose birth date"
/>
```

**🔴 CRITICAL - Converting Date to String:**

This component uses a `Date` object for value. When converting to a string (for URLs, API calls, etc.), **ALWAYS use `toLocalDateString()`** to avoid timezone issues:

```tsx
import { toLocalDateString } from '@/lib/utils/formatters'

// ❌ WRONG - May shift date by a day in western timezones
const dateStr = value.toISOString().split('T')[0]

// ✅ CORRECT - Preserves local date
const dateStr = toLocalDateString(value)
```

See [FORMATTERS.md](./FORMATTERS.md#-tolocaledatestring---critical-for-date-conversion) for detailed explanation of the timezone bug.

---

### SaveButton
**Path:** `src/components/save-button.tsx`

**Purpose:** Standardized save button with loading state and spinner.

**Props:**
- `isLoading`: Show loading spinner and disable button
- `children`: Button text (default: "Save")
- Standard Button props

**Usage:**
```tsx
<SaveButton isLoading={isSubmitting}>
  Save Wedding
</SaveButton>
```

---

### CancelButton
**Path:** `src/components/cancel-button.tsx`

**Purpose:** Standardized cancel button with consistent styling and routing.

**Props:**
- `href`: Navigation target (required)
- `children`: Button text (default: "Cancel")

**Usage:**
```tsx
<CancelButton href="/weddings">
  Cancel
</CancelButton>
```

---

### DeleteButton
**Path:** `src/components/delete-button.tsx`

**Purpose:** Reusable delete button with confirmation dialog for edit views. Provides consistent delete functionality with user confirmation across all modules.

**Props:**
- `entityId`: The ID of the entity to delete (required)
- `entityType`: Display name of the entity type, e.g., "Wedding", "Funeral" (required)
- `modulePath`: Module path for redirect after deletion, e.g., "weddings", "funerals" (required)
- `onDelete`: Server action to delete the entity `(id: string) => Promise<void>` (required)
- `confirmMessage`: Optional custom confirmation message (defaults to "Are you sure you want to delete this {entityType}? This action cannot be undone.")

**Usage:**
```tsx
import { DeleteButton } from '@/components/delete-button'
import { deleteWedding } from '@/lib/actions/weddings'

<DeleteButton
  entityId={wedding.id}
  entityType="Wedding"
  modulePath="weddings"
  onDelete={deleteWedding}
/>
```

**Features:**
- Full-width destructive button styling
- Confirmation dialog before deletion
- Loading state during deletion
- Success/error toast notifications
- Automatic redirect to list page after successful deletion
- Generic and reusable across all modules

---

### FormBottomActions
**Path:** `src/components/form-bottom-actions.tsx`

**Purpose:** Standardized form action buttons at bottom of forms (Cancel + Submit).

**Props:**
- `onCancel`: Cancel handler function
- `isLoading`: Loading state for submit button
- `submitLabel`: Custom submit button text

**Usage:**
```tsx
<FormBottomActions
  onCancel={() => router.push('/weddings')}
  isLoading={isSubmitting}
  submitLabel="Create Wedding"
/>
```

---

### EventFormFields
**Path:** `src/components/event-form-fields.tsx`

**Purpose:** Reusable event form fields component for creating/editing events. Provides consistent event field UI across the application.

**Key Features:**
- Standard event fields: name, date, time, timezone, location, note
- Integrated LocationPicker for location selection
- CommonTimesModal for quick time selection
- Configurable visible/required fields
- Automatic location state management
- Error handling and validation display

**Props:**
- `formData`: Form data object
- `setFormData`: Form data setter function
- `errors`: Validation errors object
- `isEditMode`: Whether in edit mode
- `visibleFields`: Array of field names to show (default: `['location', 'note']`)
- `requiredFields`: Array of field names that are required

**Usage:**
```tsx
const [formData, setFormData] = useState({
  name: '',
  start_date: '',
  start_time: '',
  timezone: 'America/Chicago',
  location_id: null,
  note: ''
})
const [errors, setErrors] = useState({})

<EventFormFields
  formData={formData}
  setFormData={setFormData}
  errors={errors}
  isEditMode={false}
  visibleFields={['location', 'note']}
  requiredFields={['location']}
/>
```

---

### OfferingAmountInput
**Path:** `src/components/offering-amount-input.tsx`

**Purpose:** Specialized input for monetary offering amounts with quick amount buttons.

**Key Features:**
- Dollar input with automatic formatting
- Quick amount buttons popover
- Custom amount creation with labels
- Saves custom amounts to parish settings
- Optimistic UI updates
- Converts between cents and dollars automatically

**Props:**
- `id`: Input ID (default: 'offering-amount')
- `label`: Field label (default: 'Offering Amount')
- `value`: Current dollar value as string
- `onChange`: Value change handler
- `quickAmounts`: Array of `{amount: number (cents), label: string}`
- `placeholder`: Placeholder text
- `required`: Mark as required
- `className`: Additional CSS classes
- `parishId`: Parish ID for saving custom amounts
- `onQuickAmountAdded`: Callback when custom amount added

**Usage:**
```tsx
const [offeringAmount, setOfferingAmount] = useState('5.00')

<OfferingAmountInput
  label="Offering Amount"
  value={offeringAmount}
  onChange={setOfferingAmount}
  quickAmounts={[
    { amount: 100, label: '$1' },
    { amount: 500, label: '$5' },
    { amount: 1000, label: '$10' }
  ]}
  required
/>
```

**Hook - useOfferingAmount:**
```tsx
const {
  dollarValue,
  setDollarValue,
  setValueFromCents,
  getValueInCents
} = useOfferingAmount(500) // Initialize with 500 cents ($5.00)
```

---

### CommonTimesModal
**Path:** `src/components/common-times-modal.tsx`

**Purpose:** Modal for selecting common liturgical service times.

**Key Features:**
- Grid of common Mass times (7 AM - 7 PM)
- Quick selection
- Used by EventFormFields and event pickers

**Props:**
- `open`: Modal visibility state
- `onOpenChange`: Modal state handler
- `onSelectTime`: Callback when time selected (receives time string like '09:00')

**Usage:**
```tsx
const [showTimesModal, setShowTimesModal] = useState(false)

<CommonTimesModal
  open={showTimesModal}
  onOpenChange={setShowTimesModal}
  onSelectTime={(time) => {
    setEventTime(time)
  }}
/>
```

---

### DeleteRowDialog
**Path:** `src/components/delete-row-dialog.tsx`

**Purpose:** Confirmation dialog for deleting table rows/entities.

---

### CopyButton
**Path:** `src/components/copy-button.tsx`

**Purpose:** Button to copy text to clipboard with success feedback.

---

### PrintButton
**Path:** `src/components/print-button.tsx`

**Purpose:** Button to trigger browser print dialog.

---

### TestingBanner
**Path:** `src/components/testing-banner.tsx`

**Purpose:** Banner displayed in test environments to indicate test mode.

---

## Button Components

### DialogButton
**Path:** `src/components/dialog-button.tsx`

**Purpose:** Button component that triggers dialogs with proper cursor styling. Wraps the shadcn Button with DialogTrigger and automatically handles cursor-pointer to prevent CSS specificity issues from Radix UI's prop merging.

**🔴 CRITICAL:** ALWAYS use DialogButton instead of manually wrapping Button with DialogTrigger. This ensures consistent hover states across all browsers and styling contexts.

**Key Features:**
- Automatically applies `cursor-pointer` className
- Accepts all standard Button props (variant, size, className, onClick, etc.)
- Handles Radix UI `asChild` prop merging correctly
- Reduces boilerplate and ensures consistency

**Props:**
- All props from `Button` component (variant, size, className, disabled, onClick, etc.)
- `children`: Button content (required)

**Usage:**
```tsx
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { DialogButton } from '@/components/dialog-button'

// Basic usage
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogButton>
    <Plus className="h-4 w-4 mr-2" />
    Create New
  </DialogButton>
  <DialogContent>
    {/* Dialog content */}
  </DialogContent>
</Dialog>

// With variant and className
<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <DialogButton variant="destructive" className="w-full">
    <Trash2 className="h-4 w-4 mr-2" />
    Delete
  </DialogButton>
  <DialogContent>
    {/* Confirmation dialog */}
  </DialogContent>
</Dialog>

// With onClick handler
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogButton onClick={handleDialogOpen} variant="outline">
    <Settings className="h-4 w-4 mr-2" />
    Settings
  </DialogButton>
  <DialogContent>
    {/* Settings dialog */}
  </DialogContent>
</Dialog>
```

**Why this component exists:**
When `DialogTrigger` uses `asChild`, Radix UI merges props with the child component through polymorphism. This can cause CSS specificity issues that override the browser's default button cursor, resulting in inconsistent hover states. DialogButton solves this automatically by always including `cursor-pointer` in the className.

**❌ Don't do this:**
```tsx
// Manual wrapping - inconsistent cursor behavior
<DialogTrigger asChild>
  <Button>Create New</Button>
</DialogTrigger>
```

**✅ Do this instead:**
```tsx
// Use DialogButton - guaranteed consistent behavior
<DialogButton>Create New</DialogButton>
```

---

## Custom Hooks

### usePickerState
**Path:** `src/hooks/use-picker-state.ts`

**Purpose:** Reduces boilerplate for managing modal picker state.

**Returns:**
- `value`: Selected entity
- `setValue`: Set selected entity
- `showPicker`: Modal visibility state
- `setShowPicker`: Toggle modal

**Usage:**
```tsx
const bride = usePickerState<Person>()

// Use in component:
bride.value          // Current selected person
bride.setValue(p)    // Set person
bride.showPicker     // Modal open state
bride.setShowPicker(true)  // Open modal
```

---

### useListFilters
**Path:** `src/hooks/use-list-filters.ts`

**Purpose:** Manages list view filters in URL parameters with consistent pattern across all module list views. Handles URL parameter updates, filter clearing, and page state management.

**Parameters:**
- `baseUrl`: The base URL for the list view (e.g., '/weddings')
- `defaultFilters`: Default filter values (optional, e.g., `{ status: 'all', sort: 'date_asc' }`)

**Returns:**
- `updateFilter(key, value)`: Update a single filter value in URL
- `clearFilters()`: Clear all filters and return to base URL
- `getFilterValue(key)`: Get current value of a filter from URL
- `hasActiveFilters`: Boolean indicating if any non-default filters are active

**Usage:**
```tsx
const filters = useListFilters({
  baseUrl: '/weddings',
  defaultFilters: { status: 'all', sort: 'date_asc' }
})

// Update a filter
filters.updateFilter('status', 'ACTIVE')

// Get current filter value
const currentStatus = filters.getFilterValue('status')

// Clear all filters
filters.clearFilters()

// Check if filters are active
if (filters.hasActiveFilters) {
  // Show clear button
}
```

**Behavior:**
- Automatically resets to page 1 when filters change (unless updating page param)
- Removes parameter from URL when value matches default or is empty
- Page parameter is not considered for `hasActiveFilters` check

---

### useAvatarUrls
**Path:** `src/hooks/use-avatar-urls.ts`

**Purpose:** Fetches signed URLs for person avatar images. Automatically calls `getPersonAvatarSignedUrls()` server action when people array changes.

**Parameters:**
- `people`: Array of person objects with `id` and `avatar_url` properties

**Returns:**
- `Record<string, string>`: Mapping of person.id to signed URL

**Usage:**
```tsx
const people = [person1, person2, person3]
const avatarUrls = useAvatarUrls(people)

// Access signed URL by person ID
<img src={avatarUrls[person.id]} alt={person.full_name} />
```

**Behavior:**
- Only fetches URLs for people with avatar_url values
- Re-fetches when people array changes
- Handles errors gracefully with console.error
- Returns empty object initially, populates on mount

---

### useScrollPosition
**Path:** `src/hooks/use-scroll-position.ts`

**Purpose:** Tracks window scroll position for showing/hiding scroll-to-top button.

**Parameters:**
- `threshold`: Scroll position threshold in pixels (default: 300)

**Returns:**
- `scrollY`: Current scroll position (number)
- `isAboveThreshold`: Boolean indicating if scrollY > threshold

**Usage:**
```tsx
const { scrollY, isAboveThreshold } = useScrollPosition(300)

// Show button when scrolled past threshold
{isAboveThreshold && <ScrollToTopButton />}
```

**Behavior:**
- Uses passive event listener for performance
- Cleans up event listener on unmount
- Updates on every scroll event

---

### useInfiniteScroll
**Path:** `src/hooks/use-infinite-scroll.ts`

**Purpose:** Handles infinite scroll logic for loading more results using IntersectionObserver. Detects when sentinel element is visible and triggers load more callback.

**Parameters:**
- `loadMore`: Callback to fetch next page `() => void`
- `hasMore`: Boolean indicating if more results exist

**Returns:**
- `sentinelRef`: RefObject to attach to bottom element
- `isLoading`: Boolean indicating if currently loading

**Usage:**
```tsx
const { sentinelRef, isLoading } = useInfiniteScroll({
  loadMore: () => fetchNextPage(),
  hasMore: hasMoreResults
})

// Attach sentinel ref to bottom element
<div ref={sentinelRef} />

// Show loading indicator
{isLoading && <Spinner />}
```

**Behavior:**
- Automatically triggers `loadMore` when sentinel is visible and `hasMore` is true
- Configurable threshold (default 100px from bottom)
- Cleans up IntersectionObserver on unmount
- Prevents multiple simultaneous loads via isLoading state

---

### useMobile
**Path:** `src/hooks/use-mobile.ts`

**Purpose:** Detects if viewport is mobile size (< 768px). Uses window resize event with debouncing.

**Returns:**
- `boolean`: True if viewport width < 768px

**Usage:**
```tsx
const isMobile = useMobile()

// Conditionally render based on screen size
{isMobile ? <MobileView /> : <DesktopView />}
```

**Behavior:**
- SSR-safe (returns false on server)
- Uses debounced resize listener for performance
- Updates on window resize
- Cleans up listener on unmount

---

