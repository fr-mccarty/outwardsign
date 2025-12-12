# Edit Form Pattern - Layer 2: Form Wrapper (Client)

> **Purpose:** Complete guide to implementing Layer 2 - the client component that manages loading state, provides action buttons, and wraps the form in PageContainer.

## Table of Contents

- [Overview](#overview)
- [File Location and Type](#file-location-and-type)
- [Standard Template](#standard-template)
- [Key Requirements](#key-requirements)
- [Component Breakdown](#component-breakdown)
- [Complete Examples](#complete-examples)
- [Implementation Checklist](#implementation-checklist)
- [Common Mistakes](#common-mistakes)

---

## Overview

**Layer 2** is the orchestration layer that:
1. Manages form loading state
2. Detects edit mode (entity present)
3. Shows "View [Entity]" button in edit mode only
4. Provides SaveButton connected to the form
5. Wraps the form in PageContainer for consistent layout

**Type:** Client Component (requires `'use client'` directive)

---

## File Location and Type

**Path:** `app/(main)/[entity-plural]/[entity]-form-wrapper.tsx`

**Examples:**
- `app/(main)/weddings/wedding-form-wrapper.tsx`
- `app/(main)/funerals/funeral-form-wrapper.tsx`
- `app/(main)/baptisms/baptism-form-wrapper.tsx`

**Important:** This is a **Client Component**. Must include `'use client'` directive at the top.

---

## Standard Template

```tsx
'use client'

import React, { useState } from 'react'
import { [Entity]Form } from './[entity]-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { [Entity] } from '@/lib/types'

interface [Entity]FormWrapperProps {
  [entity]?: [Entity]
  title: string
  description: string
  saveButtonLabel: string
}

export function [Entity]FormWrapper({
  [entity],
  title,
  description,
  saveButtonLabel
}: [Entity]FormWrapperProps) {
  // 1. FORM ID (consistent naming pattern)
  const formId = '[entity]-form'

  // 2. LOADING STATE
  const [isLoading, setIsLoading] = useState(false)

  // 3. DETECT EDIT MODE
  const isEditing = !!entity

  // 4. ACTION BUTTONS
  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/[entities]/${[entity].id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View [Entity]
          </Link>
        </Button>
      )}
      <SaveButton isLoading={isLoading} form={formId}>
        {saveButtonLabel}
      </SaveButton>
    </>
  )

  // 5. RENDER
  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <[Entity]Form
        [entity]={[entity]}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
```

---

## Key Requirements

| Requirement | Why | Implementation |
|-------------|-----|----------------|
| ✅ **'use client' directive** | Needs state and interactivity | First line of file |
| ✅ **Unique formId** | SaveButton targets form via `form` attribute | `const formId = 'entity-form'` |
| ✅ **isLoading state** | Controls SaveButton spinner animation | `useState(false)` |
| ✅ **isEditing computed** | Determines whether to show "View [Entity]" button | `!!entity` |
| ✅ **View button only in edit** | Create mode doesn't have an entity to view yet | `{isEditing && ...}` |
| ✅ **SaveButton in actions** | Appears in PageContainer header | Pass in `actions` prop |
| ✅ **Pass onLoadingChange** | Form notifies wrapper of loading state changes | Callback prop |

---

## Component Breakdown

### 1. Form ID

```tsx
const formId = '[entity]-form'
```

**Purpose:** Unique identifier that connects the external SaveButton to the form.

**Pattern:**
- Wedding: `'wedding-form'`
- Funeral: `'funeral-form'`
- Baptism: `'baptism-form'`

**How it works:**
```tsx
// SaveButton uses form attribute to target the form
<SaveButton form={formId}>Save</SaveButton>

// Form has matching id attribute
<form id={formId} onSubmit={handleSubmit}>...</form>
```

### 2. Loading State

```tsx
const [isLoading, setIsLoading] = useState(false)
```

**Purpose:** Track form submission state to:
- Show spinner in SaveButton
- Disable buttons during submission
- Prevent double-submission

**Flow:**
1. Form starts submission → calls `onLoadingChange(true)`
2. Wrapper updates state → `setIsLoading(true)`
3. SaveButton shows spinner
4. Submission completes → calls `onLoadingChange(false)`
5. SaveButton returns to normal

### 3. Edit Mode Detection

```tsx
const isEditing = !!entity
```

**Purpose:** Determine whether we're in edit mode (entity exists) or create mode (no entity).

**Usage:**
```tsx
{isEditing && (
  <Button variant="outline" asChild>
    <Link href={`/entities/${entity.id}`}>
      <Eye className="h-4 w-4 mr-2" />
      View Entity
    </Link>
  </Button>
)}
```

**Result:**
- Edit mode: Shows "View Entity" button + Save button
- Create mode: Shows only Save button

### 4. Action Buttons

```tsx
const actions = (
  <>
    {isEditing && (
      <Button variant="outline" asChild>
        <Link href={`/[entities]/${[entity].id}`}>
          <Eye className="h-4 w-4 mr-2" />
          View [Entity]
        </Link>
      </Button>
    )}
    <SaveButton isLoading={isLoading} form={formId}>
      {saveButtonLabel}
    </SaveButton>
  </>
)
```

**Components:**
- **View Button** (edit mode only)
  - Links to view page (`/[entities]/[id]`)
  - Uses outline variant
  - Shows Eye icon
- **SaveButton**
  - Connected to form via `form` prop
  - Shows spinner when `isLoading` is true
  - Label passed from parent (e.g., "Save Wedding")

### 5. PageContainer

```tsx
<PageContainer
  title={title}
  description={description}
  actions={actions}
>
  {/* Form goes here */}
</PageContainer>
```

**Props:**
- `title` - Dynamic title from Layer 1 (e.g., "Smith-Jones Wedding")
- `description` - Static description (e.g., "Update wedding information")
- `actions` - Action buttons (View + Save)

---

## Complete Examples

### Wedding Module

```tsx
'use client'

import React, { useState } from 'react'
import { WeddingForm } from './wedding-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { Wedding } from '@/lib/types'

interface WeddingFormWrapperProps {
  wedding?: Wedding
  title: string
  description: string
  saveButtonLabel: string
}

export function WeddingFormWrapper({
  wedding,
  title,
  description,
  saveButtonLabel
}: WeddingFormWrapperProps) {
  const formId = 'wedding-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!wedding

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/weddings/${wedding.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Wedding
          </Link>
        </Button>
      )}
      <SaveButton isLoading={isLoading} form={formId}>
        {saveButtonLabel}
      </SaveButton>
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <WeddingForm
        wedding={wedding}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
```

### Funeral Module

```tsx
'use client'

import React, { useState } from 'react'
import { FuneralForm } from './funeral-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { Funeral } from '@/lib/types'

interface FuneralFormWrapperProps {
  funeral?: Funeral
  title: string
  description: string
  saveButtonLabel: string
}

export function FuneralFormWrapper({
  funeral,
  title,
  description,
  saveButtonLabel
}: FuneralFormWrapperProps) {
  const formId = 'funeral-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!funeral

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/funerals/${funeral.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Funeral
          </Link>
        </Button>
      )}
      <SaveButton isLoading={isLoading} form={formId}>
        {saveButtonLabel}
      </SaveButton>
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <FuneralForm
        funeral={funeral}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
```

---

## Implementation Checklist

Use this checklist when implementing Layer 2:

- [ ] **File created** at `app/(main)/[entities]/[entity]-form-wrapper.tsx`
- [ ] **Add `'use client'` directive** at the top of file
- [ ] **Import `PageContainer`** from `@/components/page-container`
- [ ] **Import `SaveButton`** from `@/components/save-button`
- [ ] **Import `Button`** from `@/components/ui/button`
- [ ] **Import Eye icon** from `lucide-react`
- [ ] **Import `Link`** from `next/link`
- [ ] **Import entity type** from `@/lib/types`
- [ ] **Import form component** (e.g., `WeddingForm`)
- [ ] **Define props interface** (entity?, title, description, saveButtonLabel)
- [ ] **Define formId constant** (e.g., `'wedding-form'`)
- [ ] **Create isLoading state** with `useState(false)`
- [ ] **Compute isEditing** using `!!entity`
- [ ] **Create actions JSX** with conditional "View" button
- [ ] **Include SaveButton** in actions with formId
- [ ] **Wrap form in PageContainer** with title, description, actions
- [ ] **Pass entity to form** (optional prop)
- [ ] **Pass formId to form**
- [ ] **Pass onLoadingChange callback** to form
- [ ] **Test:** View button appears only in edit mode
- [ ] **Test:** Save button shows spinner during submission
- [ ] **Test:** Form submission works in both create and edit modes

---

## Common Mistakes

### ❌ Forgetting 'use client' directive

```tsx
// WRONG - will cause errors because we use useState
import React, { useState } from 'react'
export function FormWrapper() { ... }

// CORRECT
'use client'
import React, { useState } from 'react'
export function FormWrapper() { ... }
```

### ❌ Showing View button in create mode

```tsx
// WRONG - no entity to view in create mode
const actions = (
  <>
    <Button asChild>
      <Link href={`/entities/${entity?.id}`}>View Entity</Link>
    </Button>
    <SaveButton />
  </>
)

// CORRECT - only show in edit mode
const isEditing = !!entity
const actions = (
  <>
    {isEditing && (
      <Button asChild>
        <Link href={`/entities/${entity.id}`}>View Entity</Link>
      </Button>
    )}
    <SaveButton />
  </>
)
```

### ❌ Not connecting SaveButton to form

```tsx
// WRONG - SaveButton won't trigger form submission
<SaveButton isLoading={isLoading}>Save</SaveButton>

// CORRECT - form attribute connects to form id
<SaveButton isLoading={isLoading} form={formId}>Save</SaveButton>
```

### ❌ Not passing onLoadingChange to form

```tsx
// WRONG - wrapper won't know when form is submitting
<EntityForm entity={entity} formId={formId} />

// CORRECT - form notifies wrapper of loading state
<EntityForm
  entity={entity}
  formId={formId}
  onLoadingChange={setIsLoading}
/>
```

### ❌ Hardcoding save button label

```tsx
// WRONG - not flexible for different contexts
<SaveButton form={formId}>Save</SaveButton>

// CORRECT - use label from props
<SaveButton form={formId}>{saveButtonLabel}</SaveButton>
```

---

## Related Documentation

- **[EDIT_PAGE.md](./EDIT_PAGE.md)** - Layer 1: Server page that passes data to this wrapper
- **[UNIFIED_FORM.md](./UNIFIED_FORM.md)** - Layer 3: Form component that this wrapper wraps
- **[OVERVIEW.md](./OVERVIEW.md)** - Understanding the 3-layer architecture
- **[COMPONENT_REGISTRY.md](../COMPONENT_REGISTRY.md)** - SaveButton, PageContainer documentation
