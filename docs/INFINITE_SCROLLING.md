# Infinite Scrolling

**Status:** Implemented
**Last Updated:** 2025-12-02

This document describes the infinite scrolling pattern used throughout the application for list views and picker components.

---

## Table of Contents

- [Overview](#overview)
- [Constants](#constants)
- [Core Components](#core-components)
- [Implementation Pattern](#implementation-pattern)
- [Server Page Pattern](#server-page-pattern)
- [List Client Pattern](#list-client-pattern)
- [EndOfListMessage Component](#endoflistmessage-component)
- [Testing](#testing)
- [Current Implementation Status](#current-implementation-status)

---

## Overview

Infinite scrolling automatically loads more items as the user scrolls down, replacing traditional pagination. This provides a more modern, mobile-friendly user experience.

**Key Benefits:**
- No need to click "Next" buttons
- Seamless browsing experience
- Better mobile UX
- Reduced initial load time (only loads 25 items initially)

**How it works:**
1. Server loads first 25 items
2. As user scrolls near bottom (100px), client automatically fetches next 50 items
3. New items append to the list
4. Process repeats until all items are loaded
5. "End of list" message displays when complete

---

## Constants

All infinite scroll constants are defined in `src/lib/constants.ts`:

```typescript
// List view pagination and infinite scroll
export const LIST_VIEW_PAGE_SIZE = 25 // Number of items to load on initial page load
export const INFINITE_SCROLL_LOAD_MORE_SIZE = 50 // Number of items to load on each subsequent scroll
export const INFINITE_SCROLL_THRESHOLD = 100 // Pixels from bottom to trigger load more
export const SCROLL_TO_TOP_THRESHOLD = 300 // Pixels to scroll before showing scroll-to-top button
```

### Why Different Sizes?

- **Initial load (25 items):** Fast page load, user sees content quickly
- **Subsequent loads (50 items):** Larger batches reduce total number of requests once user is actively browsing

---

## Core Components

### 1. useInfiniteScroll Hook

**Location:** `src/hooks/use-infinite-scroll.ts`

```typescript
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

const { sentinelRef, isLoading } = useInfiniteScroll({
  onLoadMore: handleLoadMore,
  hasMore: hasMore,
  threshold: INFINITE_SCROLL_THRESHOLD // Optional, defaults to constant
});
```

**How it works:**
- Uses `IntersectionObserver` to detect when sentinel element enters viewport
- Triggers `onLoadMore` callback when user scrolls within `threshold` pixels of bottom
- Manages loading state automatically

### 2. DataTable Integration

**Location:** `src/components/data-table/data-table.tsx`

The DataTable component has built-in infinite scroll support:

```typescript
<DataTable
  data={items}
  columns={columns}
  onLoadMore={handleLoadMore}  // Triggers when user scrolls near bottom
  hasMore={hasMore}             // Whether more items exist
  // ... other props
/>
```

**What it does:**
- Renders sentinel element at bottom of table when `onLoadMore` is provided and `hasMore` is true
- Shows "Loading more..." indicator while fetching
- Automatically handles scroll detection via `useInfiniteScroll` hook

### 3. EndOfListMessage Component

**Location:** `src/components/end-of-list-message.tsx`

Displays a message when all items have been loaded:

```typescript
import { EndOfListMessage } from '@/components/end-of-list-message';

<DataTable ... />
<EndOfListMessage show={!hasMore && items.length > 0} />
```

**Props:**
- `show: boolean` - Whether to display the message
- `className?: string` - Optional additional CSS classes

**Features:**
- Accessible with `role="status"` and `aria-live="polite"`
- Minimal padding (`py-1`) for compact display
- Displays: "You've reached the end of the list"

---

## Implementation Pattern

### Complete Example: People Module

This is the reference implementation for all modules.

#### 1. Server Action

**File:** `src/lib/actions/people.ts`

```typescript
export interface PersonFilterParams {
  search?: string
  sort?: 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  offset?: number  // How many records to skip
  limit?: number   // How many records to fetch
}

export async function getPeople(filters?: PersonFilterParams): Promise<Person[]> {
  const supabase = await createClient()

  const offset = filters?.offset || 0
  const limit = filters?.limit || LIST_VIEW_PAGE_SIZE

  let query = supabase
    .from('people')
    .select('*')
    .range(offset, offset + limit - 1)  // Database-level pagination

  // Apply filters, sorting, etc.

  const { data, error } = await query
  if (error) throw error

  return data || []
}
```

**Key Points:**
- Use `offset` parameter (not `page`)
- Calculate range: `range(offset, offset + limit - 1)`
- Default `offset` to 0 for initial loads

#### 2. Server Page

**File:** `src/app/(main)/people/page.tsx`

```typescript
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

export default async function PeoplePage({ searchParams }: PageProps) {
  const params = await searchParams

  const filters: PersonFilterParams = {
    search: params.search,
    sort: params.sort as PersonFilterParams['sort'],
    offset: 0,  // Always 0 for server - fetch first page only
    limit: LIST_VIEW_PAGE_SIZE  // Use constant (25 items)
  }

  const people = await getPeople(filters)

  // Determine if more results exist
  const initialHasMore = people.length === LIST_VIEW_PAGE_SIZE

  return (
    <PageContainer>
      <PeopleListClient
        initialData={people}
        stats={stats}
        initialHasMore={initialHasMore}  // Pass to client
      />
    </PageContainer>
  )
}
```

**Key Points:**
- Always use `offset: 0` on server
- Use `LIST_VIEW_PAGE_SIZE` constant for `limit`
- Calculate `initialHasMore = items.length === LIST_VIEW_PAGE_SIZE`
- Pass `initialHasMore` prop to list client

#### 3. List Client

**File:** `src/app/(main)/people/people-list-client.tsx`

```typescript
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE } from '@/lib/constants'
import { EndOfListMessage } from '@/components/end-of-list-message'

interface PeopleListClientProps {
  initialData: Person[]
  stats: Stats
  initialHasMore: boolean  // New prop
}

export function PeopleListClient({ initialData, stats, initialHasMore }: PeopleListClientProps) {
  const router = useRouter()

  // Infinite scroll state
  const [people, setPeople] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)  // Start after initial page
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const filters = useListFilters({
    baseUrl: '/people',
    defaultFilters: { sort: 'name_asc' }
  })

  // Reset to initial data when filters change
  useEffect(() => {
    setPeople(initialData)
    setOffset(LIST_VIEW_PAGE_SIZE)
    setHasMore(initialHasMore)
  }, [initialData, initialHasMore])

  // Load more function for infinite scroll
  // 🔴 CRITICAL: Use useCallback to prevent function recreation
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const nextPeople = await getPeople({
        search: filters.getFilterValue('search'),
        sort: filters.getFilterValue('sort') as PersonFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE  // Load 50 items
      })

      // 🔴 CRITICAL: Filter duplicates to prevent React key errors
      setPeople(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const newPeople = nextPeople.filter(p => !existingIds.has(p.id))
        return [...prev, ...newPeople]
      })

      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextPeople.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more people:', error)
      toast.error('Failed to load more people')
    } finally {
      setIsLoadingMore(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingMore, hasMore, offset])

  return (
    <div className="space-y-6">
      <SearchCard>...</SearchCard>

      {people.length > 0 ? (
        <>
          <DataTable
            data={people}
            columns={columns}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            // ... other props
          />
          <EndOfListMessage show={!hasMore && people.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <ContentCard>Empty state</ContentCard>
      )}

      {stats.total > 0 && <ListStatsBar stats={statsList} />}
    </div>
  )
}
```

**Key Points:**
- Add `initialHasMore` prop to component interface
- Initialize state with `initialData` and `initialHasMore`
- Start offset at `LIST_VIEW_PAGE_SIZE` (skip first 25)
- Use `INFINITE_SCROLL_LOAD_MORE_SIZE` in `handleLoadMore` (load 50)
- Reset state when filters change via `useEffect`
- Use state `people` (not `initialData`) in DataTable
- Render `EndOfListMessage` after DataTable

---

## Server Page Pattern

**CRITICAL:** Server pages must always fetch only the first page of results.

```typescript
const filters = {
  search: params.search,
  sort: params.sort,
  offset: 0,  // ✅ ALWAYS 0 on server
  limit: LIST_VIEW_PAGE_SIZE  // ✅ Use constant
}

const items = await getItems(filters)
const initialHasMore = items.length === LIST_VIEW_PAGE_SIZE

return <ListClient initialData={items} initialHasMore={initialHasMore} />
```

**Why?**
- Fast initial page load
- Server renders first 25 items only
- Client handles subsequent loads

---

## List Client Pattern

### State Management

```typescript
const [items, setItems] = useState(initialData)
const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)  // Start after first page
const [hasMore, setHasMore] = useState(initialHasMore)
const [isLoadingMore, setIsLoadingMore] = useState(false)
```

### Reset on Filter Changes

**CRITICAL:** Reset state when filters change to show fresh results from server.

```typescript
useEffect(() => {
  setItems(initialData)
  setOffset(LIST_VIEW_PAGE_SIZE)
  setHasMore(initialHasMore)
}, [initialData, initialHasMore])
```

**Why?**
- When user changes search/sort, server page re-fetches first 25 items
- Client state must reset to match server data
- Dependencies: `initialData` and `initialHasMore` trigger reset

### Load More Function

```typescript
import { useCallback } from 'react'

// 🔴 CRITICAL: Use useCallback to prevent function recreation
const handleLoadMore = useCallback(async () => {
  if (isLoadingMore || !hasMore) return  // Prevent duplicate requests

  setIsLoadingMore(true)
  try {
    const nextItems = await getItems({
      search: filters.getFilterValue('search'),
      sort: filters.getFilterValue('sort'),
      offset: offset,  // Current offset
      limit: INFINITE_SCROLL_LOAD_MORE_SIZE  // Load 50 items
    })

    // 🔴 CRITICAL: Filter duplicates to prevent React key errors
    setItems(prev => {
      const existingIds = new Set(prev.map(item => item.id))
      const newItems = nextItems.filter(item => !existingIds.has(item.id))
      return [...prev, ...newItems]  // Append only new items
    })

    setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)  // Increment offset
    setHasMore(nextItems.length === INFINITE_SCROLL_LOAD_MORE_SIZE)  // Check if more exist
  } catch (error) {
    console.error('Failed to load more:', error)
    toast.error('Failed to load more items')
  } finally {
    setIsLoadingMore(false)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isLoadingMore, hasMore, offset])
```

**Key Points:**
- **Wrap in `useCallback`** - Prevents function recreation, stable reference for IntersectionObserver
- **Filter duplicates** - Create Set of existing IDs, only append truly new items
- Check `isLoadingMore` and `hasMore` before fetching
- Use `INFINITE_SCROLL_LOAD_MORE_SIZE` for `limit`
- Increment offset by `INFINITE_SCROLL_LOAD_MORE_SIZE`
- Update `hasMore` based on returned item count
- Always set `isLoadingMore` to false in finally block
- Include proper dependencies: `[isLoadingMore, hasMore, offset]`

---

## EndOfListMessage Component

### Usage

```typescript
<DataTable
  data={items}
  columns={columns}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
  // ... other props
/>
<EndOfListMessage show={!hasMore && items.length > 0} />
<ScrollToTopButton />
```

### Rendering Logic

```typescript
show={!hasMore && items.length > 0}
```

**Breakdown:**
- `!hasMore` - No more items to load
- `items.length > 0` - There are items in the list (not empty state)

**When it shows:**
- ✅ User has scrolled through all items
- ✅ List has at least 1 item

**When it doesn't show:**
- ❌ More items are available (`hasMore = true`)
- ❌ List is empty (`items.length === 0`)

### Component Code

```typescript
interface EndOfListMessageProps {
  show: boolean
  className?: string
}

export function EndOfListMessage({ show, className = "" }: EndOfListMessageProps) {
  if (!show) return null

  return (
    <div
      className={`py-1 text-center text-sm text-muted-foreground ${className}`}
      role="status"
      aria-live="polite"
    >
      You've reached the end of the list
    </div>
  )
}
```

**Styling:**
- Minimal padding (`py-1`)
- Centered text
- Muted color (`text-muted-foreground`)

**Accessibility:**
- `role="status"` - Identifies as a status message
- `aria-live="polite"` - Screen readers announce when message appears

---

## Testing

### Manual Testing Checklist

For each module with infinite scroll:

- [ ] **Initial load shows first 25 items**
- [ ] **Scroll to bottom triggers load of next 50 items**
- [ ] **Loading indicator appears during fetch**
- [ ] **New items append to list correctly**
- [ ] **Scroll position maintained after load**
- [ ] **End of list message appears when no more items**
- [ ] **Search input resets to first page**
- [ ] **Sort changes reset to first page**
- [ ] **Filter changes reset to first page**
- [ ] **Empty state shows when no results**
- [ ] **ScrollToTopButton works correctly**
- [ ] **Browser back button works correctly**

### Testing Scenarios

#### 1. Basic Scroll

1. Navigate to `/people`
2. Verify exactly 25 people load initially
3. Scroll to bottom
4. Verify 50 more people load (total now 75)
5. Scroll to bottom again
6. Verify 50 more people load (total now 125)
7. Continue until end
8. Verify "You've reached the end of the list" message appears

#### 2. Filter Changes

1. Load list (25 items)
2. Scroll down to load 50 more (total 75 items)
3. Change search filter
4. Verify list resets to first 25 matching items
5. Verify offset resets (next scroll loads items 26-75)

#### 3. Empty State

1. Apply filter that returns 0 results
2. Verify empty state shows (not "end of list" message)
3. Clear filter
4. Verify list reloads

#### 4. Exact Multiple

1. Create exactly 25 items in database
2. Load list
3. Verify `hasMore = false` (25 items returned = LIST_VIEW_PAGE_SIZE)
4. Verify "end of list" message shows immediately

---

## Current Implementation Status

### ✅ Implemented

**Modules:**
- People (`/people`)

**Components:**
- `useInfiniteScroll` hook
- DataTable infinite scroll integration
- EndOfListMessage component

**Constants:**
- `LIST_VIEW_PAGE_SIZE = 25`
- `INFINITE_SCROLL_LOAD_MORE_SIZE = 50`
- `INFINITE_SCROLL_THRESHOLD = 100`

### ⏳ Pending Implementation

**Main Modules (14 remaining):**
- Weddings (`/weddings`)
- Funerals (`/funerals`)
- Baptisms (`/baptisms`)
- Group Baptisms (`/group-baptisms`)
- Presentations (`/presentations`)
- Quinceañeras (`/quinceaneras`)
- Masses (`/mass-liturgies`)
- Mass Intentions (`/mass-intentions`)
- Events (`/events`)
- Locations (`/locations`)
- Readings (`/readings`)
- Groups (`/groups`)
- Group Members (`/group-members`)
- Mass Role Members (`/mass-role-members`)

**Picker Components (7 remaining):**
- PeoplePicker
- EventPicker
- LocationPicker
- MassPicker
- LiturgicalCalendarEventPicker
- ReadingPickerModal
- RolePicker

**Template Modules (excluded):**
- Mass Times Templates - Small dataset, no pagination needed
- Mass Types - Very small dataset, no pagination needed
- Mass Role Templates - Small dataset, no pagination needed
- Mass Roles - Small dataset, no pagination needed

---

## Common Issues & Solutions

### Issue: All items load at once

**Cause:** Server page using wrong constant

**Solution:**
```typescript
// ❌ WRONG
const filters = {
  offset: 0,
  limit: 50  // Hardcoded
}

// ✅ CORRECT
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

const filters = {
  offset: 0,
  limit: LIST_VIEW_PAGE_SIZE  // Use constant
}
```

### Issue: Filter changes don't reset scroll

**Cause:** Missing dependencies in useEffect

**Solution:**
```typescript
// ❌ WRONG - Missing initialHasMore dependency
useEffect(() => {
  setItems(initialData)
  setOffset(LIST_VIEW_PAGE_SIZE)
  setHasMore(initialHasMore)
}, [initialData])  // Missing initialHasMore

// ✅ CORRECT
useEffect(() => {
  setItems(initialData)
  setOffset(LIST_VIEW_PAGE_SIZE)
  setHasMore(initialHasMore)
}, [initialData, initialHasMore])  // All dependencies
```

### Issue: End of list message not showing

**Cause:** Wrong condition in `show` prop

**Solution:**
```typescript
// ❌ WRONG - Missing items.length check
<EndOfListMessage show={!hasMore} />

// ✅ CORRECT
<EndOfListMessage show={!hasMore && items.length > 0} />
```

### Issue: Offset starts at 0 instead of 25

**Cause:** Wrong initial offset state

**Solution:**
```typescript
// ❌ WRONG
const [offset, setOffset] = useState(0)

// ✅ CORRECT
const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
```

### Issue: Duplicate key errors when loading more

**Error:** `Encountered two children with the same key, [id]. Keys should be unique...`

**Cause:** Multiple rapid `handleLoadMore` calls can add duplicate items before `isLoadingMore` state updates, especially when combined with client-side filtering.

**Solution:** Use `useCallback` and filter duplicates when appending new items:

```typescript
import { useCallback } from 'react'

// ❌ WRONG - Not using useCallback, allows duplicates
const handleLoadMore = async () => {
  if (isLoadingMore || !hasMore) return

  setIsLoadingMore(true)
  try {
    const nextItems = await getItems({...})
    setItems(prev => [...prev, ...nextItems])  // Can add duplicates!
    setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
    setHasMore(nextItems.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
  } finally {
    setIsLoadingMore(false)
  }
}

// ✅ CORRECT - Using useCallback and filtering duplicates
const handleLoadMore = useCallback(async () => {
  if (isLoadingMore || !hasMore) return

  setIsLoadingMore(true)
  try {
    const nextItems = await getItems({
      search: filters.getFilterValue('search'),
      language: filters.getFilterValue('language'),
      sort: filters.getFilterValue('sort'),
      offset: offset,
      limit: INFINITE_SCROLL_LOAD_MORE_SIZE
    })

    // Prevent duplicates by checking existing IDs
    setItems(prev => {
      const existingIds = new Set(prev.map(item => item.id))
      const newItems = nextItems.filter(item => !existingIds.has(item.id))
      return [...prev, ...newItems]
    })

    setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
    setHasMore(nextItems.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
  } catch (error) {
    console.error('Failed to load more:', error)
    toast.error('Failed to load more items')
  } finally {
    setIsLoadingMore(false)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isLoadingMore, hasMore, offset])
```

**Why this works:**
1. **`useCallback` prevents function recreation** - Ensures IntersectionObserver has stable reference
2. **Duplicate filtering** - Creates Set of existing IDs, only appends truly new items
3. **Race condition protection** - Even if multiple calls happen, duplicates are filtered out

**When to use this pattern:**
- ✅ Always when implementing infinite scroll
- ✅ Especially when combining with client-side filtering
- ✅ Required when same IDs could be returned from multiple API calls

**Reference Implementation:** Readings module (`src/app/(main)/readings/readings-list-client.tsx`)

---

## Performance Considerations

### Database Queries

**Efficient Range Queries:**
```typescript
.range(offset, offset + limit - 1)
```

This uses PostgreSQL's `LIMIT` and `OFFSET` under the hood:
```sql
SELECT * FROM people
WHERE parish_id = '...'
ORDER BY full_name ASC
LIMIT 50 OFFSET 25;
```

**Indexes Required:**
- `parish_id` (RLS filtering)
- Sort column (e.g., `full_name`, `created_at`)
- Composite index: `(parish_id, sort_column)` for optimal performance

### Memory Usage

**Accumulated Items:**
- Initial load: 25 items
- After 1 scroll: 75 items (25 + 50)
- After 2 scrolls: 125 items (75 + 50)
- After 10 scrolls: 525 items

**Considerations:**
- For typical parish sizes (< 1000 people), memory usage is acceptable
- Browser handles DOM efficiently for lists under 1000 items
- If needed, virtualization can be added later (react-window, react-virtual)

### Network Requests

**Request Pattern:**
- Initial page load: 1 request (server-side, 25 items)
- Each scroll: 1 request (client-side, 50 items)
- For 500 items: 1 server + 10 client requests

**Optimization:**
- Larger subsequent loads (50 vs 25) reduce total requests
- Threshold (100px) prevents rapid repeated requests
- Loading state prevents duplicate requests

---

## Accessibility

### Screen Reader Support

**DataTable Loading State:**
```typescript
{isLoading && (
  <div
    role="status"
    aria-live="polite"
    className="flex items-center gap-2"
  >
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>Loading more...</span>
  </div>
)}
```

**EndOfListMessage:**
```typescript
<div
  role="status"
  aria-live="polite"
  className="py-1 text-center text-sm text-muted-foreground"
>
  You've reached the end of the list
</div>
```

### Keyboard Navigation

- Tab order remains logical as new items load
- Focus is not disrupted during scroll
- ScrollToTopButton accessible via keyboard

---

## Related Documentation

- [LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md) - Complete list view patterns
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - DataTable and EndOfListMessage documentation
- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - Module file structure
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Data flow and performance patterns

---

## Questions?

For implementation help or questions about infinite scrolling, refer to:
1. This document first
2. People module as reference implementation (`/src/app/(main)/people/`)
3. Requirements document (`/requirements/2025-12-02-infinite-scrolling.md`)
