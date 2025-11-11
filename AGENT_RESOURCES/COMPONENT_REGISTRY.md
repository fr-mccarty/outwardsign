# Component Registry

A comprehensive catalog of reusable components in the Outward Sign application. This registry helps AI agents and developers quickly understand component purposes without reading source code.

---

## Table of Contents

- [Form Components](#form-components)
- [Picker Components](#picker-components)
- [Layout Components](#layout-components)
- [Display Components](#display-components)
- [UI Components (shadcn/ui)](#ui-components-shadcnui)

---

## Form Components

### FormField
**Path:** `src/components/ui/form-field.tsx`

**Purpose:** Standardized form field wrapper that handles labels, descriptions, error messages, and consistent styling for all form inputs.

**CRITICAL:** ALL form inputs, selects, and textareas MUST use this component.

**Current Limitation:** FormField currently supports plain inputs (text, email, password), textareas, and select dropdowns only. It does NOT support checkboxes, radio buttons, date pickers, file uploads, or other complex form elements. For those, use the base shadcn/ui components directly with proper Label association.

**Props:**
- `id` (required): Field identifier
- `label` (required): Field label text
- `value` (required): Current field value
- `onChange` (required): Value change handler
- `inputType`: `'text' | 'email' | 'password' | 'textarea' | 'select'` (default: 'text')
- `description`: Optional help text below label
- `required`: Show required indicator
- `disabled`: Disable the field
- `error`: Validation error message
- `placeholder`: Placeholder text
- `options`: Array of `{value, label}` for select inputs
- `rows`: Number of rows for textarea
- `maxLength`: Max character length

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
```

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

## Picker Components

### PeoplePicker
**Path:** `src/components/people-picker.tsx`

**Purpose:** Modal dialog for searching and selecting people from parish directory with inline person creation.

**Key Features:**
- Debounced search
- Avatar display with initials
- Inline person creation form
- Auto-select newly created person
- NO REDIRECT after creation (stays in parent form)

**Props:**
- `open`: Control modal visibility
- `onOpenChange`: Modal state handler
- `onSelect`: Callback when person is selected
- `selectedPersonId`: Highlight selected person
- `placeholder`: Search placeholder text
- `emptyMessage`: Empty state message
- `showSexField`: Show sex field in create form
- `openToNewPerson`: Auto-open create form (for create mode)

**Usage:**
```tsx
const bride = usePickerState<Person>()

<PeoplePicker
  open={bride.showPicker}
  onOpenChange={bride.setShowPicker}
  onSelect={bride.setValue}
  selectedPersonId={bride.value?.id}
  openToNewPerson={!isEditing}
/>
```

---

### EventPicker
**Path:** `src/components/event-picker.tsx`

**Purpose:** Modal dialog for searching and selecting events with inline event creation.

**Key Features:**
- Search with debouncing
- Event date/time/location display
- Inline event creation form
- Auto-select newly created event
- NO REDIRECT after creation

**Props:**
- `open`: Control modal visibility
- `onOpenChange`: Modal state handler
- `onSelect`: Callback when event is selected
- `selectedEventId`: Highlight selected event
- `openToNewEvent`: Auto-open create form (for create mode)

**Usage:**
```tsx
const event = usePickerState<Event>()

<EventPicker
  open={event.showPicker}
  onOpenChange={event.setShowPicker}
  onSelect={event.setValue}
  selectedEventId={event.value?.id}
  openToNewEvent={!isEditing}
/>
```

---

### LocationPicker
**Path:** `src/components/location-picker.tsx`

**Purpose:** Modal dialog for searching and selecting locations with inline location creation.

**Props:**
- `open`: Control modal visibility
- `onOpenChange`: Modal state handler
- `onSelect`: Callback when location is selected
- `selectedLocationId`: Highlight selected location

---

### ReadingPickerModal
**Path:** `src/components/reading-picker-modal.tsx`

**Purpose:** Modal dialog for selecting scripture readings with category filtering.

**Props:**
- `open`: Control modal visibility
- `onOpenChange`: Modal state handler
- `onSelect`: Callback when reading is selected

---

### RolePicker
**Path:** `src/components/role-picker.tsx`

**Purpose:** Dropdown for selecting user roles (super-admin, admin, staff, parishioner).

**Props:**
- `value`: Current role
- `onChange`: Role change handler

---

## Layout Components

### PageContainer
**Path:** `src/components/page-container.tsx`

**Purpose:** Standard page wrapper with consistent padding and max-width.

**Usage:**
```tsx
<PageContainer>
  <h1>Page Title</h1>
  {/* Page content */}
</PageContainer>
```

---

### BreadcrumbSetter
**Path:** `src/components/breadcrumb-setter.tsx`

**Purpose:** Client component that sets breadcrumbs in context. Returns null (invisible).

**Props:**
- `breadcrumbs`: Array of `{label, href}` objects

**Usage:**
```tsx
// In server component
const breadcrumbs = [
  { label: 'Weddings', href: '/weddings' },
  { label: wedding.id, href: `/weddings/${wedding.id}` }
]

<BreadcrumbSetter breadcrumbs={breadcrumbs} />
```

---

### MainSidebar
**Path:** `src/components/main-sidebar.tsx`

**Purpose:** Application navigation sidebar with module links and icons.

**Module Icons (Source of Truth):**
- Weddings: `VenusAndMars`
- Funerals: `Cross`
- Baptisms: `Droplet`
- Presentations: `HandHeartIcon`
- Quinceañeras: `BookHeart`
- Confirmations: `Flame`

---

## Display Components

### ModuleViewPanel
**Path:** `src/components/module-view-panel.tsx`

**Purpose:** Reusable side panel for module view pages showing Edit button, Print view, PDF/Word downloads, and metadata.

**Props:**
- `entity`: Entity being viewed (must have id, status, created_at)
- `entityType`: Display name (e.g., "Wedding", "Funeral")
- `modulePath`: URL path (e.g., "weddings", "funerals")
- `mainEvent`: Optional event for location display
- `generateFilename`: Function to generate download filenames
- `printViewPath`: Optional custom print path

**Usage:**
```tsx
<ModuleViewPanel
  entity={wedding}
  entityType="Wedding"
  modulePath="weddings"
  mainEvent={wedding.wedding_event}
  generateFilename={(ext) => `wedding-${wedding.id}.${ext}`}
/>
```

---

### ModuleViewContainer
**Path:** `src/components/module-view-container.tsx`

**Purpose:** Complete view page container with side panel + liturgy content. Uses callback pattern for module-specific logic.

**Props:**
- `entity`: Entity with relations
- `entityType`: Display name
- `modulePath`: URL path
- `mainEvent`: Optional event
- `generateFilename`: Filename generator function
- `buildLiturgy`: Liturgy builder function
- `getTemplateId`: Template ID extractor function
- `printViewPath`: Optional custom print path

**Usage:**
```tsx
<ModuleViewContainer
  entity={wedding}
  entityType="Wedding"
  modulePath="weddings"
  mainEvent={wedding.wedding_event}
  generateFilename={(ext) => `wedding-${wedding.id}.${ext}`}
  buildLiturgy={buildWeddingLiturgy}
  getTemplateId={(w) => w.wedding_template_id || 'default'}
/>
```

---

### EventDisplay
**Path:** `src/components/event-display.tsx`

**Purpose:** Display event date, time, and location in a formatted card.

**Props:**
- `event`: Event object with start_date, start_time, location

---

### PetitionEditor
**Path:** `src/components/petition-editor.tsx`

**Purpose:** Editor for liturgical petitions with template insertion.

**Props:**
- `value`: Current petitions text
- `onChange`: Change handler
- `templates`: Array of petition templates
- `onInsertTemplate`: Template insertion handler

---

## UI Components (shadcn/ui)

### Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
**Path:** `src/components/ui/card.tsx`

**Purpose:** Container components for grouping related content.

---

### Button
**Path:** `src/components/ui/button.tsx`

**Purpose:** Standard button with variants (default, destructive, outline, ghost, link).

**Variants:**
- `default`: Primary button
- `destructive`: Red button for dangerous actions
- `outline`: Bordered button
- `ghost`: Transparent button
- `link`: Text link styled as button

---

### Input
**Path:** `src/components/ui/input.tsx`

**Purpose:** Base input component. **DO NOT USE DIRECTLY** - always wrap with FormField.

---

### Textarea
**Path:** `src/components/ui/textarea.tsx`

**Purpose:** Base textarea component. **DO NOT USE DIRECTLY** - always wrap with FormField.

---

### Select, SelectTrigger, SelectValue, SelectContent, SelectItem
**Path:** `src/components/ui/select.tsx`

**Purpose:** Dropdown select components from Radix UI. **DO NOT USE DIRECTLY** - always wrap with FormField.

---

### Label
**Path:** `src/components/ui/label.tsx`

**Purpose:** Form label component. **DO NOT USE DIRECTLY** - FormField handles labels automatically.

---

### Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
**Path:** `src/components/ui/dialog.tsx`

**Purpose:** Modal dialog components from Radix UI.

---

### Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandSeparator
**Path:** `src/components/ui/command.tsx`

**Purpose:** Command palette / search list components. Used in picker components.

---

### Badge
**Path:** `src/components/ui/badge.tsx`

**Purpose:** Small label badge for status indicators.

---

### Avatar, AvatarImage, AvatarFallback
**Path:** `src/components/ui/avatar.tsx`

**Purpose:** User avatar display with fallback initials.

---

### Separator
**Path:** `src/components/ui/separator.tsx`

**Purpose:** Horizontal or vertical divider line.

---

### Tabs, TabsList, TabsTrigger, TabsContent
**Path:** `src/components/ui/tabs.tsx`

**Purpose:** Tabbed interface components.

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

## Notes

- **FormField is required** for all form inputs, selects, and textareas (except within picker components)
- **Picker components** handle their own internal form structure - they don't need FormField
- **List client components** can use bare Input for search/filter functionality outside of forms
- **Module icons** are defined in MainSidebar component - this is the source of truth
- **Dark mode** is supported throughout - use semantic color tokens, never hardcoded colors

