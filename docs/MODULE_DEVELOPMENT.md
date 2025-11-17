# MODULE_DEVELOPMENT.md

> **Documentation for AI Agents:** This file contains comprehensive information about module development essentials in Outward Sign. Use this as a reference when creating or maintaining modules.

---

## Table of Contents

- [File Naming Conventions](#file-naming-conventions)
- [Directory Structure](#directory-structure)
- [Constants Pattern](#constants-pattern-critical)
- [Reusable Module Components](#reusable-module-components)
- [Component Registry](#component-registry-critical)
- [Content Builders & Renderers](#content-builders--renderers)
- [Report Builders](#report-builders)
- [Type Patterns](#type-patterns)

---

## File Naming Conventions

- **Server pages:** `page.tsx` (async function, no 'use client')
- **Client components:** `[entity]-[purpose].tsx` (e.g., `reading-form.tsx`, `reading-list-client.tsx`, `reading-form-actions.tsx`)
- **Server Actions:** `lib/actions/[entity].ts` or `[entities].ts`
- **Types:** Defined in Server Action files, exported for reuse

---

## Directory Structure

### Main Module Directory

**Location:** `app/(main)/[entity-plural]/`

```
[entity-plural]/
├── page.tsx                       # 1. List Page (Server)
├── loading.tsx                    # Suspense fallback (imports reusable component)
├── error.tsx                      # Error boundary (imports reusable component)
├── [entities]-list-client.tsx     # 2. List Client - note PLURAL naming
├── [entity]-form-wrapper.tsx      # 6. Form Wrapper (Client)
├── [entity]-form.tsx              # 7. Unified Form (Client)
├── create/
│   └── page.tsx                  # 3. Create Page (Server)
└── [id]/
    ├── page.tsx                  # 4. View Page (Server)
    ├── [entity]-view-client.tsx  # 8. View Client
    ├── [entity]-form-actions.tsx # 9. Form Actions (Client)
    ├── loading.tsx               # Suspense fallback (imports reusable component)
    ├── error.tsx                 # Error boundary (imports reusable component)
    └── edit/
        └── page.tsx              # 5. Edit Page (Server)
```

**IMPORTANT:** All 9 numbered files are REQUIRED and must follow the wedding module pattern exactly.

---

### Print View Directory

**Location:** `app/print/[entity-plural]/`

```
print/[entity-plural]/
└── [id]/
    └── page.tsx               # Print-optimized view (Server)
```

**Key Points:**
- **IMPORTANT:** Directory name must be PLURAL (e.g., `weddings`, `funerals`, `quinceaneras`) to match `modulePath` prop
- Fetches entity with relations
- Uses print-specific styling (can override global styles)
- No navigation elements, optimized for printing/PDF generation

**For detailed implementation patterns for print pages, see [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md).**

---

### API Routes Directory

**Location:** `app/api/[entity-plural]/`

```
api/[entity-plural]/
└── [id]/
    ├── pdf/
    │   └── route.ts           # PDF export endpoint
    └── word/
        └── route.ts           # Word document export endpoint
```

**Key Points:**
- Uses content builders to generate liturgy document
- PDF endpoint converts HTML to PDF
- Word endpoint generates .docx file
- Both endpoints fetch entity with relations and use `build[Entity]Liturgy()` function

**For detailed implementation patterns for export endpoints, see [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md).**

---

## 🔴 Constants Pattern (CRITICAL)

**For detailed constants pattern documentation, see [CONSTANTS_PATTERN.md](./CONSTANTS_PATTERN.md).**

**Location:** `src/lib/constants.ts`

The application uses a **dual-constant pattern** for all dropdown values, status fields, and enumerated types:

1. **VALUES array** - Uppercase keys stored in database (e.g., `['ACTIVE', 'INACTIVE', 'COMPLETED']`)
2. **Type definition** - TypeScript type for type safety
3. **LABELS object** - Bilingual display labels (English + Spanish)

### Quick Example

```typescript
export const MODULE_STATUS_VALUES = ['ACTIVE', 'INACTIVE', 'COMPLETED'] as const
export type ModuleStatus = typeof MODULE_STATUS_VALUES[number]
export const MODULE_STATUS_LABELS: Record<ModuleStatus, { en: string; es: string }> = {
  ACTIVE: { en: 'Active', es: 'Activo' },
  INACTIVE: { en: 'Inactive', es: 'Inactivo' },
  COMPLETED: { en: 'Completed', es: 'Completado' }
}
```

**Why:** Database consistency, bilingual support, type safety, centralized maintenance.

### 🔴 CRITICAL - Event Type Display Rule

**NEVER display event type values directly from the database.** Always use `EVENT_TYPE_LABELS` to show localized, user-friendly labels instead of raw database values like `WEDDING_RECEPTION`.

```tsx
// ✅ CORRECT
import { EVENT_TYPE_LABELS } from '@/lib/constants'
<p>{EVENT_TYPE_LABELS[event.event_type].en}</p>

// ❌ WRONG - never display raw event_type
<p>{event.event_type}</p>
```

**See [CONSTANTS_PATTERN.md](./CONSTANTS_PATTERN.md) for full usage examples, standard constant types, and adding new constants.**

---

## Reusable Module Components

**For complete component documentation, see [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md).**

Key reusable components for module view pages:

- **ModuleViewPanel** - Side panel with Edit button, Print view, PDF/Word downloads, metadata
- **ModuleViewContainer** - Complete view page container with side panel + liturgy content rendering
- **usePickerState Hook** - Standardized state management for picker modals

See COMPONENT_REGISTRY.md for full props, usage examples, and all available components.

---

## 🔴 Component Registry (CRITICAL)

**ALWAYS consult [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) before using or creating components.**

The Component Registry contains comprehensive documentation on all reusable components including:
- Picker components (PeoplePicker, EventPicker, LocationPicker)
- Form components (FormField, SaveButton, CancelButton)
- Layout components (PageContainer, ModuleViewPanel, ModuleViewContainer)
- Hooks (usePickerState)

### 🔴 CRITICAL - When Creating New Components

When you create a new reusable component (pickers, form components, layout components, hooks, etc.), you **MUST** add it to the Component Registry:

1. Add the component to `docs/COMPONENT_REGISTRY.md` with full documentation
2. Include props interface, usage examples, and when to use it
3. Update the list above in this MODULE_DEVELOPMENT.md file if it's a new category
4. Follow the documentation pattern established in COMPONENT_REGISTRY.md

**For picker behavior patterns (auto-select, no redirect), see [PICKER_PATTERNS.md](./PICKER_PATTERNS.md).**

---

## Content Builders & Renderers

**For comprehensive documentation on the liturgical script system, see [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md).**

Content builders create liturgy document structures that can be rendered in multiple formats. See LITURGICAL_SCRIPT_SYSTEM.md for:
- Complete registry of all 7 modules using content builders
- Template selector architecture pattern (view pages only, not edit pages)
- Interfaces, template structure, styling, and export functionality

---

## Report Builders

**For comprehensive documentation on the report builder system, see [REPORT_BUILDER_SYSTEM.md](./REPORT_BUILDER_SYSTEM.md).**

Report builders generate tabular reports with aggregations and filtering for administrative purposes. Different from liturgical scripts (individual entities), reports aggregate data across multiple records. See REPORT_BUILDER_SYSTEM.md for:
- Report vs. liturgical script use cases
- Complete implementation guide (server actions, builders, UI, print, CSV)
- File structure and architecture patterns
- Mass Intentions Report as reference implementation

---

## Type Patterns

### WithRelations Interface Pattern

All modules should define a `[Entity]WithRelations` interface that extends the base entity type and includes related data:

```tsx
// In lib/actions/[entity].ts
export interface WeddingWithRelations extends Wedding {
  bride?: Person | null
  groom?: Person | null
  wedding_event?: Event | null
  // ... all related foreign keys expanded to full objects
}

export async function get[Entity]WithRelations(id: string): Promise<[Entity]WithRelations | null> {
  // 1. Fetch base entity
  // 2. Use Promise.all() to fetch all related data in parallel
  // 3. Return merged object
}
```

**Why:**
- Forms need related data for display (not just IDs)
- Type-safe access to nested properties
- Eliminates unsafe `as any` type casts
- View pages need full entity details for rendering

---

**Last Updated:** 2025-11-17
**Maintained By:** Outward Sign Development Team
