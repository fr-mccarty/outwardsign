# 🔴 CRITICAL: Preventing Infinite Re-Render Loops

> **Purpose:** Critical rules and patterns to prevent infinite re-render loops in pickers.
>
> **Related Documentation:**
> - **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Core architecture and components
> - **[CREATING_PICKERS.md](./CREATING_PICKERS.md)** - Creating new pickers
> - **[ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)** - Advanced features

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Correct Patterns](#correct-patterns)
- [Incorrect Patterns](#incorrect-patterns)
- [Special Case: Dynamic createFields](#special-case-dynamic-createfields)
- [Checklist for New Pickers](#checklist-for-new-pickers)
- [Why CorePicker Defaults Are Safe Now](#why-corepicker-defaults-are-safe-now)

---

## The Problem

CorePicker has a `useEffect` that depends on several props including `createFields` and `defaultCreateFormData`. If these props receive **new references on every render**, it triggers an infinite loop:

```
Render → New array/object → useEffect runs → State update → Render → New array/object → ...
```

This manifests as the error:
```
Maximum update depth exceeded. This can happen when a component repeatedly
calls setState inside componentWillUpdate or componentDidUpdate.
```

**Root Cause:** Creating new array/object instances on every render causes React to think the dependency has changed, triggering the effect again, which updates state, causing another render, and the cycle repeats infinitely.

---

## The Solution

**Define constants OUTSIDE the component** to ensure stable references across renders.

By defining arrays and objects outside the component function, they maintain the same reference across all renders, preventing unnecessary effect triggers.

---

## Correct Patterns

### ✅ Pattern 1: Constants Outside Component

```typescript
'use client'

import { useState, useEffect } from 'react'
import { CorePicker } from '@/components/core-picker'
import type { MyEntity } from '@/lib/types'

// 🔴 CRITICAL: Define constants OUTSIDE component
const SEARCH_FIELDS = ['name', 'email'] as const
const EMPTY_CREATE_FIELDS: never[] = []  // For pickers without inline creation
const EMPTY_FORM_DATA = {}

export function MyPicker({ open, onOpenChange, onSelect }: MyPickerProps) {
  const [items, setItems] = useState<MyEntity[]>([])

  return (
    <CorePicker<MyEntity>
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      onSelect={onSelect}
      searchFields={SEARCH_FIELDS}  // ✅ Stable reference
      enableCreate={false}
      createFields={EMPTY_CREATE_FIELDS}  // ✅ Stable reference
      defaultCreateFormData={EMPTY_FORM_DATA}  // ✅ Stable reference
      // ... other props
    />
  )
}
```

**Why this works:** Constants defined outside the component are created once and reused on every render, maintaining the same reference.

---

### ✅ Pattern 2: Static Field Configuration

```typescript
'use client'

import { CorePicker } from '@/components/core-picker'
import type { PickerFieldConfig } from '@/types/core-picker'

// 🔴 CRITICAL: Define field config OUTSIDE component
const CREATE_FIELDS: PickerFieldConfig[] = [
  {
    key: 'first_name',
    label: 'First Name',
    type: 'text',
    required: true,
  },
  {
    key: 'last_name',
    label: 'Last Name',
    type: 'text',
    required: true,
  },
]

const SEARCH_FIELDS = ['first_name', 'last_name', 'email'] as const

export function PersonPicker({ open, onOpenChange, onSelect }: Props) {
  return (
    <CorePicker<Person>
      createFields={CREATE_FIELDS}  // ✅ Stable reference
      searchFields={SEARCH_FIELDS}  // ✅ Stable reference
      // ... other props
    />
  )
}
```

---

## Incorrect Patterns

### ❌ Pattern 1: Inline Arrays

```typescript
// ❌ BAD: Inline array (new reference every render)
<CorePicker
  searchFields={['name', 'email']}
  // Creates new array on every render!
/>
```

**Why this fails:** `['name', 'email']` creates a new array instance on every render, triggering the useEffect infinitely.

---

### ❌ Pattern 2: Inline Empty Arrays

```typescript
// ❌ BAD: Inline empty array
<CorePicker
  createFields={[]}
  // Creates new array on every render!
/>
```

**Why this fails:** Even though `[]` is empty, it's still a new array reference on every render.

---

### ❌ Pattern 3: Inline Objects

```typescript
// ❌ BAD: Inline empty object
<CorePicker
  defaultCreateFormData={{}}
  // Creates new object on every render!
/>
```

**Why this fails:** `{}` creates a new object instance on every render, causing infinite re-renders.

---

### ❌ Pattern 4: Constants Inside Component

```typescript
// ❌ BAD: Constants inside component
export function MyPicker() {
  const SEARCH_FIELDS = ['name', 'email']  // Recreated every render!
  const EMPTY_FORM_DATA = {}  // Recreated every render!

  return <CorePicker searchFields={SEARCH_FIELDS} />
}
```

**Why this fails:** Even though they're declared as constants, they're inside the component function, so they're recreated on every render.

---

## Special Case: Dynamic createFields

If your `createFields` needs to be computed dynamically based on props or state, use `useMemo`:

```typescript
'use client'

import { useState, useEffect, useMemo } from 'react'
import type { PickerFieldConfig } from '@/types/core-picker'

// Define constant outside for stable parts
const EMPTY_FORM_DATA = {}

export function MyPicker({ visibleFields, requiredFields }: Props) {
  // ✅ Memoize dynamic createFields
  const createFields = useMemo(() => {
    const fields: PickerFieldConfig[] = [
      { key: 'name', label: 'Name', type: 'text', required: true },
    ]

    // Add conditional fields
    if (visibleFields?.includes('email')) {
      fields.push({
        key: 'email',
        label: 'Email',
        type: 'email',
        required: requiredFields?.includes('email'),
      })
    }

    if (visibleFields?.includes('phone_number')) {
      fields.push({
        key: 'phone_number',
        label: 'Phone',
        type: 'tel',
        required: requiredFields?.includes('phone_number'),
      })
    }

    return fields
  }, [visibleFields, requiredFields])  // Only recompute when dependencies change

  return (
    <CorePicker
      createFields={createFields}  // ✅ Memoized reference
      defaultCreateFormData={EMPTY_FORM_DATA}  // ✅ Stable reference
      // ... other props
    />
  )
}
```

**Why this works:** `useMemo` caches the array and only recreates it when `visibleFields` or `requiredFields` actually change, not on every render.

---

## Checklist for New Pickers

When creating a new picker, ensure:

- [ ] `searchFields` defined outside component as `const`
- [ ] `createFields` either defined outside OR wrapped in `useMemo` if dynamic
- [ ] `defaultCreateFormData` defined outside as `const` if used (e.g., `const EMPTY_FORM_DATA = {}`)
- [ ] No inline arrays `[]` passed to CorePicker
- [ ] No inline objects `{}` passed to CorePicker
- [ ] If picker has no inline creation: pass `createFields={EMPTY_CREATE_FIELDS}` with `EMPTY_CREATE_FIELDS` defined outside
- [ ] If picker has no default form data: pass `defaultCreateFormData={EMPTY_FORM_DATA}` with `EMPTY_FORM_DATA` defined outside
- [ ] Test that opening/closing picker doesn't cause console errors or performance issues

---

## Why CorePicker Defaults Are Safe Now

CorePicker's default parameters are now defined outside the component:

```typescript
// In core-picker.tsx - STABLE DEFAULTS
const EMPTY_CREATE_FIELDS: PickerFieldConfig[] = []
const EMPTY_FORM_DATA: Record<string, any> = {}

export function CorePicker<T>({
  createFields = EMPTY_CREATE_FIELDS,  // ✅ Stable default
  defaultCreateFormData = EMPTY_FORM_DATA,  // ✅ Stable default
  // ...
}) {
  // ...
}
```

**However, it's still best practice to explicitly pass these props** for clarity and to avoid relying on defaults. This makes the component's behavior explicit and easier to understand when reading the code.

---

## Examples from Real Pickers

### ✅ Correct: MassPicker

```typescript
'use client'

import { CorePicker } from '@/components/core-picker'
import type { Mass } from '@/lib/types'

// 🔴 CRITICAL: Constants defined OUTSIDE component
const SEARCH_FIELDS = ['name', 'time'] as const
const EMPTY_CREATE_FIELDS: never[] = []
const EMPTY_FORM_DATA = {}

export function MassPicker({ open, onOpenChange, onSelect }: Props) {
  const [masses, setMasses] = useState<Mass[]>([])

  return (
    <CorePicker<Mass>
      open={open}
      onOpenChange={onOpenChange}
      items={masses}
      onSelect={onSelect}
      searchFields={SEARCH_FIELDS}  // ✅ Stable reference
      enableCreate={false}
      createFields={EMPTY_CREATE_FIELDS}  // ✅ Stable reference
      defaultCreateFormData={EMPTY_FORM_DATA}  // ✅ Stable reference
    />
  )
}
```

---

### ✅ Correct: PeoplePicker with Dynamic Fields

```typescript
'use client'

import { useMemo } from 'react'
import { CorePicker } from '@/components/core-picker'
import type { Person } from '@/lib/types'

// 🔴 CRITICAL: Static constants OUTSIDE component
const SEARCH_FIELDS = ['first_name', 'last_name', 'email', 'phone_number'] as const
const EMPTY_FORM_DATA = {}

export function PeoplePicker({
  visibleFields = [],
  requiredFields = [],
  ...props
}: Props) {
  // ✅ Dynamic fields memoized
  const createFields = useMemo(() => {
    const fields: PickerFieldConfig[] = [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
    ]

    if (visibleFields.includes('email')) {
      fields.push({
        key: 'email',
        label: 'Email',
        type: 'email',
        required: requiredFields.includes('email'),
      })
    }

    return fields
  }, [visibleFields, requiredFields])

  return (
    <CorePicker<Person>
      searchFields={SEARCH_FIELDS}  // ✅ Stable reference
      createFields={createFields}  // ✅ Memoized reference
      defaultCreateFormData={EMPTY_FORM_DATA}  // ✅ Stable reference
      {...props}
    />
  )
}
```

---

## Summary

To prevent infinite re-render loops:

- ✅ **Define constants OUTSIDE component** - Arrays and objects used in props
- ✅ **Use `useMemo` for dynamic fields** - When configuration depends on props/state
- ✅ **Never use inline arrays/objects** - Always define constants first
- ✅ **Test opening/closing picker** - Ensure no console errors or performance issues

Following these patterns ensures pickers perform efficiently without infinite re-render loops.
