# Module Buttons

**Status:** ✅ Implemented across all modules
**Created:** 2025-11-19
**Last Updated:** 2025-11-19

## Overview

Standardized button components for all modules. These components provide consistent UX across list pages and create/edit pages with proper loading states and module-specific labeling.

## Components

### ModuleCreateButton

**File:** `src/components/module-create-button.tsx`

Standardized create button for module list pages. Displays consistent "New [ModuleName]" text with Plus icon.

**Props:**
```typescript
interface ModuleCreateButtonProps {
  moduleName: string  // The module name (e.g., "Wedding", "Baptism", "Reading")
  href: string        // Create page URL (e.g., "/weddings/create")
}
```

**Behavior:**
- Displays "New [ModuleName]" with Plus icon
- Primary button styling (filled, not outline)
- Links to the module's create page

**Usage Example:**
```tsx
<ModuleCreateButton moduleName="Wedding" href="/weddings/create" />
```

**Output Example:**
- `+ New Wedding`
- `+ New Reading`
- `+ New Template`

**Implementation Pattern:**

All module list pages use ModuleCreateButton in the PageContainer actions prop:

```tsx
import { ModuleCreateButton } from '@/components/module-create-button'

export default async function ModulesPage() {
  // ... data fetching ...

  return (
    <PageContainer
      title="Modules"
      description="Manage modules in your parish."
      actions={<ModuleCreateButton moduleName="Module" href="/modules/create" />}
    >
      <ModulesListClient initialData={modules} stats={stats} />
    </PageContainer>
  )
}
```

**Special Cases:**

Some modules have multiple buttons in the actions area. In these cases, wrap buttons in a `<div className="flex gap-2">`:

```tsx
// People page - has CSV download + create button
actions={
  <div className="flex gap-2">
    <Button variant="outline" asChild>
      <Link href="/api/people/csv">
        <Download className="h-4 w-4 mr-2" />
        Download CSV
      </Link>
    </Button>
    <ModuleCreateButton moduleName="Person" href="/people/create" />
  </div>
}
```

**Note on Groups Module:**

The Groups module uses a different pattern with a dialog-based form instead of a separate create page, so it does not use ModuleCreateButton. It has its own create button that opens a dialog:

```tsx
<Button onClick={handleCreate}>
  <Plus className="h-4 w-4 mr-2" />
  Create Group
</Button>
```

---

### ModuleViewButton

**File:** `src/components/module-view-button.tsx`

Standardized view button for module edit pages. Shows "View [ModuleName]" with Eye icon. Only displayed in edit mode (when entity exists).

**Props:**
```typescript
interface ModuleViewButtonProps {
  moduleName: string  // The module name (e.g., "Wedding", "Location", "Mass Role")
  href: string        // View page URL (e.g., "/weddings/123")
}
```

**Behavior:**
- Displays "View [ModuleName]" with Eye icon
- Outline button styling (not filled)
- Links to the entity's view page
- Only shown in edit mode (when `isEditing` is true)

**Usage Example:**
```tsx
{isEditing && (
  <ModuleViewButton moduleName="Wedding" href={`/weddings/${wedding.id}`} />
)}
```

**Output Examples:**
- `👁 View Wedding`
- `👁 View Location`
- `👁 View Template`

**Implementation Pattern:**

All module form wrappers include ModuleViewButton in the actions area (edit mode only):

```tsx
import { ModuleViewButton } from '@/components/module-view-button'
import { ModuleSaveButton } from '@/components/module-save-button'

export function ModuleFormWrapper({ entity, title, description }: Props) {
  const formId = 'module-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!entity

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Module" href={`/modules/${entity.id}`} />
      )}
      <ModuleSaveButton moduleName="Module" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer title={title} description={description} actions={actions}>
      <ModuleForm entity={entity} formId={formId} onLoadingChange={setIsLoading} />
    </PageContainer>
  )
}
```

---

### ModuleSaveButton

**File:** `src/components/module-save-button.tsx`

Standardized save button that displays module-specific text and handles loading states.

**Props:**
```typescript
interface ModuleSaveButtonProps {
  moduleName: string         // The module name (e.g., "Wedding", "Baptism")
  isLoading: boolean          // Loading state from form submission
  isEditing?: boolean         // Optional - determines "Save" vs "Update" text
  form?: string               // Optional - form ID for submit button
  type?: 'submit' | 'button'  // Optional - button type (default: 'submit')
  onClick?: () => void        // Optional - click handler
}
```

**Behavior:**
- **Create mode** (`isEditing = false`): Displays "Save [ModuleName]"
- **Edit mode** (`isEditing = true`): Displays "Update [ModuleName]"
- **Loading state** (`isLoading = true`): Displays "Saving..." with spinner
- Button is disabled during loading state

**Usage Example:**
```tsx
<ModuleSaveButton
  moduleName="Wedding"
  isLoading={isLoading}
  isEditing={isEditing}
  form="wedding-form"
/>
```

**Output Examples:**
- Create mode: `Save Wedding`
- Edit mode: `Update Wedding`
- Loading: `Saving...` (with spinner)

---

### ModuleCancelButton

**File:** `src/components/module-cancel-button.tsx`

Standardized cancel button that navigates back to the appropriate page.

**Props:**
```typescript
interface ModuleCancelButtonProps {
  href: string        // Destination URL (e.g., "/weddings" or "/weddings/123")
  disabled?: boolean  // Optional - disable during form submission
}
```

**Behavior:**
- Always displays "Cancel" (no module name)
- Uses outline variant for visual hierarchy
- Links to specified href
- Can be disabled during form submission

**Usage Example:**
```tsx
<ModuleCancelButton
  href={isEditing ? `/weddings/${wedding.id}` : '/weddings'}
  disabled={isLoading}
/>
```

---

### FormBottomActions

**File:** `src/components/form-bottom-actions.tsx`

Wrapper component that renders save and cancel buttons at the bottom of forms.

**Props:**
```typescript
interface FormBottomActionsProps {
  isEditing: boolean   // Determines save button text
  isLoading: boolean   // Loading state for both buttons
  cancelHref: string   // Where cancel button navigates
  moduleName: string   // Module name for save button
}
```

**Behavior:**
- Displays Cancel and Save buttons side-by-side
- Right-aligned with flexbox layout
- Passes props to ModuleCancelButton and ModuleSaveButton

**Usage Example:**
```tsx
<FormBottomActions
  isEditing={isEditing}
  isLoading={isLoading}
  cancelHref={isEditing ? `/weddings/${wedding.id}` : '/weddings'}
  moduleName="Wedding"
/>
```

---

## Implementation Pattern

### Standard Module Form Structure

All module edit/create pages follow this pattern:

#### 1. Form Wrapper (Client Component)
**File:** `[module]-form-wrapper.tsx`

```tsx
'use client'

import React, { useState } from 'react'
import { ModuleSaveButton } from '@/components/module-save-button'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import Link from 'next/link'

export function ModuleFormWrapper({ entity, title, description }: Props) {
  const formId = 'module-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!entity

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/modules/${entity.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Module
          </Link>
        </Button>
      )}
      <ModuleSaveButton
        moduleName="Module"
        isLoading={isLoading}
        isEditing={isEditing}
        form={formId}
      />
    </>
  )

  return (
    <PageContainer title={title} description={description} actions={actions}>
      <ModuleForm
        entity={entity}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
```

#### 2. Form Component (Client Component)
**File:** `[module]-form.tsx`

```tsx
import { FormBottomActions } from '@/components/form-bottom-actions'

export function ModuleForm({ entity, formId, onLoadingChange }: Props) {
  const isEditing = !!entity
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  return (
    <form id={formId} onSubmit={handleSubmit}>
      {/* Form fields */}

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/modules/${entity.id}` : '/modules'}
        moduleName="Module"
      />
    </form>
  )
}
```

---

## Button Placement

### List Pages (PageContainer Header)
- **Create button** (from ModuleCreateButton)
- Positioned in the actions area of PageContainer
- Takes user to create page for new entity

### Edit Pages - Top (PageContainer Header)
- **View button** (from ModuleViewButton) - Only in edit mode
- **Save button** (from ModuleSaveButton)
- Positioned in the actions area of PageContainer
- Visible when scrolling through long forms

### Edit Pages - Bottom (After Form Content)
- **Both Save and Cancel buttons** (from FormBottomActions)
- Provides convenient access after filling out form
- Standard placement for form actions

---

## Module Names Reference

All modules have been updated with consistent naming:

| Module | List Page Create | Form View (Edit) | Form Save (Create) | Form Save (Edit) |
|--------|-----------------|------------------|--------------------|--------------------|
| Weddings | New Wedding | View Wedding | Save Wedding | Update Wedding |
| Baptisms | New Baptism | View Baptism | Save Baptism | Update Baptism |
| Funerals | New Funeral | View Funeral | Save Funeral | Update Funeral |
| Presentations | New Presentation | View Presentation | Save Presentation | Update Presentation |
| Quinceañeras | New Quinceañera | View Quinceañera | Save Quinceañera | Update Quinceañera |
| Events | New Event | View Event | Save Event | Update Event |
| Mass Intentions | New Mass Intention | View Intention | Save Mass Intention | Update Mass Intention |
| Masses | New Mass | View Mass | Save Mass | Update Mass |
| People | New Person | View Person | Save Person | Update Person |
| Locations | New Location | View Location | Save Location | Update Location |
| Readings | New Reading | View Reading | Save Reading | Update Reading |
| Mass Roles | - | View Mass Role | Save Mass Role | Update Mass Role |
| Mass Role Templates | New Template | View Template | Save Mass Role Template | Update Mass Role Template |
| Mass Role Members | New Mass Role Member | - | - | - |

---

## Modules Implemented

### ModuleCreateButton (List Pages)

**Liturgical Modules (7)**
✅ Weddings
✅ Baptisms
✅ Funerals
✅ Presentations
✅ Quinceañeras
✅ Events
✅ Mass Intentions

**Supporting Modules (5)**
✅ Masses
✅ People (with CSV download button)
✅ Locations
✅ Readings
✅ Mass Role Templates

**Not Implemented:**
- Groups (uses dialog-based create, not separate page)
- Mass Roles (no list page, accessed via settings)

**Total: 12 modules using ModuleCreateButton**

### ModuleViewButton (Edit Pages)

**Liturgical Modules (7)**
✅ Weddings
✅ Baptisms
✅ Funerals
✅ Presentations
✅ Quinceañeras
✅ Events
✅ Mass Intentions

**Supporting Modules (6)**
✅ Masses
✅ People
✅ Locations
✅ Readings
✅ Mass Roles
✅ Mass Role Templates

**Total: 13 modules using ModuleViewButton**

### ModuleSaveButton & ModuleCancelButton (Form Pages)

**Liturgical Modules (7)**
✅ Weddings
✅ Baptisms
✅ Funerals
✅ Presentations
✅ Quinceañeras
✅ Events
✅ Mass Intentions

**Supporting Modules (6)**
✅ Masses
✅ People
✅ Locations
✅ Readings
✅ Mass Roles
✅ Mass Role Templates

**Total: 13 modules**

---

## Migration from Old Components

### Before
```tsx
// Old pattern - inconsistent labels
import { SaveButton } from '@/components/save-button'
import { CancelButton } from '@/components/cancel-button'

<SaveButton isLoading={isLoading} form={formId}>
  {saveButtonLabel}  // Label passed as prop or children
</SaveButton>

<FormBottomActions
  isEditing={isEditing}
  isLoading={isLoading}
  cancelHref="/weddings"
  saveLabel="Save Wedding"  // Manual label
/>
```

### After
```tsx
// New pattern - consistent, module-aware
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleCancelButton } from '@/components/module-cancel-button'

<ModuleSaveButton
  moduleName="Wedding"  // Module name instead of label
  isLoading={isLoading}
  isEditing={isEditing}  // Automatically determines "Save" vs "Update"
  form={formId}
/>

<FormBottomActions
  isEditing={isEditing}
  isLoading={isLoading}
  cancelHref="/weddings"
  moduleName="Wedding"  // Module name instead of saveLabel
/>
```

---

## Benefits

1. **Consistency**: All modules use identical button pattern
2. **Clarity**: Module name in button text makes action clear
3. **State Management**: Automatic loading state handling
4. **DRY Principle**: No need to manually specify "Save X" vs "Update X"
5. **Type Safety**: TypeScript interfaces ensure correct usage
6. **Maintainability**: Single source of truth for button behavior

---

## Testing Checklist

### List Page (ModuleCreateButton)

When creating or modifying a module list page, verify:

- [ ] Create button appears in PageContainer header
- [ ] Button shows "New [Module]" with Plus icon
- [ ] Button links to correct create page (e.g., `/weddings/create`)
- [ ] Button has primary (filled) styling
- [ ] If multiple buttons, they are wrapped in flex container with gap-2

### Edit Page (ModuleViewButton, ModuleSaveButton & ModuleCancelButton)

When creating or modifying a module edit page, verify:

**View Button:**
- [ ] View button appears in PageContainer header (edit mode only)
- [ ] Button shows "View [Module]" with Eye icon
- [ ] Button links to correct view page (e.g., `/weddings/123`)
- [ ] Button has outline styling
- [ ] Button does NOT appear in create mode

**Save Button:**
- [ ] Save button appears in PageContainer header (after View button)
- [ ] Save button appears at bottom of form (with Cancel)
- [ ] Create mode shows "Save [Module]"
- [ ] Edit mode shows "Update [Module]"
- [ ] Loading state shows "Saving..." with spinner
- [ ] Buttons are disabled during loading
- [ ] Loading state propagates to both top and bottom buttons

**Cancel Button:**
- [ ] Cancel button appears at bottom of form (with Save)
- [ ] Cancel button navigates to correct location
- [ ] Cancel button is disabled during loading

---

## Related Documentation

- [FORMS.md](./FORMS.md) - Form implementation patterns
- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - Complete module structure
- [CODE_CONVENTIONS.md](./CODE_CONVENTIONS.md) - General coding standards
