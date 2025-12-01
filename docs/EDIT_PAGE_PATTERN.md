# Edit Page Pattern

> **🔴 Context Requirement:** When implementing edit pages for any module, you MUST include this file in your context. This file contains the authoritative pattern for all edit pages to ensure consistency across the application.

**Reference Implementation:** Wedding module (`src/app/(main)/weddings/[id]/edit/`)

---

## Overview

Every module edit page follows a consistent pattern:
1. **Server Page** (`[id]/edit/page.tsx`) - Fetches entity, passes to form wrapper with breadcrumbs
2. **Form Wrapper** (`[entity]-form-wrapper.tsx`) - Wraps form in PageContainer, manages save button state
3. **Unified Form** (`[entity]-form.tsx`) - Single form component that handles both create and edit modes

**Key Difference from Create Page:**
- Edit page passes `entity` prop to form wrapper
- Form wrapper shows "View" button in additionalActions
- Form detects edit mode via presence of `entity` prop

This consistency ensures:
- Single form component for both create and edit
- Consistent save button behavior
- Proper loading states
- Easy navigation between view and edit

---

## Server Page Pattern

**File:** `page.tsx` in `app/(main)/[entity-plural]/[id]/edit/`

### Pattern Reference

**See:** `src/app/(main)/weddings/[id]/edit/page.tsx` for the complete implementation.

**Key elements:**
- Parse `params` as Promise (Next.js 15)
- Authenticate user and redirect if not logged in
- Fetch entity using `get[Entity]WithRelations(id)`
- Return `notFound()` if entity doesn't exist
- Build dynamic title from entity data (inline or use formatter function)
- Set breadcrumbs with current page ("Edit") having no `href`
- NO PageContainer in server page (form wrapper handles it)
- Pass entity, title, description, and saveButtonLabel to form wrapper

### Key Requirements

- ✅ Parse `params` as Promise (Next.js 15)
- ✅ Authenticate user first
- ✅ Fetch entity **WithRelations** (includes all related data for form)
- ✅ Return `notFound()` if entity doesn't exist
- ✅ Build dynamic title from entity data (inline or use formatter)
- ✅ Breadcrumbs: Dashboard → Module List → "Edit"
- ✅ Current breadcrumb ("Edit") should only have `label` (no `href`)
- 🔴 **CRITICAL: NO PageContainer here** - The form wrapper handles PageContainer
- 🔴 **Pass entity to form wrapper** - This signals edit mode

### Title Building Pattern

**Option 1: Inline (simple cases)**
- See: `src/app/(main)/weddings/[id]/edit/page.tsx:25-34`
- Build title conditionally from entity data
- Pattern: Start with entity name, append "-[Entity]"
- Fallback to just "[Entity]" if no identifying data

**Option 2: Use Formatter (complex cases)**
- Import page title formatter: `get[Entity]PageTitle` from `@/lib/utils/formatters`
- Call formatter with entity: `const title = get[Entity]PageTitle(entity)`
- See [FORMATTERS.md](./FORMATTERS.md) for complete documentation

---

## Form Wrapper Pattern

**File:** `[entity]-form-wrapper.tsx` in `app/(main)/[entity-plural]/`

### Pattern Reference

**See:** `src/app/(main)/weddings/wedding-form-wrapper.tsx` for the complete implementation.

**Key elements:**
- Client component (`'use client'`)
- Define props interface with optional entity prop
- Declare `formId` constant (e.g., 'wedding-form')
- Manage `isLoading` state with useState
- Derive `isEditing` from entity presence
- Wrap in PageContainer with title, description, primaryAction
- In edit mode: add "View" button to additionalActions
- Pass entity, formId, and onLoadingChange callback to form

### Key Requirements

#### 1. Props Interface

**See:** `src/app/(main)/weddings/wedding-form-wrapper.tsx:8-13`

- Entity prop is **optional** (presence indicates edit mode)
- `title: string` - Dynamic title from server page
- `description: string` - Description for PageContainer
- `saveButtonLabel: string` - Label for save button
- All display strings come from server page (not hardcoded)

#### 2. State Management

```tsx
const formId = '[entity]-form'
const [isLoading, setIsLoading] = useState(false)
const isEditing = !!entity
```

- ✅ `formId` - Unique ID that connects form to save button
- ✅ `isLoading` - Managed by wrapper, passed to form
- ✅ `isEditing` - Derived from entity existence

#### 3. PageContainer Configuration

**In Edit Mode (`isEditing === true`):**
```tsx
<PageContainer
  title={title}
  description={description}
  primaryAction={<ModuleSaveButton moduleName="[Entity]" isLoading={isLoading} isEditing={true} form={formId} />}
  additionalActions={[
    {
      type: 'action',
      label: 'View [Entity]',
      href: `/[entities]/${entity.id}`
    }
  ]}
>
```

- ✅ Primary action: Save button
- ✅ Additional action: "View [Entity]" button linking to view page

**In Create Mode (`isEditing === false`):**
```tsx
<PageContainer
  title={title}
  description={description}
  primaryAction={<ModuleSaveButton moduleName="[Entity]" isLoading={isLoading} isEditing={false} form={formId} />}
  additionalActions={undefined}
>
```

- ✅ Primary action: Save button
- ✅ NO additional actions

#### 4. ModuleSaveButton Props

```tsx
<ModuleSaveButton
  moduleName="[Entity]"     // Display name (e.g., "Wedding", "Funeral")
  isLoading={isLoading}     // Controls disabled state and spinner
  isEditing={isEditing}     // Changes label: "Save [Entity]" vs "Create [Entity]"
  form={formId}            // Connects button to form via form attribute
/>
```

- ✅ Button is type="submit" but outside the form
- ✅ Connected via HTML `form` attribute
- ✅ Automatically shows loading spinner when `isLoading`
- ✅ Automatically disables when `isLoading`
- ✅ Label changes based on `isEditing`: "Save" vs "Create"

#### 5. Form Component Integration

```tsx
<WeddingForm
  wedding={wedding}
  formId={formId}
  onLoadingChange={setIsLoading}
/>
```

- ✅ Pass entity (optional, undefined in create mode)
- ✅ Pass `formId` to set on `<form>` element
- ✅ Pass `onLoadingChange` callback for loading state

---

## Unified Form Pattern

**File:** `[entity]-form.tsx` in `app/(main)/[entity-plural]/`

The unified form component handles both create and edit modes. For complete form patterns, see:
- 🔴 [FORMS.md](./FORMS.md) - Complete form documentation
- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - Section 7: Unified Form

### Key Requirements Summary

```tsx
interface [Entity]FormProps {
  [entity]?: [Entity]WithRelations  // Optional - undefined = create mode
  formId: string                    // Must set on <form> element
  onLoadingChange: (loading: boolean) => void  // Callback for loading state
}
```

**Mode Detection:**
```tsx
const isEditing = !![entity]
```

**Form Element:**
```tsx
<form id={formId} onSubmit={handleSubmit}>
  {/* Form fields */}
</form>
```

**Loading State:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  onLoadingChange(true)

  try {
    // Save logic
  } finally {
    onLoadingChange(false)
  }
}
```

**Redirect After Save:**
- Create mode: Redirect to view page (`/[entities]/${newId}`)
- Edit mode: Stay on edit page, call `router.refresh()`

---

## Visual Comparison: Create vs Edit

### Create Page

```
┌─────────────────────────────────────────────────────────────┐
│ PageContainer                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Title: "New Wedding"                                    │ │
│ │ Description: "Create a new wedding celebration."        │ │
│ │ [Create Wedding] (primary action)                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ WeddingForm (entity=undefined)                          │ │
│ │ • Empty fields                                          │ │
│ │ • On submit: redirect to /weddings/{newId}              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Edit Page

```
┌─────────────────────────────────────────────────────────────┐
│ PageContainer                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Title: "Smith-Jones-Wedding"                            │ │
│ │ Description: "Update wedding information."              │ │
│ │ [Save Wedding] (primary action)                         │ │
│ │ [View Wedding] (additional action)                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ WeddingForm (entity={wedding})                          │ │
│ │ • Pre-filled fields                                     │ │
│ │ • On submit: router.refresh() (stay on page)            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Common Mistakes to Avoid

❌ **Adding PageContainer in server edit page** - Form wrapper handles PageContainer
❌ **Not fetching WithRelations** - Edit forms need all related data
❌ **Not passing entity to form wrapper** - Form wrapper needs entity for edit mode detection
❌ **Missing notFound() check** - Always check if entity exists
❌ **Hardcoding title/description** - Should come from server page as props
❌ **Not connecting save button to form** - Must use matching `formId`
❌ **Missing "View" button in edit mode** - Should be in additionalActions
❌ **Wrong redirect after save** - Create redirects to view, edit stays on edit (refresh)
❌ **Not managing loading state** - Form must call `onLoadingChange`
❌ **Save button inside form** - Should be in PageContainer primaryAction (outside form)

---

## Checklist

When implementing edit page functionality, verify:

**Server Edit Page:**
- [ ] Awaits `params` Promise
- [ ] Authenticates user first
- [ ] Fetches entity **WithRelations**
- [ ] Returns `notFound()` if entity doesn't exist
- [ ] Builds dynamic title
- [ ] Sets breadcrumbs correctly
- [ ] NO PageContainer in server page
- [ ] Passes entity to form wrapper
- [ ] Passes title, description, saveButtonLabel

**Form Wrapper:**
- [ ] Entity prop is optional in interface
- [ ] Declares `formId` constant
- [ ] Manages `isLoading` state
- [ ] Derives `isEditing` from entity presence
- [ ] Wraps in PageContainer
- [ ] primaryAction uses ModuleSaveButton
- [ ] ModuleSaveButton has correct props
- [ ] additionalActions shows "View" button in edit mode
- [ ] additionalActions is undefined in create mode
- [ ] Passes entity, formId, onLoadingChange to form

**Unified Form:**
- [ ] Entity prop is optional
- [ ] Receives formId and onLoadingChange
- [ ] Sets id={formId} on form element
- [ ] Calls onLoadingChange(true) on submit start
- [ ] Calls onLoadingChange(false) in finally block
- [ ] Redirects to view page in create mode
- [ ] Calls router.refresh() in edit mode
- [ ] Uses FormField for all inputs
- [ ] Follows patterns in FORMS.md

---

## Reference Files

- **Server Edit Page Example:** `src/app/(main)/weddings/[id]/edit/page.tsx`
- **Server Create Page Example:** `src/app/(main)/weddings/create/page.tsx`
- **Form Wrapper Example:** `src/app/(main)/weddings/wedding-form-wrapper.tsx`
- **Unified Form Example:** `src/app/(main)/weddings/wedding-form.tsx`
- **Components:**
  - `src/components/page-container.tsx`
  - `src/components/module-save-button.tsx`
- **Complete Form Documentation:** [FORMS.md](./FORMS.md)
