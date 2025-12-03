# Infinite Scrolling Requirements

**Date:** 2025-12-02
**Status:** Requirements Analysis Complete
**Author:** requirements-agent
**Type:** Infrastructure Change - Replace Pagination with Infinite Scrolling

---

## Vision Summary

Replace traditional pagination (Previous/Next buttons) with infinite scrolling across all list views and picker components in the Outward Sign application. This change will provide a more modern, mobile-friendly user experience that aligns with contemporary web application patterns.

**Current State:**
- Most modules load all records without pagination
- Masses module uses traditional pagination with Previous/Next buttons
- Infinite scroll infrastructure exists (`useInfiniteScroll` hook, DataTable integration) but is unused
- CorePicker component has pagination support that is rarely used

**Desired State:**
- All list views use infinite scrolling to load more results automatically
- All picker dialogs use infinite scrolling for entity selection
- Remove traditional pagination controls throughout the application
- Provide loading indicators and "end of list" messaging

---

## Scope

### In Scope

1. **List Views for Main Modules** (11 modules):
   - Weddings (`/weddings`)
   - Funerals (`/funerals`)
   - Baptisms (`/baptisms`)
   - Group Baptisms (`/group-baptisms`)
   - Presentations (`/presentations`)
   - Quinceañeras (`/quinceaneras`)
   - Masses (`/masses`)
   - Mass Intentions (`/mass-intentions`)
   - Events (`/events`)
   - Locations (`/locations`)
   - Readings (`/readings`)

2. **List Views for Supporting Modules** (4 modules):
   - People (`/people`)
   - Groups (`/groups`)
   - Group Members (`/group-members`)
   - Mass Role Members (`/mass-role-members`)

3. **Template Modules** (4 modules - SPECIAL HANDLING):
   - Mass Times Templates (`/mass-times-templates`)
   - Mass Types (`/mass-types`)
   - Mass Role Templates (`/mass-role-templates`)
   - Mass Roles (`/mass-roles`)
   - **Note:** These may not need infinite scrolling due to small dataset sizes (typically < 20 records)

4. **Picker Components** (7 pickers):
   - PeoplePicker (CorePicker-based)
   - EventPicker (CorePicker-based)
   - LocationPicker (CorePicker-based)
   - MassPicker (CorePicker-based)
   - GlobalLiturgicalEventPicker (CorePicker-based)
   - ReadingPickerModal (standalone)
   - RolePicker (CorePicker-based)

5. **Documentation Updates**:
   - Remove PAGINATION.md
   - Create INFINITE_SCROLLING.md
   - Update LIST_VIEW_PATTERN.md
   - Update PICKERS.md (navigation hub)
   - Update COMPONENT_REGISTRY.md
   - Update MODULE_COMPONENT_PATTERNS.md references
   - Update ARCHITECTURE.md references

### Out of Scope

- Settings pages (event types, parish settings, user settings)
- Report pages (mass intentions report, weekend summary)
- Calendar views
- Dashboard
- Special purpose pages (testing, documentation, onboarding)
- Print views
- Virtualization for extremely large datasets (future enhancement)

---

## Technical Analysis

### Current Implementation Overview

**Infrastructure Already Exists:**
```typescript
// Hook: src/hooks/use-infinite-scroll.ts
export function useInfiniteScroll({
  onLoadMore: () => void | Promise<void>,
  hasMore: boolean,
  threshold?: number  // Distance from bottom (default 100px)
})

// DataTable Integration: src/components/data-table/data-table.tsx
<DataTable
  data={items}
  columns={columns}
  onLoadMore={handleLoadMore}  // ✅ Already supported
  hasMore={hasMore}             // ✅ Already supported
  // ... other props
/>

// CorePicker Pagination: src/components/core-picker.tsx
<CorePicker
  items={items}
  enablePagination={true}      // Currently unused
  totalCount={totalCount}
  currentPage={page}
  pageSize={pageSize}
  onPageChange={setPage}
  // ... other props
/>
```

**Current Constants:**
```typescript
// src/lib/constants.ts
export const LIST_VIEW_PAGE_SIZE = 50  // Current page size
export const SCROLL_TO_TOP_THRESHOLD = 300
```

### Server Action Pattern Analysis

**Current Pattern (Pagination-Based):**
```typescript
// Example: src/lib/actions/weddings.ts
export interface WeddingFilterParams {
  search?: string
  status?: ModuleStatus | 'all'
  sort?: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  page?: number      // ⬅ Used for pagination
  limit?: number     // ⬅ Used for pagination
  start_date?: string
  end_date?: string
}

export async function getWeddings(filters?: WeddingFilterParams): Promise<WeddingWithNames[]> {
  const page = filters?.page || 1
  const limit = filters?.limit || LIST_VIEW_PAGE_SIZE
  const offset = (page - 1) * limit

  let query = supabase
    .from('weddings')
    .select('...')
    .range(offset, offset + limit - 1)  // ⬅ Database-level pagination

  // ... filters and sorting
  const { data, error } = await query
  return data || []
}
```

**Required Pattern (Infinite Scroll):**
```typescript
export interface WeddingFilterParams {
  search?: string
  status?: ModuleStatus | 'all'
  sort?: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  offset?: number    // ⬅ How many records to skip
  limit?: number     // ⬅ How many records to fetch
  start_date?: string
  end_date?: string
}

export async function getWeddings(filters?: WeddingFilterParams): Promise<WeddingWithNames[]> {
  const offset = filters?.offset || 0
  const limit = filters?.limit || LIST_VIEW_PAGE_SIZE

  let query = supabase
    .from('weddings')
    .select('...')
    .range(offset, offset + limit - 1)  // ⬅ Same range query, different calculation

  // ... filters and sorting
  const { data, error } = await query
  return data || []
}
```

**Key Changes:**
- Replace `page` param with `offset` param
- Remove `page` calculation: `(page - 1) * limit`
- Client tracks offset directly instead of page number
- Server still uses `.range(offset, offset + limit - 1)` for database queries

### List Client Pattern Analysis

**Current Pattern (Server Page):**
```typescript
// src/app/(main)/weddings/page.tsx
export default async function WeddingsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const filters: WeddingFilterParams = {
    search: params.search,
    status: (params.status as WeddingFilterParams['status']) || 'ACTIVE',
    sort: (params.sort as WeddingFilterParams['sort']) || 'date_asc',
    page: params.page ? parseInt(params.page, 10) : 1,  // ⬅ Remove
    limit: LIST_VIEW_PAGE_SIZE,
    start_date: params.start_date,
    end_date: params.end_date
  }

  const weddings = await getWeddings(filters)
  const stats = await getWeddingStats(weddings)

  return (
    <PageContainer>
      <WeddingsListClient initialData={weddings} stats={stats} />
    </PageContainer>
  )
}
```

**Required Pattern (Server Page):**
```typescript
// Server page should only fetch INITIAL page (offset: 0)
export default async function WeddingsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const filters: WeddingFilterParams = {
    search: params.search,
    status: (params.status as WeddingFilterParams['status']) || 'ACTIVE',
    sort: (params.sort as WeddingFilterParams['sort']) || 'date_asc',
    offset: 0,  // ⬅ Always fetch first page on server
    limit: LIST_VIEW_PAGE_SIZE,
    start_date: params.start_date,
    end_date: params.end_date
  }

  const weddings = await getWeddings(filters)
  const stats = await getWeddingStats(weddings)

  // Determine if there are more results
  const hasMore = weddings.length === LIST_VIEW_PAGE_SIZE

  return (
    <PageContainer>
      <WeddingsListClient
        initialData={weddings}
        stats={stats}
        initialHasMore={hasMore}  // ⬅ New prop
      />
    </PageContainer>
  )
}
```

**Current Pattern (List Client):**
```typescript
// src/app/(main)/weddings/weddings-list-client.tsx
export function WeddingsListClient({ initialData, stats }: Props) {
  const filters = useListFilters({
    baseUrl: '/weddings',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Current implementation shows DataTable directly
  return (
    <div className="space-y-6">
      <SearchCard>...</SearchCard>

      {initialData.length > 0 ? (
        <>
          <DataTable
            data={initialData}
            columns={columns}
            onRowClick={(wedding) => router.push(`/weddings/${wedding.id}`)}
            stickyHeader
          />
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

**Required Pattern (List Client):**
```typescript
export function WeddingsListClient({ initialData, stats, initialHasMore }: Props) {
  const router = useRouter()
  const [weddings, setWeddings] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)  // Start after initial page
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const filters = useListFilters({
    baseUrl: '/weddings',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Reset to initial data when filters change
  useEffect(() => {
    setWeddings(initialData)
    setOffset(LIST_VIEW_PAGE_SIZE)
    setHasMore(initialHasMore)
  }, [filters.getFilterValue('status'), filters.getFilterValue('sort'), /* other filters */])

  // Load more function for infinite scroll
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const nextWeddings = await getWeddings({
        search: filters.getFilterValue('search'),
        status: filters.getFilterValue('status') as WeddingFilterParams['status'],
        sort: filters.getFilterValue('sort') as WeddingFilterParams['sort'],
        offset: offset,
        limit: LIST_VIEW_PAGE_SIZE,
        start_date: filters.getFilterValue('start_date'),
        end_date: filters.getFilterValue('end_date')
      })

      setWeddings(prev => [...prev, ...nextWeddings])
      setOffset(prev => prev + LIST_VIEW_PAGE_SIZE)
      setHasMore(nextWeddings.length === LIST_VIEW_PAGE_SIZE)
    } catch (error) {
      console.error('Failed to load more weddings:', error)
      toast.error('Failed to load more weddings')
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="space-y-6">
      <SearchCard>...</SearchCard>

      {weddings.length > 0 ? (
        <>
          <DataTable
            data={weddings}
            columns={columns}
            onRowClick={(wedding) => router.push(`/weddings/${wedding.id}`)}
            onLoadMore={handleLoadMore}  // ⬅ Pass infinite scroll handler
            hasMore={hasMore}            // ⬅ Pass hasMore flag
            stickyHeader
          />
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

### Picker Pattern Analysis

**CorePicker Already Has Infrastructure:**
```typescript
// src/components/core-picker.tsx already supports pagination props:
enablePagination?: boolean
totalCount?: number
currentPage?: number
pageSize?: number
onPageChange?: (page: number) => void
onSearch?: (query: string) => void
```

**Required Changes for Infinite Scroll:**

1. Add new props to CorePicker:
```typescript
// Add to CorePickerProps
enableInfiniteScroll?: boolean  // Alternative to enablePagination
onLoadMore?: () => void | Promise<void>
hasMore?: boolean
```

2. Update CorePicker implementation to use `useInfiniteScroll` hook
3. Replace pagination controls with sentinel element at bottom of list
4. Show loading indicator when fetching more items

**Picker Wrapper Pattern:**
```typescript
// Example: src/components/people-picker.tsx
export function PeoplePicker({ open, onOpenChange, selectedPerson, onSelect }: Props) {
  const [people, setPeople] = useState<Person[]>([])
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Load initial data when picker opens
  useEffect(() => {
    if (open) {
      loadPeople(0, search)
    }
  }, [open, search])

  const loadPeople = async (currentOffset: number, searchQuery: string) => {
    setIsLoading(true)
    try {
      const newPeople = await getPeople({
        search: searchQuery,
        offset: currentOffset,
        limit: 50
      })

      if (currentOffset === 0) {
        setPeople(newPeople)
      } else {
        setPeople(prev => [...prev, ...newPeople])
      }

      setOffset(currentOffset + 50)
      setHasMore(newPeople.length === 50)
    } catch (error) {
      toast.error('Failed to load people')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadMore = async () => {
    await loadPeople(offset, search)
  }

  return (
    <CorePicker
      open={open}
      onOpenChange={onOpenChange}
      items={people}
      selectedItem={selectedPerson}
      onSelect={onSelect}
      enableInfiniteScroll={true}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
      // ... other props
    />
  )
}
```

---

## UI/UX Considerations

### Loading States

**During Initial Load:**
- Server page shows loading.tsx
- DataTable shows skeleton rows (existing pattern)

**During "Load More" (Infinite Scroll):**
```
┌─────────────────────────────────────┐
│ Item 1                              │
│ Item 2                              │
│ ...                                  │
│ Item 50                             │
├─────────────────────────────────────┤
│ [Sentinel Element - triggers load]  │
├─────────────────────────────────────┤
│ 🔄 Loading more...                  │  ⬅ Shown while fetching
└─────────────────────────────────────┘
```

**End of List:**
```
┌─────────────────────────────────────┐
│ Item 1                              │
│ Item 2                              │
│ ...                                  │
│ Last Item                            │
├─────────────────────────────────────┤
│ ✓ You've reached the end of the list│  ⬅ Clear messaging
└─────────────────────────────────────┘
```

### Empty States

**No Results (Zero Items Initially):**
- Use ContentCard with "No [entities] found" message
- Show "Create Your First [Entity]" button
- Show "Clear Filters" button if filters are active

**No Results After Filtering (Had Items, Now Zero):**
- DataTable's built-in emptyState shows
- "No results found. Try adjusting your search or filters."
- Show "Clear Filters" button

**These patterns already exist and should remain unchanged.**

### Accessibility Requirements

**Keyboard Navigation:**
- Infinite scroll should not interfere with keyboard navigation
- Tab order should remain logical
- Focus management when new items load

**Screen Reader Support:**
- Announce when new items are loading: `aria-live="polite"`
- Announce when end of list is reached
- Provide "Load more" button as fallback for screen reader users

**Implementation:**
```typescript
{isLoadingMore && (
  <div
    role="status"
    aria-live="polite"
    className="flex items-center justify-center py-8"
  >
    <Loader2 className="h-6 w-6 animate-spin" />
    <span className="ml-2">Loading more {entityName}...</span>
  </div>
)}

{!hasMore && data.length > 0 && (
  <div
    role="status"
    aria-live="polite"
    className="text-center py-8 text-sm text-muted-foreground"
  >
    You've reached the end of the list
  </div>
)}
```

### Mobile Considerations

**Touch Scrolling:**
- IntersectionObserver works seamlessly on mobile
- No need for pull-to-refresh (initial load handles this)
- Smooth scroll performance is critical

**Network Conditions:**
- Show clear loading indicators for slow connections
- Handle failed requests gracefully with retry option
- Consider reducing page size on mobile (future optimization)

**Threshold Distance:**
- Current default: 100px from bottom
- This works well on mobile (triggers before user reaches absolute bottom)
- May need adjustment based on user testing

---

## Database & Performance Implications

### Database Query Impact

**Current State:**
- Most modules: Single query fetching ALL records (bad)
- Masses module: Paginated queries with `.range(offset, offset + limit - 1)` (good)

**After Infinite Scroll:**
- All modules: Paginated queries using `.range()`
- Initial page: Fetch 50 records
- Each scroll: Fetch next 50 records
- Database impact: BETTER (smaller query results, less data transferred)

**Query Pattern:**
```sql
-- Same query pattern for both pagination and infinite scroll
SELECT * FROM weddings
  WHERE parish_id = '...'
  AND status = 'ACTIVE'
  ORDER BY created_at DESC
  LIMIT 50 OFFSET 0;  -- First page

-- Next scroll
LIMIT 50 OFFSET 50;   -- Second batch
LIMIT 50 OFFSET 100;  -- Third batch
```

**Performance Benefit:**
- Reduces initial page load time
- Reduces memory usage in browser
- Reduces network bandwidth

### RLS Policy Impact

**No Changes Required:**
- RLS policies already filter at database level
- Row-Level Security works the same with `.range()` queries
- Parish-scoped queries remain unchanged

### Index Considerations

**Current Indexes:**
- Most modules have indexes on: `parish_id`, `created_at`, `status`
- These indexes support efficient range queries
- No additional indexes needed for infinite scroll

**Recommendation:**
- Monitor query performance after implementation
- Add composite indexes if needed: `(parish_id, status, created_at)`

---

## Implementation Plan

### Phase 1: Core Infrastructure Updates

**1. Update Constants**
```typescript
// src/lib/constants.ts
export const LIST_VIEW_PAGE_SIZE = 50  // Keep existing
export const INFINITE_SCROLL_THRESHOLD = 100  // Add new constant
```

**2. Update DataTable Component**
```typescript
// src/components/data-table/data-table.tsx
// Already supports onLoadMore and hasMore props
// Verify implementation and loading states
// Ensure sentinel element is properly styled
```

**3. Update useInfiniteScroll Hook (if needed)**
```typescript
// src/hooks/use-infinite-scroll.ts
// Current implementation looks complete
// May need to add error handling improvements
```

### Phase 2: Server Actions Updates

**For Each Module's Server Action:**

1. Update filter params interface:
   - Change `page?: number` to `offset?: number`
   - Keep `limit?: number`

2. Update query calculation:
   ```typescript
   // OLD
   const page = filters?.page || 1
   const offset = (page - 1) * limit

   // NEW
   const offset = filters?.offset || 0
   ```

3. Keep everything else the same (range query, filters, sorting)

**Modules to Update (15 total):**
- weddings.ts
- funerals.ts
- baptisms.ts
- group-baptisms.ts
- presentations.ts
- quinceaneras.ts
- masses.ts
- mass-intentions.ts
- events.ts
- locations.ts
- readings.ts
- people.ts
- groups.ts
- group-members.ts (if has list view)
- mass-role-members.ts (if has list view)

**Template Modules (4 - EVALUATE INDIVIDUALLY):**
- mass-times-templates.ts (small dataset, may not need changes)
- mass-types.ts (very small dataset, likely no changes)
- mass-role-templates.ts (small dataset, may not need changes)
- mass-roles.ts (small dataset, may not need changes)

### Phase 3: Server Pages Updates

**For Each Module's Server Page (`page.tsx`):**

1. Remove page parameter from searchParams
2. Always fetch with `offset: 0` for initial load
3. Add `initialHasMore` calculation
4. Pass `initialHasMore` to list client

**Changes:**
```typescript
// BEFORE
const filters: WeddingFilterParams = {
  page: params.page ? parseInt(params.page, 10) : 1,
  limit: LIST_VIEW_PAGE_SIZE,
  // ... other filters
}
const weddings = await getWeddings(filters)

return <WeddingsListClient initialData={weddings} stats={stats} />

// AFTER
const filters: WeddingFilterParams = {
  offset: 0,  // Always start at 0 for server
  limit: LIST_VIEW_PAGE_SIZE,
  // ... other filters
}
const weddings = await getWeddings(filters)
const initialHasMore = weddings.length === LIST_VIEW_PAGE_SIZE

return <WeddingsListClient initialData={weddings} stats={stats} initialHasMore={initialHasMore} />
```

### Phase 4: List Client Updates

**For Each Module's List Client (`[entities]-list-client.tsx`):**

1. Add state management:
   ```typescript
   const [entities, setEntities] = useState(initialData)
   const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
   const [hasMore, setHasMore] = useState(initialHasMore)
   const [isLoadingMore, setIsLoadingMore] = useState(false)
   ```

2. Add reset effect for filter changes:
   ```typescript
   useEffect(() => {
     setEntities(initialData)
     setOffset(LIST_VIEW_PAGE_SIZE)
     setHasMore(initialHasMore)
   }, [initialData, initialHasMore])
   ```

3. Implement `handleLoadMore` function

4. Update DataTable props:
   ```typescript
   <DataTable
     data={entities}  // Changed from initialData
     columns={columns}
     onRowClick={(entity) => router.push(`/[module]/${entity.id}`)}
     onLoadMore={handleLoadMore}  // Added
     hasMore={hasMore}             // Added
     stickyHeader
   />
   ```

5. Remove any pagination controls (if they exist)

### Phase 5: Picker Updates

**For CorePicker Component:**

1. Add infinite scroll props:
   ```typescript
   export interface CorePickerProps<T> {
     // ... existing props
     enableInfiniteScroll?: boolean
     onLoadMore?: () => void | Promise<void>
     hasMoreItems?: boolean  // Renamed from hasMore to avoid conflict
   }
   ```

2. Implement infinite scroll in picker list
3. Add loading indicator at bottom of list
4. Keep existing pagination props for backward compatibility (deprecated)

**For Each Picker Wrapper:**

1. Add state for infinite scroll:
   ```typescript
   const [items, setItems] = useState<T[]>([])
   const [offset, setOffset] = useState(0)
   const [hasMore, setHasMore] = useState(true)
   ```

2. Update data fetching to use offset
3. Implement load more function
4. Pass infinite scroll props to CorePicker

**Pickers to Update:**
- PeoplePicker
- EventPicker
- LocationPicker
- MassPicker
- GlobalLiturgicalEventPicker
- ReadingPickerModal (special case - standalone component)
- RolePicker

### Phase 6: Documentation Updates

**1. Remove PAGINATION.md**
- Archive content for historical reference
- Remove file from docs/ directory

**2. Create INFINITE_SCROLLING.md**
- Document infinite scroll pattern
- Include code examples
- Document `useInfiniteScroll` hook
- Document DataTable integration
- Document CorePicker integration
- Include accessibility requirements
- Include testing guidelines

**3. Update LIST_VIEW_PATTERN.md**
- Remove pagination sections
- Add infinite scroll implementation details
- Update server page pattern
- Update list client pattern
- Update code examples
- Update checklist

**4. Update PICKERS.md**
- Update navigation hub with infinite scroll references
- Link to picker infinite scroll documentation

**5. Update COMPONENT_REGISTRY.md**
- Document DataTable infinite scroll props
- Document CorePicker infinite scroll props
- Update hook documentation for `useInfiniteScroll`

**6. Update MODULE_COMPONENT_PATTERNS.md**
- Update list page pattern
- Update list client pattern
- Remove pagination references

**7. Update ARCHITECTURE.md**
- Update data flow section
- Update performance section

**8. Update CLAUDE.md References**
- Update any pagination references
- Ensure constants are documented

### Phase 7: Testing

**Manual Testing Checklist (Per Module):**

- [ ] Initial page load shows first 50 items
- [ ] Scroll to bottom triggers load more
- [ ] Loading indicator appears during fetch
- [ ] New items append to list correctly
- [ ] Scroll position maintained after load
- [ ] End of list message appears when no more items
- [ ] Filter changes reset to first page
- [ ] Search input resets to first page
- [ ] Status filter resets to first page
- [ ] Date range filter resets to first page
- [ ] Sort changes reset to first page
- [ ] Empty state shows when no results
- [ ] Clear filters button works correctly
- [ ] Stats bar reflects correct totals
- [ ] Delete operation refreshes correctly
- [ ] Browser back button works correctly
- [ ] Keyboard navigation works
- [ ] Screen reader announces loading states

**Picker Testing Checklist:**

- [ ] Picker opens and loads first batch
- [ ] Scroll in picker triggers load more
- [ ] Search in picker resets to first page
- [ ] Selecting item closes picker correctly
- [ ] Creating new item works correctly
- [ ] Loading indicators show in picker
- [ ] End of list message shows in picker

**Performance Testing:**

- [ ] Initial page load time < 2 seconds
- [ ] Load more response time < 1 second
- [ ] No janky scrolling during load
- [ ] Memory usage stays reasonable after many scrolls
- [ ] Network requests are properly batched

**Automated Testing:**

- Update existing tests for list pages
- Add tests for infinite scroll behavior
- Test filter changes reset scroll state
- Test error handling during load more

---

## Migration Strategy

### Recommended Approach: Incremental Module-by-Module

**Why Incremental:**
- Easier to test and verify each module
- Reduces risk of breaking multiple modules
- Allows for adjustments based on early feedback
- Can roll back individual modules if issues arise

**Why Not All-at-Once:**
- High risk of introducing bugs across entire application
- Difficult to isolate issues
- Hard to roll back if problems occur
- Would require extensive testing of all modules simultaneously

### Recommended Order

**Phase 1: Proof of Concept (1 module)**
1. **Weddings** - Well-established reference implementation, good test case

**Phase 2: Main Sacrament Modules (5 modules)**
2. Funerals
3. Baptisms
4. Presentations
5. Quinceañeras
6. Group Baptisms

**Phase 3: Calendar & Supporting Modules (3 modules)**
7. Events
8. Masses (replace existing pagination)
9. Mass Intentions

**Phase 4: Entity Modules (3 modules)**
10. People
11. Locations
12. Readings

**Phase 5: Group Modules (3 modules)**
13. Groups
14. Group Members
15. Mass Role Members

**Phase 6: Template Modules (4 modules - EVALUATE)**
16. Mass Times Templates
17. Mass Role Templates
18. Mass Types (may skip - very small dataset)
19. Mass Roles (may skip - very small dataset)

**Phase 7: Pickers (7 pickers)**
20. PeoplePicker
21. EventPicker
22. LocationPicker
23. MassPicker
24. GlobalLiturgicalEventPicker
25. ReadingPickerModal
26. RolePicker

### Transition Period Considerations

**Can modules have different pagination strategies during transition?**
- ✅ YES - Each module is independent
- ✅ No shared components require all modules to match
- ✅ Users may see different UX per module temporarily (acceptable)

**Should we support both patterns?**
- ❌ NO - Adds unnecessary complexity
- ❌ Would require maintaining two patterns in DataTable
- ✅ Better to commit to one pattern and migrate fully

**Rollback Strategy:**
- Git commits should be module-specific for easy revert
- Keep pagination code in git history for reference
- Document any issues encountered per module

---

## File Change Summary

### Files to Create (1)
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/INFINITE_SCROLLING.md`

### Files to Delete (1)
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/PAGINATION.md`

### Files to Modify by Category

**Server Actions (15 files):**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/weddings.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/funerals.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/baptisms.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/group-baptisms.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/presentations.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/quinceaneras.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/masses.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/mass-intentions.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/events.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/locations.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/readings.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/people.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/groups.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/group-members.ts` (if exists)
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/mass-role-members.ts`

**Server Pages (15 files):**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/weddings/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/funerals/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/baptisms/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/group-baptisms/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/presentations/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/quinceaneras/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/masses/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/mass-intentions/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/events/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/locations/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/readings/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/people/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/groups/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/group-members/page.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/mass-role-members/page.tsx`

**List Clients (15 files):**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/weddings/weddings-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/funerals/funerals-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/baptisms/baptisms-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/group-baptisms/group-baptisms-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/presentations/presentations-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/quinceaneras/quinceaneras-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/masses/masses-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/mass-intentions/mass-intentions-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/events/events-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/locations/locations-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/readings/readings-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/people/people-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/groups/groups-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/group-members/group-members-list-client.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/mass-role-members/mass-role-members-list-client.tsx`

**Core Components (2 files):**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/components/core-picker.tsx` (add infinite scroll support)
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/components/data-table/data-table.tsx` (verify existing support)

**Picker Components (7 files - exact paths to be determined):**
- PeoplePicker component file
- EventPicker component file
- LocationPicker component file
- MassPicker component file
- GlobalLiturgicalEventPicker component file
- ReadingPickerModal component file
- RolePicker component file

**Documentation (8 files):**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/LIST_VIEW_PATTERN.md`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/PICKERS.md`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/COMPONENT_REGISTRY.md`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/MODULE_COMPONENT_PATTERNS.md`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/ARCHITECTURE.md`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/CLAUDE.md`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/MODULE_REGISTRY.md` (if has pagination references)
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/constants.ts` (add infinite scroll constant)

**Total Files:**
- Create: 1
- Delete: 1
- Modify: ~50 files (15 actions + 15 pages + 15 clients + ~7 pickers + 8 docs)

---

## Risks & Considerations

### Technical Risks

**1. Filter Changes May Not Reset Properly**
- **Risk:** When user changes filters, scroll state may not reset
- **Mitigation:** useEffect dependency array must include ALL filter values
- **Testing:** Verify filter changes always show first page

**2. Memory Leaks from Accumulated State**
- **Risk:** Loading many pages may consume too much browser memory
- **Mitigation:** Monitor memory usage, consider virtualization later
- **Testing:** Test scrolling through 500+ items

**3. Race Conditions During Rapid Scrolling**
- **Risk:** Multiple load-more requests may fire simultaneously
- **Mitigation:** `isLoadingMore` flag prevents duplicate requests
- **Testing:** Test rapid scrolling and slow network conditions

**4. Server Action Changes May Break Existing Code**
- **Risk:** Changing `page` to `offset` may affect other code
- **Mitigation:** Search codebase for all usages before changing
- **Testing:** Full regression testing per module

**5. Accessibility Issues**
- **Risk:** Screen readers may not announce loading states
- **Mitigation:** Proper ARIA attributes (aria-live, role="status")
- **Testing:** Test with VoiceOver and NVDA

### UX Risks

**1. Users May Lose Their Place**
- **Risk:** No way to bookmark specific page or position
- **Mitigation:** This is inherent to infinite scroll, acceptable tradeoff
- **Consider:** Add "jump to top" button (already exists: ScrollToTopButton)

**2. Footer Content Hard to Access**
- **Risk:** Users can't easily reach ListStatsBar at bottom
- **Mitigation:** Stats are always visible after list, infinite scroll doesn't prevent access
- **Note:** ListStatsBar appears AFTER the last item, not at page bottom

**3. Performance Perception on Slow Networks**
- **Risk:** Users may not realize more content is loading
- **Mitigation:** Clear loading indicators and threshold triggering early
- **Testing:** Test on throttled network

### Data Integrity Risks

**1. Stats May Be Inaccurate**
- **Risk:** Stats calculated from partial data vs. all data
- **Current:** Stats are calculated server-side from ALL data (not filtered by offset)
- **Mitigation:** No change needed, stats remain accurate

**2. Sort Changes Mid-Scroll May Duplicate Items**
- **Risk:** If sort changes while scrolling, may see duplicate items
- **Mitigation:** Filter changes reset to first page (useEffect dependency)
- **Testing:** Verify sort changes reset scroll state

### Migration Risks

**1. Forgetting to Update a Module**
- **Risk:** Some modules may be missed during migration
- **Mitigation:** Use comprehensive checklist, track progress
- **Testing:** Verify all modules after completion

**2. Inconsistent User Experience During Transition**
- **Risk:** Users see different pagination styles per module
- **Mitigation:** Acceptable temporarily, communicate in release notes
- **Timeline:** Complete migration within 2-4 weeks

**3. Rollback Difficulty**
- **Risk:** Hard to revert if issues arise
- **Mitigation:** Module-specific commits, keep git history clean
- **Strategy:** Test thoroughly before moving to next module

---

## Success Criteria

### Functional Requirements

- [ ] All 15 main/supporting modules use infinite scroll
- [ ] All 7 picker components use infinite scroll (or evaluated as not needed)
- [ ] Filter changes reset to first page correctly
- [ ] Search input resets to first page correctly
- [ ] Sort changes reset to first page correctly
- [ ] Loading indicators appear during fetch
- [ ] End of list message appears when no more items
- [ ] Empty states work correctly
- [ ] Delete operations refresh correctly
- [ ] Browser back button works correctly

### Performance Requirements

- [ ] Initial page load time < 2 seconds (90th percentile)
- [ ] Load more response time < 1 second (90th percentile)
- [ ] No janky scrolling during load
- [ ] Memory usage remains stable after 10+ scrolls

### Accessibility Requirements

- [ ] Screen reader announces loading states
- [ ] Screen reader announces end of list
- [ ] Keyboard navigation works correctly
- [ ] Focus management during load is correct
- [ ] ARIA attributes properly implemented

### Documentation Requirements

- [ ] INFINITE_SCROLLING.md created and complete
- [ ] PAGINATION.md removed
- [ ] LIST_VIEW_PATTERN.md updated
- [ ] PICKERS.md updated
- [ ] COMPONENT_REGISTRY.md updated
- [ ] MODULE_COMPONENT_PATTERNS.md updated
- [ ] All code examples show infinite scroll pattern

### Testing Requirements

- [ ] Manual testing checklist completed for all modules
- [ ] Automated tests updated for infinite scroll
- [ ] Performance testing completed
- [ ] Accessibility testing completed
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari)
- [ ] Mobile testing completed (iOS, Android)

---

## Acceptance Criteria

This feature is considered complete when:

1. **All in-scope modules** (15 list views) use infinite scroll instead of pagination
2. **All in-scope pickers** (7 pickers) use infinite scroll for entity selection
3. **All documentation** is updated to reflect infinite scroll pattern
4. **PAGINATION.md is removed** from the docs directory
5. **All success criteria** listed above are met
6. **Manual testing** has been completed for all modules
7. **No regressions** in existing functionality have been introduced
8. **User experience** is smooth and performant on both desktop and mobile

---

## Next Steps

**For developer-agent:**

1. Read this requirements document thoroughly
2. Read INFINITE_SCROLLING.md documentation (to be created)
3. Start with Phase 1: Core Infrastructure Updates
4. Proceed to Phase 2: Weddings module (proof of concept)
5. Test thoroughly before moving to next module
6. Follow incremental migration strategy

**For test-writer:**

1. Review existing list view tests
2. Plan updates for infinite scroll behavior
3. Create test plan for filter reset behavior
4. Create test plan for load more functionality

**For project-documentation-writer:**

1. Create INFINITE_SCROLLING.md with patterns and examples
2. Update all referenced documentation files
3. Ensure consistency across all docs

---

## Estimated Complexity

**Overall Complexity:** Medium-High

**Reasons:**
- Infrastructure already exists (hook, DataTable support)
- Pattern is well-understood and documented
- Large number of files to modify (~50 files)
- Requires careful testing per module
- Migration must be done incrementally to minimize risk

**Time Estimate:**
- Phase 1 (Infrastructure): 1-2 hours
- Per Module (Action + Page + Client): 1-2 hours each
- Phase 6 (Pickers): 4-6 hours total
- Phase 7 (Documentation): 3-4 hours
- Testing: 1 hour per module

**Total Estimated Time:** 30-40 hours for complete implementation

---

## Documentation Inconsistencies Found

### PAGINATION.md vs. Actual Implementation

**Documented in PAGINATION.md:**
- "Masses module has full pagination implementation"
- "Infinite scroll infrastructure is ready but not used"
- "Most modules don't have pagination"

**Actual State:**
- ✅ Confirmed: Masses module uses pagination
- ✅ Confirmed: `useInfiniteScroll` hook exists and is complete
- ✅ Confirmed: DataTable has `onLoadMore` and `hasMore` props
- ✅ Confirmed: Most modules load all records without pagination

**Resolution:** PAGINATION.md is accurate. Will be replaced with INFINITE_SCROLLING.md.

### LIST_VIEW_PATTERN.md - Pagination Not Documented

**Issue:** LIST_VIEW_PATTERN.md shows the standard list view pattern but doesn't mention pagination implementation details.

**Resolution:** Update LIST_VIEW_PATTERN.md with infinite scroll pattern after implementation.

### MODULE_COMPONENT_PATTERNS.md - No Pagination Guidance

**Issue:** MODULE_COMPONENT_PATTERNS.md doesn't provide guidance on pagination vs. infinite scroll.

**Resolution:** Update with infinite scroll as the standard pattern.

---

## Status

**Status:** In Progress - People Module Complete
**Next Agent:** developer-agent (implement remaining 14 modules)

**User Decisions (2025-12-02):**
- ✅ **All-at-once implementation** - Implement across all modules simultaneously (not incremental)
- ✅ **Skip template modules** - No infinite scroll for Mass Types, Mass Roles, Mass Times Templates, Mass Role Templates
- ✅ **Start with People module** - ✅ COMPLETED - Implemented and tested
- ✅ **Include ScrollToTopButton** - Already exists and remains in all list views
- ✅ **EndOfListMessage component** - Created and integrated (separate from DataTable)
- ✅ **Initial load: 25 items** - LIST_VIEW_PAGE_SIZE = 25
- ✅ **Each scroll: 50 items** - INFINITE_SCROLL_LOAD_MORE_SIZE = 50
- ✅ **Search debounce: 500ms** - SEARCH_DEBOUNCE_MS = 500

**Implementation Complete (1/15 modules):**
- ✅ People module (`/people`) - Tested and working

**Key Fixes Applied:**
1. **LIST_VIEW_PAGE_SIZE constant** - Server pages MUST use this constant for initial load (not hardcoded values)
2. **Search debounce** - Search input now uses `useDebounce` hook with `SEARCH_DEBOUNCE_MS` constant
3. **EndOfListMessage component** - Created as reusable component, renders outside DataTable

**CRITICAL PATTERN FOR REMAINING MODULES:**

**Server Page (page.tsx):**
```typescript
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

const filters = {
  search: params.search,
  sort: params.sort,
  offset: 0,  // Always 0 on server
  limit: LIST_VIEW_PAGE_SIZE  // ✅ USE CONSTANT, NOT HARDCODED
}

const items = await getItems(filters)
const initialHasMore = items.length === LIST_VIEW_PAGE_SIZE  // ✅ USE CONSTANT
```

**List Client ([entities]-list-client.tsx):**
```typescript
import {
  LIST_VIEW_PAGE_SIZE,
  INFINITE_SCROLL_LOAD_MORE_SIZE,
  SEARCH_DEBOUNCE_MS
} from '@/lib/constants'
import { useDebounce } from '@/hooks/use-debounce'
import { EndOfListMessage } from '@/components/end-of-list-message'

// State
const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))
const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)
const [items, setItems] = useState(initialData)
const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)  // Start after first page
const [hasMore, setHasMore] = useState(initialHasMore)
const [isLoadingMore, setIsLoadingMore] = useState(false)

// Update URL when debounced search changes
useEffect(() => {
  filters.updateFilter('search', debouncedSearchValue)
}, [debouncedSearchValue, filters])

// Load more with INFINITE_SCROLL_LOAD_MORE_SIZE
const handleLoadMore = async () => {
  const nextItems = await getItems({
    ...filters,
    offset: offset,
    limit: INFINITE_SCROLL_LOAD_MORE_SIZE  // ✅ USE CONSTANT (50 items)
  })
  setItems(prev => [...prev, ...nextItems])
  setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
  setHasMore(nextItems.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
}

// Render with EndOfListMessage
<DataTable ... onLoadMore={handleLoadMore} hasMore={hasMore} />
<EndOfListMessage show={!hasMore && items.length > 0} />
<ScrollToTopButton />
```

**Search Input:**
```typescript
<ClearableSearchInput
  value={searchValue}
  onChange={setSearchValue}  // ✅ Just update local state
  placeholder="Search..."
/>
```

**Hand-off Notes:**
- All technical analysis is complete
- People module is reference implementation
- Documentation created (INFINITE_SCROLLING.md)
- Constants documented
- Testing requirements are clearly defined
- Success criteria are measurable

**Implementation Order:**
1. ✅ People module (proof of concept) - COMPLETE
2. Remaining 14 modules (all at once)
3. All 7 pickers (all at once)
4. Final documentation updates
