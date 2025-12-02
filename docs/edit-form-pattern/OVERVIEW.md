# Edit Form Pattern - Overview

> **Purpose:** Understand the 3-layer architecture that powers create and edit forms throughout Outward Sign.

## Table of Contents

- [Introduction](#introduction)
- [The 3-Layer Architecture](#the-3-layer-architecture)
- [Design Principles](#design-principles)
- [File Organization](#file-organization)
- [Props Flow](#props-flow)
- [Mode Detection Pattern](#mode-detection-pattern)
- [Related Documentation](#related-documentation)

---

## Introduction

Edit forms in Outward Sign follow a **consistent 3-layer architecture** that separates concerns and makes forms predictable, testable, and maintainable. This pattern is used across all modules (weddings, funerals, baptisms, presentations, etc.).

**Key Benefits:**
- **Separation of Concerns** - Each layer has a single, clear responsibility
- **Predictable Behavior** - Same pattern everywhere makes code easy to understand
- **Type Safety** - Clear interfaces between layers
- **Reusable Components** - Shared components work consistently across modules
- **Unified Create/Edit** - Single form handles both modes

---

## The 3-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Edit Page (Server Component)                      │
│ File: app/(main)/[entities]/[id]/edit/page.tsx             │
│                                                             │
│ Responsibilities:                                           │
│ - Authentication                                            │
│ - Fetch entity with relations                              │
│ - Build dynamic title from entity data                     │
│ - Set breadcrumbs                                           │
│ - Pass clean data to Layer 2                               │
└──────────────────┬──────────────────────────────────────────┘
                   │ Props: entity, title, description
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Form Wrapper (Client Component)                   │
│ File: app/(main)/[entities]/[entity]-form-wrapper.tsx      │
│                                                             │
│ Responsibilities:                                           │
│ - Manage loading state                                      │
│ - Detect edit mode (entity present)                        │
│ - Show "View [Entity]" button in edit mode                 │
│ - Provide SaveButton connected to form                     │
│ - Wrap form in PageContainer                               │
│ - Pass state and callbacks to Layer 3                      │
└──────────────────┬──────────────────────────────────────────┘
                   │ Props: entity, formId, onLoadingChange
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Unified Form (Client Component)                   │
│ File: app/(main)/[entities]/[entity]-form.tsx              │
│                                                             │
│ Responsibilities:                                           │
│ - Detect mode (create vs edit)                             │
│ - Initialize state from entity data                        │
│ - Handle form submission                                    │
│ - Call create[Entity] or update[Entity]                    │
│ - Redirect appropriately                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Design Principles

### 1. Single Responsibility

Each layer has ONE job:
- **Layer 1** = Data fetching and authentication
- **Layer 2** = UI orchestration and loading management
- **Layer 3** = Form logic and submission

### 2. Server/Client Boundary

- **Server components** (Layer 1) handle data fetching, auth, and pass serializable props
- **Client components** (Layers 2 & 3) handle interactivity, state, and user input

### 3. Type Safety

- Clear interfaces between layers
- `Entity` type for base data
- `EntityWithRelations` type for forms that need related data

### 4. Consistent Mode Detection

```tsx
const isEditing = !!entity
```

This simple pattern is used across all three layers to determine create vs edit mode.

### 5. Predictable Redirection

```tsx
if (isEditing) {
  await updateEntity(entity.id, data)
  router.refresh()  // Stay on edit page, show updated data
} else {
  const newEntity = await createEntity(data)
  router.push(`/entities/${newEntity.id}/edit`)  // Navigate to edit page
}
```

---

## File Organization

Every module follows this structure:

```
app/(main)/[entities]/
├── [id]/
│   ├── page.tsx                          # View page (not part of edit pattern)
│   └── edit/
│       └── page.tsx                      # Layer 1: Edit Page (Server)
├── create/
│   └── page.tsx                          # Create page (uses Layer 2 directly)
├── [entity]-form-wrapper.tsx             # Layer 2: Form Wrapper (Client)
└── [entity]-form.tsx                     # Layer 3: Unified Form (Client)
```

**Note:** The create page (`create/page.tsx`) uses Layer 2 directly (no entity to fetch), while the edit page uses all three layers.

---

## Props Flow

### Layer 1 → Layer 2

```tsx
// Edit Page passes to Form Wrapper
<EntityFormWrapper
  entity={entity}                    // EntityWithRelations | undefined
  title="Edit Wedding"               // Dynamic title
  description="Update information"   // Description for PageContainer
  saveButtonLabel="Save Wedding"     // Label for SaveButton
/>
```

### Layer 2 → Layer 3

```tsx
// Form Wrapper passes to Unified Form
<EntityForm
  entity={entity}                    // EntityWithRelations | undefined
  formId="entity-form"               // HTML form id for external SaveButton
  onLoadingChange={setIsLoading}     // Callback to update loading state
/>
```

---

## Mode Detection Pattern

All three layers use the same pattern to detect create vs edit mode:

```tsx
const isEditing = !!entity
```

**In Layer 1 (Edit Page):**
```tsx
// Always editing (we're in /[id]/edit route)
const entity = await getEntityWithRelations(id)
if (!entity) notFound()
```

**In Layer 2 (Form Wrapper):**
```tsx
const isEditing = !!entity

const actions = (
  <>
    {isEditing && (
      <Button variant="outline" asChild>
        <Link href={`/entities/${entity.id}`}>View Entity</Link>
      </Button>
    )}
    <SaveButton isLoading={isLoading} form={formId}>
      {saveButtonLabel}
    </SaveButton>
  </>
)
```

**In Layer 3 (Unified Form):**
```tsx
const isEditing = !!entity

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (isEditing) {
    await updateEntity(entity.id, formData)
    router.refresh()
  } else {
    const newEntity = await createEntity(formData)
    router.push(`/entities/${newEntity.id}/edit`)
  }
}
```

---

## Related Documentation

**Detailed Implementation Guides:**
- **[EDIT_PAGE.md](./EDIT_PAGE.md)** - Layer 1: Server component patterns and examples
- **[FORM_WRAPPER.md](./FORM_WRAPPER.md)** - Layer 2: Client wrapper patterns
- **[UNIFIED_FORM.md](./UNIFIED_FORM.md)** - Layer 3: Form component and state management
- **[COMMON_PATTERNS.md](./COMMON_PATTERNS.md)** - Reusable patterns, examples, and best practices

**Related Systems:**
- **[FORMS.md](../FORMS.md)** - Form input styling, FormField usage, validation
- **[MODULE_COMPONENT_PATTERNS.md](../MODULE_COMPONENT_PATTERNS.md)** - Complete module structure (8 files)
- **[COMPONENT_REGISTRY.md](../COMPONENT_REGISTRY.md)** - Picker components and shared components
- **[PICKERS.md](../PICKERS.md)** - Picker modal patterns and behavior

---

## Quick Start

**For detailed implementation:**
1. Start with [EDIT_PAGE.md](./EDIT_PAGE.md) to set up Layer 1
2. Follow [FORM_WRAPPER.md](./FORM_WRAPPER.md) for Layer 2
3. Implement [UNIFIED_FORM.md](./UNIFIED_FORM.md) for Layer 3
4. Reference [COMMON_PATTERNS.md](./COMMON_PATTERNS.md) for specific patterns

**For complete examples:**
- See the wedding module: `app/(main)/weddings/`
- Reference implementation includes all three layers with full functionality
