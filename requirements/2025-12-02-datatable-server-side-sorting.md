# Requirements: DataTable Server-Side Sorting via Column Headers

**Date:** 2025-12-02
**Feature Type:** Enhancement
**Priority:** Medium
**Complexity:** Medium

---

## Executive Summary

Convert DataTable component from client-side sorting (local state) to server-side sorting via URL parameters. Clicking sortable column headers should update URL params, trigger server re-fetch, and maintain sort state across page navigation. This brings column header sorting in line with the existing dropdown sort filter pattern already used in module list views.

---

## Feature Overview

### Current State

**DataTable Sorting (Client-Side):**
- DataTable component (`src/components/data-table/data-table.tsx`) has built-in client-side sorting
- Clicking sortable column headers sorts data in the browser using local `useState`
- Sort state: `{ key: string, direction: 'asc' | 'desc' | null }`
- Sort cycle: `asc → desc → null (no sort)` when clicking same column repeatedly
- Visual indicators: `ArrowUpDown` (unsorted), `ArrowUp` (asc), `ArrowDown` (desc)
- Columns opt-in via `sortable: true` property
- Custom sort functions supported via `sortFn` or `accessorFn` properties

**Server Actions (Existing Pattern):**
- Some modules already implement server-side sorting: groups, people, locations, readings
- Server actions accept `sort` parameter with formats like: `'name_asc'`, `'name_desc'`, `'created_asc'`, `'created_desc'`
- Sort is applied at the application level (JavaScript) or database level (SQL ORDER BY)
- Example: `getGroups({ sort: 'name_asc' })`

**List Client Pattern (Existing):**
- All list clients use `useListFilters` hook for URL state management
- Filters are stored in URL params: `?search=john&sort=name_asc&status=active`
- List clients have dropdown sort filters using `AdvancedSearch` component
- Sort dropdown changes call: `filters.updateFilter('sort', value)`
- Server pages await searchParams and pass to server actions

**Current Flow:**
```
User clicks dropdown sort → filters.updateFilter('sort', 'name_asc') →
URL updates → Next.js re-renders server page →
getEntities({ sort: 'name_asc' }) → sorted data returned →
DataTable receives sorted data
```

### Desired State

**Server-Side Column Sorting:**
- Clicking DataTable column headers updates URL sort parameter
- URL param changes trigger server re-fetch with new sort order
- DataTable headers reflect current sort state from URL params (not local state)
- Sort state persists across page navigation
- Dropdown sort filter and column header sorting work together seamlessly
- Both approaches update the same URL parameter

**Desired Flow:**
```
User clicks column header → URL param updated (?sort=name_asc) →
Next.js re-renders server page →
getEntities({ sort: 'name_asc' }) → sorted data returned →
DataTable receives sorted data + current sort state →
Column header shows active sort indicator
```

---

## Technical Scope

### 1. UI Implications

**DataTable Component Changes:**
- Remove client-side sorting logic (`useMemo` for `sortedData`)
- Remove local `sortConfig` state
- Accept new props for server-side sort state:
  - `currentSort?: { column: string, direction: 'asc' | 'desc' }` - Current sort from URL
  - `onSortChange?: (column: string, direction: 'asc' | 'desc' | null) => void` - Callback when header clicked
- Update `handleSort` to call `onSortChange` callback instead of setting local state
- Update `getSortIcon` to use `currentSort` prop instead of local state
- Keep visual indicators and UI unchanged (ArrowUpDown, ArrowUp, ArrowDown)

**List Client Components:**
- Parse current sort from URL params using `filters.getFilterValue('sort')`
- Convert sort format: `'name_asc'` → `{ column: 'name', direction: 'asc' }`
- Pass `currentSort` and `onSortChange` to DataTable
- Implement `onSortChange` to update URL via `filters.updateFilter('sort', newValue)`

**Column Configuration:**
- Existing `sortable: boolean` property determines if column header is clickable
- `sortable: true` columns will trigger server-side sorting
- `sortFn` and `accessorFn` properties become irrelevant for DataTable (server handles sorting)
- Modules can keep `sortFn`/`accessorFn` if they want client-side fallback behavior

### 2. Server Action Implications

**Standardization Needed:**
- All server actions must support `sort` parameter in `FilterParams` interface
- Sort format: `'column_direction'` (e.g., `'name_asc'`, `'name_desc'`)
- Server actions that already support sorting: groups, people, locations, readings
- Server actions that need sorting added: weddings, funerals, baptisms, presentations, etc.

**Sort Parameter Format:**
```typescript
interface EntityFilterParams {
  search?: string
  status?: string
  sort?: string  // Format: 'column_direction' e.g. 'name_asc', 'date_desc'
  page?: number
  limit?: number
  start_date?: string
  end_date?: string
}
```

**Sorting Implementation:**
```
FUNCTION getEntities(filters)
  1. Extract sort parameter (default to module's default sort)
  2. Parse column and direction from sort string
  3. Apply ORDER BY clause at database level (preferred)
     OR sort at application level (for complex computed fields)
  4. Return sorted results
END FUNCTION
```

### 3. Interface Analysis

**DataTable Component Interface:**
```typescript
// BEFORE (Client-Side Sorting)
interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  emptyState?: EmptyStateConfig
  defaultSort?: { key: string; direction: SortDirection }  // Remove this
  // ... other props
}

// AFTER (Server-Side Sorting)
interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  emptyState?: EmptyStateConfig
  currentSort?: { column: string; direction: 'asc' | 'desc' }  // NEW
  onSortChange?: (column: string, direction: 'asc' | 'desc' | null) => void  // NEW
  // ... other props
}
```

**Column Interface (No Changes):**
```typescript
interface DataTableColumn<T> {
  key: string  // Column identifier for sorting
  header: string | React.ReactNode
  cell: (row: T) => React.ReactNode
  sortable?: boolean  // Opt-in for sortable headers
  sortFn?: (a: T, b: T) => number  // Deprecated for server-side sorting
  accessorFn?: (row: T) => any  // Deprecated for server-side sorting
  // ... other properties
}
```

### 4. Styling Concerns

**No styling changes required.**
- Existing sort icons and button styling remain unchanged
- Visual indicators (ArrowUpDown, ArrowUp, ArrowDown) stay the same
- Button hover states and transitions unchanged
- Dark mode support already built-in

### 5. Component Analysis

**Existing Components (Reuse):**
- `useListFilters` hook - Already manages URL state for all filters including sort
- `AdvancedSearch` component - Already renders dropdown sort filter
- DataTable visual components - Icons, buttons, headers all reused
- No new components needed

**Component Hierarchy:**
```
Server Page (page.tsx)
  ├─ Awaits searchParams (Next.js 15)
  ├─ Calls getEntities(filters) with sort param
  └─ Passes sorted data to List Client

List Client ([entities]-list-client.tsx)
  ├─ Uses useListFilters hook
  ├─ Parses currentSort from URL
  ├─ Implements onSortChange callback
  └─ Passes currentSort + onSortChange to DataTable

DataTable Component
  ├─ Receives currentSort prop (external state)
  ├─ Calls onSortChange when header clicked
  └─ Renders sort indicators based on currentSort prop
```

### 6. Implementation Locations

**Files to Modify:**

**Core Component:**
- `/src/components/data-table/data-table.tsx` - Remove client sorting, add props for server sorting

**List Clients (Update to pass sort props):**
- `/src/app/(main)/groups/groups-list-client.tsx` - Already has server sorting, add column header support
- `/src/app/(main)/people/people-list-client.tsx` - Already has server sorting, add column header support
- `/src/app/(main)/locations/locations-list-client.tsx` - Already has server sorting, add column header support
- `/src/app/(main)/readings/readings-list-client.tsx` - Already has server sorting, add column header support
- All other module list clients that use DataTable

**Server Actions (Add/Standardize Sorting):**
Modules that already have sorting:
- `/src/lib/actions/groups.ts` ✅ Has sorting
- `/src/lib/actions/people.ts` ✅ Has sorting
- `/src/lib/actions/locations.ts` ✅ Has sorting

Modules that need sorting added:
- `/src/lib/actions/weddings.ts` - Has sort param but may need standardization
- `/src/lib/actions/funerals.ts` - Needs sorting
- `/src/lib/actions/baptisms.ts` - Needs sorting
- `/src/lib/actions/presentations.ts` - Needs sorting
- `/src/lib/actions/quinceaneras.ts` - Needs sorting
- `/src/lib/actions/events.ts` - Needs sorting
- `/src/lib/actions/masses.ts` - Needs sorting
- `/src/lib/actions/mass-intentions.ts` - Needs sorting
- Any other modules using DataTable

**Files to Create:**
- None (all existing files)

### 7. Documentation Impact

**Files to Update:**
- `/docs/COMPONENTS_DATA_TABLE.md` - Update DataTable documentation with new props and server-side sorting pattern
- `/docs/LIST_VIEW_PATTERN.md` - Update list client pattern to include column header sorting setup
- `/docs/MODULE_COMPONENT_PATTERNS.md` or `/docs/module-patterns/list-page.md` - Update list page pattern

**Documentation Sections:**
- Add "Server-Side Sorting" section to DataTable docs
- Update example code in list view pattern docs
- Document the relationship between dropdown sort and column header sort

### 8. Testing Requirements

**Unit Tests (DataTable Component):**
- Test that clicking sortable column header calls `onSortChange` callback
- Test that sort icons reflect `currentSort` prop correctly
- Test that non-sortable columns don't show sort icons
- Test sort cycle: `asc → desc → null` on repeated clicks
- Test that `currentSort` prop updates visual indicators

**Integration Tests (List Views):**
- Test that clicking column header updates URL parameter
- Test that URL parameter changes trigger server re-fetch
- Test that sort state persists after navigation and back
- Test that dropdown sort and column header sort both update same URL param
- Test sort with search filter active
- Test sort with status filter active
- Test sort with pagination

**Existing Tests to Update:**
- Any DataTable tests that rely on client-side sorting behavior
- List view tests that check default sort state

### 9. README Impact

**No README changes required.**
- This is an internal UX improvement, not a user-facing feature
- No new installation steps or configuration needed

### 10. Code Reuse & Abstraction

**Reuse Existing Patterns:**
- `useListFilters` hook - Already handles URL state management
- Sort parameter format: `'column_direction'` - Already used by groups, people, locations
- AdvancedSearch dropdown pattern - Already working, compatible with column sorting

**Abstraction Opportunities:**
- Create utility function: `parseSort(sortString)` → `{ column, direction }`
- Create utility function: `formatSort(column, direction)` → `'column_direction'`
- Create utility function: `getSortFromUrl(urlParams, defaultSort)` → parsed sort object
- These utilities can be used across all list clients

**Shared Logic:**
```typescript
// Utility: Parse sort string to object
FUNCTION parseSort(sortString: string)
  IF sortString is empty THEN return null
  SPLIT sortString by '_' into [column, direction]
  RETURN { column, direction }
END FUNCTION

// Utility: Format sort object to string
FUNCTION formatSort(column: string, direction: 'asc' | 'desc' | null)
  IF direction is null THEN return ''
  RETURN `${column}_${direction}`
END FUNCTION

// Usage in list client:
currentSort = parseSort(filters.getFilterValue('sort'))
onSortChange = (column, direction) => {
  const sortValue = formatSort(column, direction)
  filters.updateFilter('sort', sortValue)
}
```

### 11. Security Concerns

**Input Validation:**
- Sort parameter from URL must be validated server-side
- Whitelist allowed sort columns to prevent SQL injection
- Validate sort direction is either 'asc' or 'desc'

**Server-Side Validation Pattern:**
```typescript
FUNCTION getEntities(filters)
  1. Extract sort parameter from filters
  2. Parse column and direction
  3. Validate column is in ALLOWED_SORT_COLUMNS array
  4. Validate direction is 'asc' or 'desc'
  5. If validation fails, use default sort
  6. Apply validated sort to query
END FUNCTION

CONSTANT ALLOWED_SORT_COLUMNS = ['name', 'created_at', 'wedding_date', etc.]
```

**RLS Implications:**
- No RLS changes needed
- Sorting happens after RLS filtering
- Users can only sort data they have permission to see

### 12. Database Changes

**No database migrations required.**
- Sorting uses existing columns
- No new tables or indexes needed
- Existing indexes on commonly sorted columns (name, created_at, date fields) will improve performance

**Performance Considerations:**
- Database-level sorting (ORDER BY) is more efficient than application-level sorting
- Indexes on sort columns improve query performance
- Consider adding indexes to columns that will be frequently sorted

### 13. Sort Parameter Format Standardization

**Current Inconsistencies:**
- Groups: `'name_asc'`, `'name_desc'`, `'created_asc'`, `'created_desc'`
- People: `'name_asc'`, `'name_desc'`, `'created_asc'`, `'created_desc'`
- Locations: `'name_asc'`, `'name_desc'`, `'created_asc'`, `'created_desc'`
- Weddings: `'date_asc'`, `'date_desc'`, `'name_asc'`, `'name_desc'`, `'created_asc'`, `'created_desc'`

**Recommended Standard Format:**
```
Format: `column_direction`
Examples:
- 'name_asc' - Sort by name ascending
- 'name_desc' - Sort by name descending
- 'date_asc' - Sort by date ascending
- 'created_at_asc' - Sort by created_at ascending
```

**Column Name Mapping:**
- Use database column names in sort parameter
- For computed/joined fields, use descriptive names (e.g., 'name' for person.full_name)
- Multi-word columns use underscore: 'created_at', 'wedding_date', 'updated_at'

### 14. Sort Cycle Behavior

**Question: What happens when user clicks a sorted column multiple times?**

**Current Client-Side Behavior:**
```
First click: unsorted → asc
Second click: asc → desc
Third click: desc → null (unsorted)
Fourth click: null → asc (cycle repeats)
```

**Recommended Server-Side Behavior:**
```
Option A (Same as Current):
First click: unsorted → asc
Second click: asc → desc
Third click: desc → null (remove sort param from URL)
Fourth click: null → asc (cycle repeats)

Option B (Toggle Only):
First click: unsorted → asc
Second click: asc → desc
Third click: desc → asc (toggle between asc/desc, never remove)
```

**Recommendation: Option A (Same as Current)**
- Allows users to return to default/natural sort order
- Consistent with existing client-side behavior
- Removes sort parameter from URL when no sort active

**Implementation:**
```typescript
FUNCTION handleSortClick(column: string)
  currentSort = getCurrentSortFromURL()

  IF currentSort.column is different from clicked column THEN
    newSort = { column, direction: 'asc' }
  ELSE IF currentSort.direction is 'asc' THEN
    newSort = { column, direction: 'desc' }
  ELSE IF currentSort.direction is 'desc' THEN
    newSort = null  // Remove sort
  ELSE
    newSort = { column, direction: 'asc' }
  END IF

  UPDATE URL parameter with newSort
END FUNCTION
```

### 15. Multi-Column Sorting

**Question: Should multi-column sorting be supported?**

**Recommendation: No (Out of Scope for Initial Implementation)**

**Rationale:**
- Current client-side DataTable only supports single-column sorting
- Most list views don't require multi-column sorting
- URL parameter format would become complex: `?sort=name_asc,created_at_desc`
- Server action changes would be significant
- Can be added as future enhancement if needed

**Future Enhancement:**
- If multi-column sorting is needed, consider a separate feature
- Would require UI changes (Shift+Click pattern or dedicated multi-sort UI)
- Would require new URL parameter format and server action changes

### 16. Dropdown Sort vs Column Header Sort

**Question: Should dropdown sort filter still exist if column headers are sortable?**

**Recommendation: Keep Both**

**Rationale:**
- Dropdown provides quick access to common sort options without scrolling table
- Dropdown can include sort options not available as columns (e.g., "Recently Updated")
- Mobile-friendly alternative to clicking column headers
- Both update the same URL parameter, so they work seamlessly together

**Behavior:**
- Clicking dropdown sort updates URL: `?sort=name_asc`
- Clicking column header updates URL: `?sort=name_asc`
- DataTable headers reflect current sort from URL (regardless of source)
- Dropdown reflects current sort from URL (regardless of source)

**Consistency:**
- Both use same sort parameter format: `'column_direction'`
- Both trigger server re-fetch via URL change
- Both show active state based on URL parameter

### 17. Default Sort Behavior

**Current Behavior:**
- Each module has a default sort (usually `'name_asc'` or `'date_asc'`)
- Default sort is used when no sort parameter in URL
- DataTable `defaultSort` prop sets initial client-side sort

**New Behavior:**
- Remove `defaultSort` prop from DataTable (no longer needed)
- Server actions apply default sort when `filters.sort` is undefined
- List clients set default in `useListFilters` hook:
  ```typescript
  const filters = useListFilters({
    baseUrl: '/weddings',
    defaultFilters: { sort: 'date_asc' }  // Module-specific default
  })
  ```
- If URL has no sort parameter, default sort is applied server-side

### 18. Column-to-Sort Mapping

**Challenge:**
Some DataTable columns don't map 1:1 to database columns.

**Examples:**
- "Name" column might display `person.full_name` but sort by `last_name, first_name`
- "When" column might display formatted date+time but sort by `wedding_date`
- "Contact" column might display email+phone but not be sortable at all

**Solution: Column Key Mapping**

**Approach 1: Column key matches sort parameter**
```typescript
// Column key is what gets sent in sort parameter
const columns: DataTableColumn<Wedding>[] = [
  {
    key: 'name',  // Sent as '?sort=name_asc'
    header: 'Couple',
    cell: (wedding) => `${wedding.bride?.full_name} & ${wedding.groom?.full_name}`,
    sortable: true
  }
]

// Server action maps 'name' to appropriate SQL
FUNCTION getWeddings(filters)
  IF filters.sort starts with 'name' THEN
    query.order('bride.last_name', 'groom.last_name')
  END IF
END FUNCTION
```

**Approach 2: Separate sortKey property**
```typescript
const columns: DataTableColumn<Wedding>[] = [
  {
    key: 'couple',  // Display identifier
    sortKey: 'name',  // What to send in sort parameter
    header: 'Couple',
    cell: (wedding) => `${wedding.bride?.full_name} & ${wedding.groom?.full_name}`,
    sortable: true
  }
]
```

**Recommendation: Approach 1 (Key matches sort parameter)**
- Simpler implementation
- Column `key` serves dual purpose: unique identifier + sort parameter
- Server action handles the mapping to database columns
- Consistent with existing patterns

### 19. sortable Column Configuration

**Question: Should all columns be sortable by default, or opt-in?**

**Recommendation: Opt-In via `sortable: true` (Current Behavior)**

**Rationale:**
- Not all columns are meaningful to sort (e.g., Actions column, Avatar column)
- Some columns display computed/formatted data that can't be sorted
- Opt-in gives module developers explicit control
- Consistent with current DataTable implementation

**Pattern:**
```typescript
const columns: DataTableColumn<Entity>[] = [
  {
    key: 'avatar',
    header: '',
    cell: (entity) => <Avatar />,
    sortable: false  // or omit (defaults to false)
  },
  {
    key: 'name',
    header: 'Name',
    cell: (entity) => entity.name,
    sortable: true  // Explicitly opt-in
  },
  {
    key: 'actions',
    header: 'Actions',
    cell: (entity) => <ActionsMenu />,
    sortable: false  // or omit
  }
]
```

---

## Pseudo-Code Implementation

### DataTable Component Changes

```typescript
// BEFORE: Client-side sorting
COMPONENT DataTable<T>(props)
  STATE sortConfig = useState({ key: '', direction: null })

  FUNCTION handleSort(column)
    IF column is not sortable THEN return

    UPDATE sortConfig based on current state
  END FUNCTION

  COMPUTED sortedData = useMemo(() => {
    IF no sort config THEN return props.data
    APPLY sorting logic to props.data
    RETURN sorted array
  })

  RENDER table with sortedData
END COMPONENT

// AFTER: Server-side sorting
COMPONENT DataTable<T>(props)
  // No local state for sorting

  FUNCTION handleSort(column)
    IF column is not sortable THEN return

    currentSort = props.currentSort

    IF column is different from currentSort.column THEN
      newDirection = 'asc'
    ELSE IF currentSort.direction is 'asc' THEN
      newDirection = 'desc'
    ELSE IF currentSort.direction is 'desc' THEN
      newDirection = null
    ELSE
      newDirection = 'asc'
    END IF

    CALL props.onSortChange(column, newDirection)
  END FUNCTION

  FUNCTION getSortIcon(column)
    IF column is not sortable THEN return null

    IF props.currentSort.column is not column THEN
      RETURN ArrowUpDown icon
    ELSE IF props.currentSort.direction is 'asc' THEN
      RETURN ArrowUp icon
    ELSE IF props.currentSort.direction is 'desc' THEN
      RETURN ArrowDown icon
    END IF
  END FUNCTION

  RENDER table with props.data (already sorted)
  RENDER column headers with sort icons based on props.currentSort
END COMPONENT
```

### List Client Changes

```typescript
COMPONENT EntityListClient(props)
  // Extract current sort from URL
  filters = useListFilters({ baseUrl: '/entities', defaultFilters: { sort: 'name_asc' } })
  sortString = filters.getFilterValue('sort')
  currentSort = parseSort(sortString)  // { column: 'name', direction: 'asc' }

  // Handle sort change from column header
  FUNCTION handleSortChange(column, direction)
    newSortString = formatSort(column, direction)  // 'name_asc' or ''
    filters.updateFilter('sort', newSortString)
  END FUNCTION

  RENDER DataTable with:
    data = props.initialData  (already sorted by server)
    currentSort = currentSort
    onSortChange = handleSortChange
END COMPONENT
```

### Server Action Changes

```typescript
FUNCTION getEntities(filters)
  1. Extract sort parameter from filters
     sortString = filters.sort || DEFAULT_SORT

  2. Parse column and direction
     { column, direction } = parseSort(sortString)

  3. Validate sort column against whitelist
     IF column not in ALLOWED_SORT_COLUMNS THEN
       USE DEFAULT_SORT
     END IF

  4. Build query with ORDER BY
     query = supabase.from('entities').select('*')

     SWITCH column
       CASE 'name':
         query.order('name', { ascending: direction == 'asc' })
       CASE 'created_at':
         query.order('created_at', { ascending: direction == 'asc' })
       CASE 'date':
         query.order('entity_date', { ascending: direction == 'asc' })
     END SWITCH

  5. Execute query and return results
     RETURN sorted entities
END FUNCTION
```

### Utility Functions

```typescript
// Parse sort string to object
FUNCTION parseSort(sortString: string): { column: string, direction: 'asc' | 'desc' } | null
  IF sortString is empty or null THEN
    RETURN null
  END IF

  parts = sortString.split('_')
  IF parts.length < 2 THEN
    RETURN null
  END IF

  direction = parts[parts.length - 1]  // Last part is direction
  column = parts.slice(0, -1).join('_')  // Everything before last part is column

  IF direction is not 'asc' or 'desc' THEN
    RETURN null
  END IF

  RETURN { column, direction }
END FUNCTION

// Format sort object to string
FUNCTION formatSort(column: string, direction: 'asc' | 'desc' | null): string
  IF direction is null THEN
    RETURN ''
  END IF

  RETURN `${column}_${direction}`
END FUNCTION

// Get current sort from URL parameters
FUNCTION getSortFromUrl(urlParams: URLSearchParams, defaultSort: string): { column: string, direction: 'asc' | 'desc' } | null
  sortString = urlParams.get('sort') || defaultSort
  RETURN parseSort(sortString)
END FUNCTION
```

---

## Migration Strategy

### Phase 1: Core DataTable Component
1. Update DataTable component interface
2. Remove client-side sorting logic
3. Add `currentSort` and `onSortChange` props
4. Update sort icon rendering to use `currentSort` prop
5. Update tests for new behavior

### Phase 2: List Clients with Existing Server Sorting
Update list clients that already have server-side sorting:
1. Groups module
2. People module
3. Locations module
4. Readings module

### Phase 3: Remaining List Clients
Update remaining modules to add column header sorting:
1. Weddings
2. Funerals
3. Baptisms
4. Presentations
5. Quinceaneras
6. Events
7. Masses
8. Mass Intentions
9. Any others using DataTable

### Phase 4: Server Actions
For each module without server sorting:
1. Add sort parameter to FilterParams interface
2. Implement sort logic in server action
3. Validate sort parameter against whitelist
4. Add tests for sorting

### Phase 5: Documentation
1. Update DataTable component docs
2. Update list view pattern docs
3. Update module patterns docs
4. Add sorting examples to relevant guides

---

## Documentation Inconsistencies Found

**None found during this analysis.**

The existing documentation accurately reflects the current implementation patterns for list views, DataTable usage, and the useListFilters hook.

**Recommendation:**
After implementing server-side sorting, update the following documentation:
- `COMPONENTS_DATA_TABLE.md` - Currently describes client-side sorting, needs update
- `LIST_VIEW_PATTERN.md` - Needs example of column header sorting setup
- Add note about deprecation of `sortFn` and `accessorFn` for server-side sorting

---

## Estimated Complexity

**Medium Complexity**

**Breakdown:**
- **DataTable Component:** Low - Remove sorting logic, add props (1-2 hours)
- **Utility Functions:** Low - parseSort, formatSort, getSortFromUrl (1 hour)
- **List Clients Update:** Low-Medium - Update ~15 list clients (4-6 hours)
- **Server Actions:** Medium - Add sorting to ~10 modules (6-8 hours)
- **Testing:** Medium - Update existing tests, add new tests (4-6 hours)
- **Documentation:** Low - Update 3-4 doc files (2-3 hours)

**Total Estimate:** 18-26 hours

**Risk Factors:**
- Standardizing sort parameter format across all modules
- Ensuring backward compatibility during transition
- Testing all module list views thoroughly
- Performance impact of server-side sorting on large datasets

---

## Dependencies and Blockers

**Dependencies:**
- None - All required infrastructure exists (useListFilters, server actions, URL routing)

**Blockers:**
- None identified

**Recommendations:**
- Implement in phases to minimize risk
- Start with modules that already have server sorting (groups, people, locations)
- Test thoroughly before rolling out to all modules

---

## Success Criteria

**Functional Requirements:**
- ✅ Clicking sortable column headers updates URL sort parameter
- ✅ URL parameter changes trigger server re-fetch with new sort order
- ✅ Column headers reflect current sort state from URL
- ✅ Sort state persists across page navigation
- ✅ Dropdown sort and column header sort work together
- ✅ Sort cycle works: asc → desc → null → asc

**Non-Functional Requirements:**
- ✅ Sorting performance acceptable for typical dataset sizes (100-1000 records)
- ✅ No breaking changes to existing list views during migration
- ✅ Consistent sort parameter format across all modules
- ✅ All tests passing
- ✅ Documentation updated

**User Experience:**
- ✅ Visual sort indicators clear and intuitive
- ✅ Sort happens quickly with minimal loading state
- ✅ Sort state reflected in URL for bookmarking/sharing
- ✅ Mobile users can sort using dropdown or column headers

---

## Next Steps

**After Requirements Approval:**

1. **Create utility functions** for sort parsing and formatting
2. **Update DataTable component** to support server-side sorting
3. **Update groups module** list client as proof of concept
4. **Test groups module** thoroughly
5. **Roll out to remaining modules** in phases
6. **Update documentation** to reflect new patterns
7. **Create PR** for review

**Question for User:**
- Do you want all modules updated in a single PR, or phase by phase?
- Should we prioritize certain modules over others?
- Any specific concerns about the migration approach?

---

## Summary Report

**Feature:** Server-Side Sorting via DataTable Column Headers

**Technical Scope:**
- **UI Changes:** DataTable component refactor, list client updates
- **Server Changes:** Standardize sort parameter, add sorting to ~10 modules
- **Database Changes:** None

**Components:**
- **Reused:** useListFilters, AdvancedSearch, DataTable UI components
- **Modified:** DataTable core logic, all list clients, multiple server actions
- **New:** Utility functions for sort parsing

**Documentation Updates:**
- COMPONENTS_DATA_TABLE.md
- LIST_VIEW_PATTERN.md
- MODULE_COMPONENT_PATTERNS.md

**Testing Requirements:**
- Update DataTable unit tests
- Add integration tests for list views
- Test sort persistence across navigation

**Security:**
- Server-side validation of sort parameters
- Whitelist allowed sort columns
- No RLS changes needed

**Estimated Complexity:** Medium (18-26 hours)

**Dependencies:** None

**Blockers:** None

**Recommendation:** Proceed with phased implementation starting with modules that already have server-side sorting.
