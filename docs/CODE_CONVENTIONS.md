# Code Conventions

This document serves as a navigation hub for all coding standards and conventions used in Outward Sign. Following these conventions ensures consistency, maintainability, and quality across the codebase.

---

## Navigation

**Detailed convention documentation has been split into focused category files:**

- **[GENERAL.md](./code-conventions/GENERAL.md)** - Code style, TypeScript, imports, server/client components, file naming, spelling corrections
- **[BILINGUAL.md](./code-conventions/BILINGUAL.md)** - English/Spanish implementation patterns, constants, temporary language handling
- **[UI_PATTERNS.md](./code-conventions/UI_PATTERNS.md)** - Dialogs, empty states, tables, scrollable modals, click hierarchy, responsive design
- **[FORMATTING.md](./code-conventions/FORMATTING.md)** - Page title formatting, helper utilities, date/time/person/location formatters
- **[DEVELOPMENT.md](./code-conventions/DEVELOPMENT.md)** - Component usage hierarchy, TypeScript patterns, auth integration, abstraction principle

---

## Critical Rules Summary

### 🔴 Unified Event Data Model Patterns

**System Type Metadata:**
- System types (mass, special-liturgy, sacrament, event) are stored as enum field in `event_types.system_type`
- Metadata (icons, bilingual labels) is in `src/lib/constants/system-types.ts`, NOT in database
- Use `SYSTEM_TYPE_METADATA` constant for labels and icons

**Computed Titles:**
- Calendar event titles are computed (not stored) from `master_event.title + field_name`
- Use helpers: `computeMasterEventTitle()`, `computeCalendarEventTitle()`

**Role Definitions:**
- Stored as JSONB in `event_types.role_definitions`
- Structure: `{"roles": [{"id": "presider", "name": "Presider", "required": true}, ...]}`
- Assignments stored in `master_event_roles` table

**calendar_event Input Type:**
- `input_type: "calendar_event"` creates records in `calendar_events` table
- Stores calendar_event.id in `master_events.field_values`
- Unlike other input types, it creates a new record (not just a reference)

**See:** [ARCHITECTURE.md - Unified Event Data Model](./ARCHITECTURE.md#unified-event-data-model)

### 🔴 No Inline/Bespoke Functions

**NEVER create inline utility functions.** All formatting and utility logic must be centralized in `/src/lib/utils/` files.

**See:** [GENERAL.md - No Inline/Bespoke Functions](./code-conventions/GENERAL.md#-no-inlinebespoke-functions-critical)

### 🔴 Data Model vs. Filter Interfaces

Database model interfaces must use strict types, NEVER `| 'all'`. The `'all'` option is ONLY for UI filter states.

**See:** [GENERAL.md - Data Model Interfaces vs. Filter Interfaces](./code-conventions/GENERAL.md#-data-model-interfaces-vs-filter-interfaces)

### 🔴 Bilingual Implementation

Most content is bilingual (English & Spanish). All user-facing text must have both `.en` and `.es` translations.

**See:** [BILINGUAL.md - Overview](./code-conventions/BILINGUAL.md#overview)

### 🔴 DialogButton Component

Always use the `DialogButton` component instead of manually wrapping Button with DialogTrigger. This handles cursor styling automatically.

**See:** [UI_PATTERNS.md - DialogButton Component](./code-conventions/UI_PATTERNS.md#-dialogbutton-component-critical)

### 🔴 Click Hierarchy

NEVER nest clickable elements inside other clickable elements. This causes user confusion and accessibility problems.

**See:** [UI_PATTERNS.md - Click Hierarchy](./code-conventions/UI_PATTERNS.md#-click-hierarchy-critical)

### 🔴 No Horizontal Tabs

NEVER use horizontal tabs at the top of pages. They are not mobile-friendly. Use separate pages, collapsible sections, or stacked FormSectionCards instead.

**See:** [UI_PATTERNS.md - No Horizontal Tabs](./code-conventions/UI_PATTERNS.md#-no-horizontal-tabs-critical)

### 🔴 Page Title Formatting

All module view and edit pages must follow the format: `[Dynamic Content]-[Module Name]`

**See:** [FORMATTING.md - Page Title Formatting](./code-conventions/FORMATTING.md#-page-title-formatting)

### 🔴 Always Format Dates

Never display raw date strings (e.g., "2025-07-15"). Always use helper functions from `formatters.ts`.

**See:** [FORMATTING.md - Helper Utilities Pattern](./code-conventions/FORMATTING.md#-helper-utilities-pattern)

---

## Quick Reference by Task

### When Writing Components

1. Use Server Components by default ([GENERAL.md](./code-conventions/GENERAL.md#server-vs-client-components))
2. Follow component usage hierarchy ([DEVELOPMENT.md](./code-conventions/DEVELOPMENT.md#component-usage-hierarchy))
3. Use mobile-first responsive design ([DEVELOPMENT.md](./code-conventions/DEVELOPMENT.md#responsive-design))
4. Never nest clickable elements ([UI_PATTERNS.md](./code-conventions/UI_PATTERNS.md#-click-hierarchy-critical))

### When Working with Forms

1. Use FormField for all inputs ([FORMS.md](../docs/FORMS.md))
2. Use SaveButton and CancelButton ([DEVELOPMENT.md](./code-conventions/DEVELOPMENT.md#consistent-design-patterns))
3. Include bilingual labels ([BILINGUAL.md](./code-conventions/BILINGUAL.md#user-facing-content))

### When Displaying Data

1. Always format dates with helpers ([FORMATTING.md](./code-conventions/FORMATTING.md#datetime-formatting))
2. Use `person.full_name` for person names ([FORMATTING.md](./code-conventions/FORMATTING.md#person-formatting))
3. Follow page title format ([FORMATTING.md](./code-conventions/FORMATTING.md#-page-title-formatting))

### When Creating Dialogs/Modals

1. Use shadcn components, not system dialogs ([UI_PATTERNS.md](./code-conventions/UI_PATTERNS.md#dialog-and-modal-standards))
2. Use DialogButton for triggers ([UI_PATTERNS.md](./code-conventions/UI_PATTERNS.md#-dialogbutton-component-critical))
3. Make content scrollable if needed ([UI_PATTERNS.md](./code-conventions/UI_PATTERNS.md#scrollable-modals))

### When Abstracting Code

1. Follow the Rule of Three ([DEVELOPMENT.md](./code-conventions/DEVELOPMENT.md#abstraction-principle-rule-of-three))
2. Copy-paste is acceptable for 1-2 uses
3. Abstract at 3 uses to remove duplication

---

## Related Documentation

### Core Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Data architecture and authentication patterns
- [FORMATTERS.md](./FORMATTERS.md) - Complete helper function reference
- [FORMS.md](./FORMS.md) - Form patterns and validation
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - Complete component library

### Design and UI

- [DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md) - UI/UX design principles
- [STYLES.md](./STYLES.md) - Dark mode, semantic tokens, styling rules

### Module Development

- [MODULE_DEVELOPMENT.md](./MODULE_DEVELOPMENT.md) - File structure, constants, content builders
- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - 8-file module pattern
- [MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md) - Creating new modules

---

## Code Style Essentials

### General

- **Indentation:** 2 spaces (no tabs)
- **Language:** TypeScript for all new files
- **Quotes:** Single quotes for strings
- **Semicolons:** Use at end of statements
- **Trailing commas:** Use in multi-line objects/arrays

### File Naming

- **Components:** `kebab-case.tsx` → `export function PascalCase()`
- **Server Actions:** `lib/actions/module-name.ts`
- **Types:** Defined in server action files

### Import Order

Completely flexible - organize however makes sense for the file. No enforced ordering rules.

---

## TypeScript Standards

- Use type inference when obvious
- Explicit types for function parameters and returns
- Avoid `any` type
- Use interfaces for object shapes
- Use type aliases for unions and complex types

**Example:**
```typescript
export interface Wedding {
  id: string
  status: WeddingStatus
  created_at: string
}

export async function getWedding(id: string): Promise<Wedding | null> {
  // ...
}
```

---

## Authentication Pattern

All server pages and actions must check authentication:

```typescript
// Server page
export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // ...
}

// Server action
export async function createRecord(data: FormData) {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  // ...
}
```

**See:** [DEVELOPMENT.md - Supabase Auth Integration](./code-conventions/DEVELOPMENT.md#supabase-auth-integration)

---

## Summary

Following these conventions ensures:
- **Consistency** across the entire codebase
- **Quality** through proactive corrections and bilingual support
- **Maintainability** via the Rule of Three and helper utilities
- **Accessibility** through proper UI patterns and click hierarchy
- **User experience** with proper page titles and formatting

**For detailed information on any topic, navigate to the relevant category file above.**
