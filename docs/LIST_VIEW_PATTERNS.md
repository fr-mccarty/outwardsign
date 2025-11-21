# List View Patterns

This document catalogs the three main list view patterns used throughout the application and identifies which modules use each pattern.

---

## Overview

| Pattern | Component | Use Case |
|---------|-----------|----------|
| **Card Grid** | `ListViewCard` | Primary entities with status, edit/preview actions (NO drag & drop) |
| **Drag & Drop List** | `DraggableListItem` | Orderable items (display_order field) - vertical list only |
| **Table** | `DataTable` or custom | Dense data, many columns, bulk operations |

---

## Search/Filter Card Pattern

**All list views should include a Search Card** at the top for filtering. This provides consistent UX across the application.

```tsx
<Card className="mb-6">
  <CardHeader>
    <CardTitle>Search</CardTitle>
    <CardDescription>Search for a [Entity Name]</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
    {/* Additional filters (status dropdown, etc.) can be added here */}
  </CardContent>
</Card>
```

---

## 1. Card Grid Layout (`ListViewCard`)

**Component:** `src/components/list-view-card.tsx`

**Layout (top to bottom):**
1. Title (truncated) + Edit button (icon only, top right)
2. Language (uppercase text, only if language prop provided)
3. Datetime (formatted date + time with Calendar icon, only if datetime prop provided)
4. Children/Description slot
5. Status badge (bottom left) + Preview button with Eye icon (bottom right)

**Props:**
- `title` - Card title (required)
- `editHref` - Link for edit button (required)
- `viewHref` - Link for preview button (required)
- `viewButtonText` - Text for preview button (default: "View Details")
- `status` - Status value for badge (optional)
- `statusType` - Status type: "module" (default)
- `language` - Language code for display (optional)
- `datetime` - Object with `date` (required) and `time` (optional) for formatted display
- `children` - Custom content slot (required)

**Modules Using ListViewCard:**

| Module | Route | Status Field |
|--------|-------|--------------|
| Weddings | `/weddings` | `status` (module) |
| Funerals | `/funerals` | `status` (module) |
| Baptisms | `/baptisms` | `status` (module) |
| Quinceaneras | `/quinceaneras` | `status` (module) |
| Presentations | `/presentations` | `status` (module) |
| Events | `/events` | - |
| Masses | `/masses` | `status` (mass) |
| Mass Intentions | `/mass-intentions` | `status` (mass-intention) |
| Mass Times | `/mass-times` | `is_active` → ACTIVE/INACTIVE |
| Mass Role Templates | `/mass-role-templates` | `is_active` → ACTIVE/INACTIVE |
| Readings | `/readings` | - |
| People | `/people` | - |
| Locations | `/locations` | - |
| Group Members | `/group-members` | - |

---

## 2. Drag & Drop List Layout

**🔴 CRITICAL:** Drag & drop should ONLY be used with vertical list layouts, NEVER with card grids. Use `verticalListSortingStrategy` from `@dnd-kit/sortable`.

**Components:**
- `DraggableListItem` (`src/components/draggable-list-item.tsx`) - Compact list item with drag handle
- `@dnd-kit/core`, `@dnd-kit/sortable` - For custom implementations

**Features:**
- Reorderable items via drag handle
- Persists `display_order` to database
- Optimistic UI updates with rollback on error
- **Must use vertical list layout** (`flex flex-col gap-2`)

**🔴 Truncation in Flex Containers:**
When truncating text inside flex containers, use `w-0` with `flex-1` to force the element to shrink:

```tsx
// This pattern forces proper truncation in flex layouts
<div className="flex-1 w-0">
  <div className="truncate">{title}</div>
  <p className="truncate">{description}</p>
</div>
```

Without `w-0`, the flex item won't shrink below its content size and text will overflow off screen.

**Modules Using Drag & Drop:**

| Module | Route | Order Field | Component |
|--------|-------|-------------|-----------|
| Mass Types | `/mass-types` | `display_order` | Custom (dialog-based) |
| Mass Roles | `/mass-roles` | `display_order` | `DraggableListItem` |
| Mass Role Template Items | (embedded in template form) | `display_order` | Custom vertical list |

**Potential Candidates for Drag & Drop:**
- Readings (liturgical order)

---

## 3. Custom Card Layouts (Not Using ListViewCard)

These modules use raw `Card` components due to specialized requirements:

| Module | Route | Current Pattern | Notes |
|--------|-------|-----------------|-------|
| Groups | `/groups` | Table-like Card | Dialog-based CRUD, different architecture |
| Mass Types | `/mass-types` | Custom sortable items | Dialog-based editing, inline delete |
| Mass Role Members | `/mass-role-members` | Stats cards + list | Specialized view, may not fit ListViewCard |

---

## 4. Table Layout

**Component:** `src/components/data-table/` (if exists) or custom `<table>`

**Features:**
- Dense data display
- Sortable columns
- Bulk selection
- Pagination

**Modules Using Table Layout:**
- *Currently none identified*

**Potential Candidates for Table:**
- People (for admin bulk management)
- Reports (read-only data views)

---

## Recommendations

### Completed

1. ~~**Migrate Group Members to ListViewCard**~~ ✅
2. ~~**Add Drag & Drop to Mass Roles**~~ ✅
3. ~~**Create DraggableListCard Component**~~ ✅

### Future Improvements

1. **Create TableView Component:**
   - For dense data views
   - Standard sorting, filtering, pagination
   - Bulk action support

2. **Add Drag & Drop to Readings**
   - Could benefit from liturgical order reordering

---

## Status Type Reference

When using `ListViewCard` with status:

```tsx
// For modules with status field (weddings, funerals, etc.)
<ListViewCard
  status={entity.status}  // Already uppercase: 'PLANNING', 'ACTIVE', etc.
  statusType="module"
/>

// For modules with is_active boolean
<ListViewCard
  status={entity.is_active ? 'ACTIVE' : 'INACTIVE'}
  statusType="module"
/>

// For masses
<ListViewCard
  status={mass.status}
  statusType="mass"
/>

// For mass intentions
<ListViewCard
  status={intention.status}
  statusType="mass-intention"
/>
```

Status labels are resolved via `MODULE_STATUS_LABELS` in `src/lib/constants.ts`.
