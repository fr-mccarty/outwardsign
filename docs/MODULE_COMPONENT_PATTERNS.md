# Module Component Patterns

> **🔴 Context Requirement:** When implementing module component structure (list pages, view pages, forms, etc.), you MUST include this file in your context. This file provides navigation to detailed patterns for all 8 module component files that ensure consistency across the application.

This document provides an overview and navigation guide for the 8 main component files that make up each module in Outward Sign. For detailed implementation patterns, code examples, and best practices, see the linked pattern documents.

**Reference Module:** Always use the Mass Liturgies module (`src/app/(main)/mass-liturgies/`) as the canonical implementation example.

---

## 🔴 Critical: PageContainer & ModuleViewContainer Usage

**View Page Structure:**
1. **Server Page** (`[id]/page.tsx`) - **Must wrap in `PageContainer`** with title and description
2. **View Client** (`[id]/[entity]-view-client.tsx`) - **Must use `ModuleViewContainer`** which internally manages `ModuleViewPanel`

**Never use `ModuleViewContainer` without `PageContainer` wrapping it in the server page.**

This two-layer pattern ensures:
- Consistent page headers and metadata (PageContainer)
- Standardized module view layout with side panel (ModuleViewContainer)
- Proper breadcrumb and navigation structure

**See:** [MODULE_VIEW_CONTAINER_PATTERN.md](./MODULE_VIEW_CONTAINER_PATTERN.md) for complete details.

---

## Table of Contents

- [Overview](#overview)
- [The 8 Main Files](#the-8-main-files)
- [Detailed Pattern Documentation](#detailed-pattern-documentation)
- [Quick Reference](#quick-reference)
- [When to Use Each Pattern](#when-to-use-each-pattern)
- [Related Documentation](#related-documentation)

---

## Overview

Every module follows a consistent 8-file structure. This consistency ensures:
- Predictable code organization
- Easier onboarding for new developers
- Reusable patterns across all modules
- Testable, maintainable components

**The 8 Main Files:**

| # | File | Location | Type | Purpose | Pattern Doc |
|---|------|----------|------|---------|-------------|
| 1 | `page.tsx` | `[entity-plural]/` | Server | List page with search/filters | [list-page.md](./module-patterns/list-page.md) |
| 2 | `[entities]-list-client.tsx` | `[entity-plural]/` | Client | List interactivity and URL state | [list-page.md](./module-patterns/list-page.md) |
| 3 | `page.tsx` | `[entity-plural]/create/` | Server | Create page | [create-edit.md](./module-patterns/create-edit.md) |
| 4 | `page.tsx` | `[entity-plural]/[id]/` | Server | View page | [form-view.md](./module-patterns/form-view.md) |
| 5 | `page.tsx` | `[entity-plural]/[id]/edit/` | Server | Edit page | [create-edit.md](./module-patterns/create-edit.md) |
| 6 | `[entity]-form-wrapper.tsx` | `[entity-plural]/` | Client | Form container with loading state | [create-edit.md](./module-patterns/create-edit.md) |
| 7 | `[entity]-form.tsx` | `[entity-plural]/` | Client | Unified create/edit form | [form-view.md](./module-patterns/form-view.md) |
| 8 | `[entity]-view-client.tsx` | `[entity-plural]/[id]/` | Client | View page display with actions | [form-view.md](./module-patterns/form-view.md) |

**Note:** Delete functionality is handled by `ModuleViewContainer`/`ModuleViewPanel` via the `onDelete` prop, not a separate form-actions file.

---

## The 8 Main Files

### 1. List Page (Server)
**File:** `page.tsx` in `app/(main)/[entity-plural]/`

**Purpose:** Server-side list page that fetches entities with filters, computes stats, and passes data to client component.

**Key responsibilities:**
- Authentication
- Parse search params (Next.js 15 requires await)
- Fetch entities server-side with filters
- Calculate stats server-side
- Wrap in PageContainer with ModuleCreateButton

**See [list-page.md](./module-patterns/list-page.md) for complete pattern**

### 2. List Client
**File:** `[entities]-list-client.tsx` (PLURAL) in `app/(main)/[entity-plural]/`

**Purpose:** Client component that manages URL state for search/filters and renders the DataTable.

**Key responsibilities:**
- Search and filter UI with SearchCard
- URL state management with useListFilters hook
- DataTable with column builders
- Empty states (DataTable emptyState + ContentCard)
- ListStatsBar at bottom
- Delete confirmation dialog

**See [list-page.md](./module-patterns/list-page.md) for complete pattern**

### 3. Create Page (Server)
**File:** `page.tsx` in `app/(main)/[entity-plural]/create/`

**Purpose:** Server page for creating new entities.

**Key responsibilities:**
- Authentication
- Breadcrumbs
- Render FormWrapper without entity prop

**See [create-edit.md](./module-patterns/create-edit.md) for complete pattern**

### 4. View Page (Server)
**File:** `page.tsx` in `app/(main)/[entity-plural]/[id]/`

**Purpose:** Server page for viewing a single entity with full details.

**Key responsibilities:**
- Authentication
- Fetch entity with relations
- Return notFound() if entity doesn't exist
- Wrap in PageContainer with dynamic title
- Render ViewClient with entity

**See [form-view.md](./module-patterns/form-view.md) for complete pattern**

### 5. Edit Page (Server)
**File:** `page.tsx` in `app/(main)/[entity-plural]/[id]/edit/`

**Purpose:** Server page for editing an existing entity.

**Key responsibilities:**
- Authentication
- Fetch entity with relations
- Return notFound() if entity doesn't exist
- Breadcrumbs with entity context
- Render FormWrapper with entity prop

**See [create-edit.md](./module-patterns/create-edit.md) for complete pattern**

### 6. Form Wrapper (Client)
**File:** `[entity]-form-wrapper.tsx` in `app/(main)/[entity-plural]/`

**Purpose:** Wraps the form with PageContainer and manages loading state. Shows action buttons in edit mode.

**Key responsibilities:**
- Wrap form in PageContainer
- Show View button (edit mode only)
- Show SaveButton (both modes)
- Manage loading state
- Pass formId to form

**See [create-edit.md](./module-patterns/create-edit.md) for complete pattern**

### 7. Unified Form (Client)
**File:** `[entity]-form.tsx` in `app/(main)/[entity-plural]/`

**Purpose:** Single form component that handles both create and edit modes.

**Key responsibilities:**
- Detect create vs edit mode via entity prop
- Form state management
- Zod validation (recommended)
- Submit handler with create/update logic
- Redirect to edit page (create) or refresh (update)
- FormBottomActions (Save + Cancel)

**See [form-view.md](./module-patterns/form-view.md) for complete pattern**

### 8. View Client
**File:** `[entity]-view-client.tsx` in `app/(main)/[entity-plural]/[id]/`

**Purpose:** Displays entity details, renders liturgy content, and integrates ModuleViewContainer with ModuleViewPanel.

**Key responsibilities:**
- Use ModuleViewContainer
- Provide action buttons (Edit, Print)
- Provide export buttons (PDF, Word)
- Provide template selector
- Provide status label
- Handle delete via onDelete prop

**See [form-view.md](./module-patterns/form-view.md) for complete pattern**

---

## Detailed Pattern Documentation

### By Category

**List Pages:**
- **[list-page.md](./module-patterns/list-page.md)** - Complete patterns for List Page (Server) and List Client including SearchCard, DataTable, ListStatsBar, status/language badges, and column builders

**Create & Edit:**
- **[create-edit.md](./module-patterns/create-edit.md)** - Complete patterns for Create Page, Edit Page, and Form Wrapper including authentication, breadcrumbs, and isEditing pattern

**Form & View:**
- **[form-view.md](./module-patterns/form-view.md)** - Complete patterns for View Page, Unified Form (with Zod validation), and View Client including ModuleViewContainer integration

**Best Practices:**
- **[best-practices.md](./module-patterns/best-practices.md)** - Common patterns, error handling, troubleshooting, and common mistakes to avoid

### By File Type

| When you need to implement... | Read this pattern doc |
|-------------------------------|------------------------|
| List page or list client | [list-page.md](./module-patterns/list-page.md) |
| Create page, edit page, or form wrapper | [create-edit.md](./module-patterns/create-edit.md) |
| View page, unified form, or view client | [form-view.md](./module-patterns/form-view.md) |
| Troubleshooting or best practices | [best-practices.md](./module-patterns/best-practices.md) |

---

## Quick Reference

### File Naming Conventions

```
app/(main)/[entity-plural]/
├── page.tsx                              # 1. List Page (Server)
├── [entities]-list-client.tsx            # 2. List Client (PLURAL)
├── [entity]-form-wrapper.tsx             # 6. Form Wrapper (SINGULAR)
├── [entity]-form.tsx                     # 7. Unified Form (SINGULAR)
├── create/
│   └── page.tsx                         # 3. Create Page (Server)
└── [id]/
    ├── page.tsx                         # 4. View Page (Server)
    ├── [entity]-view-client.tsx         # 8. View Client (SINGULAR)
    └── edit/
        └── page.tsx                     # 5. Edit Page (Server)
```

### Key Patterns at a Glance

**Server vs Client:**
- All `page.tsx` files are server components (no 'use client')
- All interactive components are client components ('use client')

**Type Usage:**
- Use `[Entity]WithRelations` for: edit/view pages, forms that access relations
- Use base `[Entity]` for: form wrapper, simple prop passing

**Redirect Behavior:**
- Create: Redirect to edit page (`/entities/${id}/edit`)
- Update: Stay on edit page (`router.refresh()`)
- Delete: Redirect to list page (`/entities`)

**Container Usage:**
- List page: Wrap in `PageContainer` (server page)
- Create/Edit: Wrap in `PageContainer` (form wrapper)
- View: Wrap in `PageContainer` (server page) + `ModuleViewContainer` (view client)

---

## When to Use Each Pattern

### I need to create a new module
1. Start with [MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md) for step-by-step guide
2. Reference all pattern docs for implementation details
3. Use Wedding module as reference implementation

### I need to fix a list page
- Read [list-page.md](./module-patterns/list-page.md)
- Check [LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md) for visual examples

### I need to fix a form
- Read [form-view.md](./module-patterns/form-view.md) for form patterns
- Read [FORMS.md](./FORMS.md) for form validation and styling rules
- Read [VALIDATION.md](./VALIDATION.md) for Zod patterns

### I need to add a create or edit page
- Read [create-edit.md](./module-patterns/create-edit.md)
- Reference Wedding create/edit pages

### I need to fix a view page
- Read [form-view.md](./module-patterns/form-view.md)
- Read [MODULE_VIEW_CONTAINER_PATTERN.md](./MODULE_VIEW_CONTAINER_PATTERN.md)

### I'm getting errors or something's not working
- Read [best-practices.md](./module-patterns/best-practices.md) troubleshooting section
- Check common mistakes section
- Verify you're following the correct patterns

---

## Related Documentation

**Core Module Documentation:**
- **[MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md)** - 🔴 Step-by-step module creation checklist
- **[MODULE_DEVELOPMENT.md](./MODULE_DEVELOPMENT.md)** - File naming, constants, components, types
- **[MODULE_REGISTRY.md](./MODULE_REGISTRY.md)** - Complete module registry with routes and labels

**List View Documentation:**
- **[LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md)** - 🔴 Complete list view pattern with visual examples

**Form Documentation:**
- **[FORMS.md](./FORMS.md)** - 🔴 CRITICAL - Form patterns, validation, styling
- **[VALIDATION.md](./VALIDATION.md)** - React Hook Form + Zod validation patterns

**Component Documentation:**
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Globally reusable components
- **[MODULE_VIEW_CONTAINER_PATTERN.md](./MODULE_VIEW_CONTAINER_PATTERN.md)** - ModuleViewContainer usage

**Content & Export Documentation:**
- **[LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)** - Content builders and renderers
- **[CONTENT_BUILDER_SECTIONS.md](./CONTENT_BUILDER_SECTIONS.md)** - Section types and builders
- **[RENDERER.md](./RENDERER.md)** - HTML/PDF/Word rendering

**Testing Documentation:**
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing patterns and debugging
- **[TESTING_ARCHITECTURE.md](./TESTING_ARCHITECTURE.md)** - Component testability standards
