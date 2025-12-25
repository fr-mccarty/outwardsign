# Module Patterns: List Page & List Client

> **Part of:** [Module Component Patterns](../MODULE_COMPONENT_PATTERNS.md)
>
> **🔴 Primary Reference:** For complete list view documentation including code examples, default filter application, checklists, and troubleshooting, see **[LIST_VIEW_PATTERN.md](../LIST_VIEW_PATTERN.md)**.

---

## Overview

Every module's list view consists of two components:

1. **List Page (Server)** - `page.tsx` - Fetches data, handles auth, manages search params
2. **List Client** - `[entities]-list-client.tsx` (PLURAL) - Renders UI, manages URL state

**Reference Implementation:** Masses module (`src/app/(main)/mass-liturgies/`)

---

## Quick Reference

### List Page (Server) Requirements

- 🔴 Wrap in `PageContainer` with title, description, and `primaryAction`
- 🔴 Apply default filters on server BEFORE calling server action (see [LIST_VIEW_PATTERN.md](../LIST_VIEW_PATTERN.md#-default-filter-application-critical))
- ✅ `searchParams` is a Promise in Next.js 15 - must await
- ✅ Use `ModuleCreateButton` for primaryAction
- ✅ Add `export const dynamic = 'force-dynamic'`

### List Client Requirements

- 🔴 NO Create button - lives in PageContainer's primaryAction
- ✅ Use `SearchCard`, `DataTable`, `ListStatsBar`, `ScrollToTopButton`
- ✅ Use `useListFilters` hook for URL state
- ✅ File name is PLURAL: `weddings-list-client.tsx`

---

## ListView Card Status and Language Pattern

**CRITICAL:** All ListView cards with status fields must use the `status` and `statusType` props.

### Visual Layout

```
┌─────────────────────────────────────────┐
│ Title...     [Status Badge]    [Edit ✏️] │ ← Status in header
│ [Language Badge]                         │ ← Language below title
│─────────────────────────────────────────│
│ 📅 Date/Time info                        │
│ Entity Details...                        │
│                         [Preview Button] │
└─────────────────────────────────────────┘
```

### Implementation

```tsx
<ListViewCard
  title="Entity Name"
  editHref={`/entities/${entity.id}/edit`}
  viewHref={`/entities/${entity.id}`}
  status={entity.status}              // Status badge
  statusType="module"                 // "module", "mass", or "mass-intention"
  language={entity.event?.language}   // Language display
>
  {/* Card content */}
</ListViewCard>
```

### Status Rules

- Status badge appears in header between title and edit button
- Title truncates (`line-clamp-1`) to make room for status
- ListViewCard renders ModuleStatusLabel automatically
- Use `statusType="module"` for sacrament modules

### Modules Using These Patterns

| Pattern | Modules |
|---------|---------|
| **Status** | Weddings, Funerals, Baptisms, Presentations, Quinceañeras |
| **Language** | Weddings, Funerals, Baptisms, Presentations, Quinceañeras, Masses, Events, Readings |

---

## Related Documentation

- **[LIST_VIEW_PATTERN.md](../LIST_VIEW_PATTERN.md)** - 🔴 Complete pattern with examples and checklist
- **[LIST_VIEW_CATALOG.md](../LIST_VIEW_CATALOG.md)** - Overview of all list view patterns (Card Grid, Drag & Drop, Table)
- **[form-view.md](./form-view.md)** - Unified Form and View Client patterns
- **[create-edit.md](./create-edit.md)** - Create and Edit page patterns
