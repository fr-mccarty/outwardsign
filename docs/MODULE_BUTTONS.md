# Module Buttons

**Status:** Updated with consolidated components
**Last Updated:** 2025-12-22

## Table of Contents

- [Overview](#overview)
- [Components](#components)
  - [ModuleCreateButton](#modulecreatebutton)
  - [SaveButton](#savebutton)
  - [CancelButton](#cancelbutton)
  - [FormBottomActions](#formbottomactions)
- [Implementation Pattern](#implementation-pattern)
- [Button Placement](#button-placement)
- [Module Names Reference](#module-names-reference)
- [Related Documentation](#related-documentation)

---

## Overview

Standardized button components for all modules. These components provide consistent UX across list pages and create/edit pages with proper loading states and module-specific labeling.

**Recent Consolidations:**
- `ModuleSaveButton` merged into `SaveButton` (use `moduleName` prop)
- `ModuleCancelButton` merged into `CancelButton` (with i18n support)
- `ModuleViewButton` removed (use `additionalActions` in PageContainer instead)

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

**Usage Example:**
```tsx
<ModuleCreateButton moduleName="Wedding" href="/weddings/create" />
```

**Output:** `+ New Wedding`

---

### SaveButton

**File:** `src/components/save-button.tsx`

Unified save button supporting both simple forms and module forms with loading states.

**Props:**
```typescript
interface SaveButtonProps {
  isLoading?: boolean
  loadingText?: string
  children?: React.ReactNode
  showIcon?: boolean
  moduleName?: string      // For module forms: shows "Save/Update [ModuleName]"
  isEditing?: boolean      // For module forms: determines "Save" vs "Update" text
  form?: string            // Form ID for external submit
  // ...plus all Button props
}
```

**Usage Examples:**
```tsx
// Simple form
<SaveButton isLoading={isLoading}>Save Changes</SaveButton>

// Module form - create mode
<SaveButton moduleName="Wedding" isLoading={isLoading} isEditing={false} form="wedding-form" />
// Output: "Save Wedding"

// Module form - edit mode
<SaveButton moduleName="Wedding" isLoading={isLoading} isEditing={true} form="wedding-form" />
// Output: "Update Wedding"
```

---

### CancelButton

**File:** `src/components/cancel-button.tsx`

Cancel button with i18n support. Can navigate via href or trigger onClick.

**Props:**
```typescript
interface CancelButtonProps {
  href?: string           // Navigation destination (uses Link)
  onClick?: () => void    // Click handler (for dialogs)
  children?: React.ReactNode
  showIcon?: boolean
  // ...plus most Button props
}
```

**Usage Examples:**
```tsx
// Navigation cancel
<CancelButton href="/weddings" />

// Dialog cancel
<CancelButton onClick={() => setOpen(false)} />
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

#### Form Wrapper (Client Component)

Use `additionalActions` for the View button instead of a separate component:

```tsx
'use client'

import { PageContainer } from '@/components/page-container'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'

export function ModuleFormWrapper({ entity, title, description }: Props) {
  const formId = 'module-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!entity

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={
        <SaveButton
          moduleName="Module"
          isLoading={isLoading}
          isEditing={isEditing}
          form={formId}
        />
      }
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Module',
          icon: <Eye className="h-4 w-4" />,
          href: `/modules/${entity.id}`
        }
      ] : undefined}
    >
      <ModuleForm entity={entity} formId={formId} onLoadingChange={setIsLoading} />
    </PageContainer>
  )
}
```

#### Form Component (Client Component)

```tsx
import { FormBottomActions } from '@/components/form-bottom-actions'

export function ModuleForm({ entity, formId, onLoadingChange }: Props) {
  const isEditing = !!entity
  const [isLoading, setIsLoading] = useState(false)

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
- **Create button** (ModuleCreateButton)
- Positioned in the actions area of PageContainer
- Takes user to create page for new entity

### Edit Pages - Top (PageContainer Header)
- **View button** (via additionalActions) - Only in edit mode
- **Save button** (SaveButton with moduleName)
- Positioned in the actions area of PageContainer

### Edit Pages - Bottom (After Form Content)
- **Both Save and Cancel buttons** (FormBottomActions)
- Provides convenient access after filling out form

---

## Module Names Reference

| Module | List Create | Form Save (Create) | Form Save (Edit) |
|--------|------------|--------------------|--------------------|
| Weddings | New Wedding | Save Wedding | Update Wedding |
| Baptisms | New Baptism | Save Baptism | Update Baptism |
| Funerals | New Funeral | Save Funeral | Update Funeral |
| Events | New Event | Save Event | Update Event |
| Mass Intentions | New Mass Intention | Save Mass Intention | Update Mass Intention |
| Masses | New Mass | Save Mass | Update Mass |
| People | New Person | Save Person | Update Person |
| Locations | New Location | Save Location | Update Location |

---

## Related Documentation

- [FORMS.md](./FORMS.md) - Form implementation patterns
- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - Complete module structure
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - Full component reference
