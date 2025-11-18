# Pagination Documentation

> **Purpose:** Comprehensive guide to implementing and using pagination in Outward Sign.
>
> **Status:** ⚠️ Pagination implementation is currently inconsistent across modules and needs standardization work.

This document covers pagination patterns, implementation strategies, and best practices for handling large datasets in the application.

---

## Table of Contents

- [Overview](#overview)
- [Current State](#current-state)
- [When to Use Pagination](#when-to-use-pagination)
- [Pagination Strategies](#pagination-strategies)
- [Implementation Patterns](#implementation-patterns)
  - [Server-Side Pagination (Recommended)](#server-side-pagination-recommended)
  - [Client-Side Pagination](#client-side-pagination)
  - [Picker Pagination](#picker-pagination)
- [URL State Management](#url-state-management)
- [Code Examples](#code-examples)
- [Known Issues](#known-issues)
- [Future Work](#future-work)

---

## Overview

Pagination divides large datasets into smaller, manageable pages to improve:
- **Performance** - Reduces data transferred over the network
- **User Experience** - Faster page loads and more responsive UI
- **Database Load** - Queries fetch only needed records

---

## Current State

### ⚠️ Inconsistent Implementation

Pagination is currently implemented inconsistently across the application:

**✅ Has Pagination:**
- **Masses** (`/masses`) - Full server-side pagination with URL params
- **People (Picker)** - CorePicker component supports pagination
- **Global Liturgical Events (Picker)** - CorePicker component supports pagination

**❌ No Pagination:**
- **Weddings** (`/weddings`) - Loads all records
- **Funerals** (`/funerals`) - Loads all records
- **Baptisms** (`/baptisms`) - Loads all records
- **Presentations** (`/presentations`) - Loads all records
- **Quinceañeras** (`/quinceaneras`) - Loads all records
- **Mass Intentions** (`/mass-intentions`) - Loads all records
- **Events** (`/events`) - Loads all records
- **Locations** (`/locations`) - Loads all records
- **Readings** (`/readings`) - Loads all records
- **Groups** (`/groups`) - Loads all records

### Current Implementations

1. **Masses Module** - Full implementation with server actions
2. **People Actions** - Provides `getPeoplePaginated()` helper (not used in list view)
3. **CorePicker Component** - Built-in pagination support

---

## When to Use Pagination

### Thresholds for Pagination

Implement pagination when:

- **Expected records > 50** - Consider pagination for modules likely to exceed 50 records
- **Performance impact** - Page load time > 2 seconds
- **Large related data** - Records have many relations (events, people, readings)

### Don't Use Pagination When

- **Small, static datasets** - Settings, templates (< 20 records)
- **Simple list UI** - Read-only reference lists
- **Already filtered** - Results naturally limited by date ranges or other filters

---

## Pagination Strategies

### 1. Server-Side Pagination (Recommended)

**When to Use:**
- Large datasets (> 50 records)
- Complex filtering/sorting
- Relations with large datasets

**Benefits:**
- Minimal data transfer
- Fast initial page load
- Supports large databases

**Trade-offs:**
- Requires URL param management
- Server action modifications
- More complex implementation

### 2. Client-Side Pagination

**When to Use:**
- Medium datasets (20-100 records)
- Simple filtering
- All data needed for UI

**Benefits:**
- Simpler implementation
- Instant page changes
- Works with existing server actions

**Trade-offs:**
- All data loaded upfront
- Higher initial page load
- Not suitable for large datasets

### 3. Hybrid Approach

**When to Use:**
- Pickers with large datasets
- Complex search/filter requirements

**Benefits:**
- Combines benefits of both approaches
- Server filters + client search

**Trade-offs:**
- Most complex to implement
- Requires careful state management

---

## Implementation Patterns

### Server-Side Pagination (Recommended)

#### 1. Server Action (Add Pagination Params)

```typescript
// src/lib/actions/[module].ts

export interface ModuleFilterParams {
  search?: string
  status?: ModuleStatus | 'all'
  page?: number
  limit?: number
}

export async function getModuleRecords(filters?: ModuleFilterParams): Promise<ModuleWithNames[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const page = filters?.page || 1
  const limit = filters?.limit || 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('module_table')
    .select('*, related_table(*)')

  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Apply pagination using range()
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) throw new Error('Failed to fetch records')

  let records = data || []

  // Apply client-side filters (for related table fields)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    records = records.filter(record => {
      // Search related fields
      return record.some_field?.toLowerCase().includes(searchTerm)
    })
  }

  return records
}
```

#### 2. Server Page (Pass URL Params)

```typescript
// src/app/(main)/[module]/page.tsx

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    page?: string
    limit?: string
  }>
}

export default async function ModulePage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams

  // Build filters from search params
  const filters: ModuleFilterParams = {
    search: params.search,
    status: params.status as ModuleFilterParams['status'],
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 50
  }

  // Fetch records with pagination
  const records = await getModuleRecords(filters)

  // Get total count for pagination controls
  const allRecords = await getModuleRecords({ limit: 10000 })
  const stats = {
    total: allRecords.length,
    filtered: records.length,
  }

  return (
    <PageContainer title="Module Records">
      <ModuleListClient initialData={records} stats={stats} />
    </PageContainer>
  )
}
```

#### 3. Client Component (Pagination Controls)

```typescript
// src/app/(main)/[module]/[module]-list-client.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ModuleListClientProps {
  initialData: ModuleWithNames[]
  stats: { total: number; filtered: number }
}

export function ModuleListClient({ initialData, stats }: ModuleListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentPage = parseInt(searchParams.get('page') || '1')
  const currentLimit = parseInt(searchParams.get('limit') || '50')

  // Calculate pagination info
  const totalPages = Math.ceil(stats.filtered / currentLimit)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  // Update URL with new filter values
  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Reset to page 1 when filters change (unless we're specifically updating the page)
    if (!updates.page) {
      params.set('page', '1')
    }

    router.push(`/module?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialData.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({stats.filtered} results)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ page: String(currentPage - 1) })}
                  disabled={!hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ page: String(currentPage + 1) })}
                  disabled={!hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

---

### Client-Side Pagination

For simpler use cases where all data is loaded at once:

```typescript
'use client'

import { useState } from 'react'

export function SimpleListClient({ records }: { records: Record[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // Calculate pagination
  const totalPages = Math.ceil(records.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentRecords = records.slice(startIndex, endIndex)

  return (
    <div>
      {/* Display current page records */}
      <div className="grid gap-4">
        {currentRecords.map(record => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>

      {/* Simple pagination controls */}
      <div className="flex justify-center gap-2 mt-4">
        <Button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

---

### Picker Pagination

CorePicker component has built-in pagination support:

```typescript
import { CorePicker } from '@/components/core-picker'

export function SomeComponent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const pageSize = 10

  // Fetch paginated data
  const { data: result, isLoading } = useQuery({
    queryKey: ['items', page, search],
    queryFn: () => fetchItemsPaginated({ page, limit: pageSize, search })
  })

  return (
    <CorePicker
      open={open}
      onOpenChange={setOpen}
      items={result?.items || []}
      selectedItem={selectedItem}
      onSelect={handleSelect}
      title="Select Item"
      getItemLabel={(item) => item.name}
      getItemId={(item) => item.id}
      searchFields={['name', 'description']}
      // Pagination props
      enablePagination={true}
      totalCount={result?.totalCount || 0}
      currentPage={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onSearch={setSearch}
      isLoading={isLoading}
    />
  )
}
```

---

## URL State Management

### URL Parameters for Pagination

Standard URL parameters for paginated views:

```
/module?page=2&limit=50&search=term&status=active
```

**Standard Parameters:**
- `page` - Current page number (1-indexed)
- `limit` - Records per page (default: 50)
- `search` - Search query string
- `status` - Status filter (module-specific)
- `sort` - Sort order (e.g., `date_asc`, `created_desc`)

### Benefits of URL-Based State

1. **Shareable** - Users can share filtered/paginated views
2. **Bookmarkable** - Users can bookmark specific pages
3. **Browser History** - Back/forward buttons work correctly
4. **SEO-Friendly** - Crawlable pagination links

### Implementation

```typescript
// Reading from URL
const searchParams = useSearchParams()
const currentPage = parseInt(searchParams.get('page') || '1')

// Updating URL
const updatePage = (newPage: number) => {
  const params = new URLSearchParams(searchParams.toString())
  params.set('page', String(newPage))
  router.push(`/module?${params.toString()}`)
}
```

---

## Code Examples

### Example: Masses Module (Full Implementation)

The Masses module is the reference implementation for server-side pagination. See:

- Server page: `src/app/(main)/masses/page.tsx`
- Client component: `src/app/(main)/masses/masses-list-client.tsx`
- Server action: `src/lib/actions/masses.ts`

**Key Features:**
- URL-based pagination state
- Server-side filtering and sorting
- Date range filters
- Status filters
- Search across related tables
- Pagination controls with Previous/Next buttons
- Page count and result count display

---

## Known Issues

### 1. Inconsistent Implementation

**Issue:** Most modules don't have pagination, loading all records.

**Impact:**
- Slow page loads for parishes with many records
- High memory usage in browser
- Database queries fetch unnecessary data

**Solution:** Standardize pagination across all list views (see Future Work).

### 2. Mixed Filtering Strategy

**Issue:** Masses module applies some filters at database level (status), others in application layer (date range, search).

**Why:** Filtering on related table fields (`event.start_date`, `presider.first_name`) is complex with Supabase queries.

**Impact:**
- Pagination count may be inaccurate when filters are applied
- Can't use database-level pagination for all filters

**Solution:**
- Use PostgREST computed columns for related fields
- Or: Accept client-side filtering for related data
- Or: Use two-phase query (count + fetch)

### 3. No Total Count API

**Issue:** To get total count, server page fetches all records with `limit: 10000`.

**Impact:**
- Inefficient for large datasets
- Inaccurate if > 10,000 records

**Solution:** Add `getTotalCount()` server action that uses `.count()`:

```typescript
export async function getModuleCount(filters?: ModuleFilterParams): Promise<number> {
  const supabase = await createClient()

  let query = supabase
    .from('module_table')
    .select('*', { count: 'exact', head: true })

  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { count, error } = await query

  if (error) throw new Error('Failed to count records')

  return count || 0
}
```

### 4. Picker Pagination Not Used

**Issue:** `getPeoplePaginated()` exists but isn't used in People picker or list view.

**Impact:** People picker loads all records, which will be slow for parishes with many people.

**Solution:** Update PersonPicker to use pagination with CorePicker.

---

## Future Work

### Phase 1: Standardize Pagination (High Priority)

Add pagination to all main module list views:

- [ ] Weddings
- [ ] Funerals
- [ ] Baptisms
- [ ] Presentations
- [ ] Quinceañeras
- [ ] Mass Intentions
- [ ] Events
- [ ] Locations
- [ ] Readings
- [ ] Groups

**Pattern:** Follow Masses implementation exactly.

### Phase 2: Improve Picker Pagination (Medium Priority)

- [ ] Update PersonPicker to use pagination
- [ ] Add pagination to EventPicker
- [ ] Add pagination to LocationPicker
- [ ] Test pagination with large datasets

### Phase 3: Optimize Server Actions (Medium Priority)

- [ ] Add `getTotalCount()` helper for accurate counts
- [ ] Move more filters to database level where possible
- [ ] Add index optimization for common query patterns

### Phase 4: Enhanced Pagination UI (Low Priority)

- [ ] Add page number input (jump to page)
- [ ] Add "Show X per page" selector
- [ ] Add "View All" option (with warning for large datasets)
- [ ] Keyboard navigation (Page Up/Down)
- [ ] Accessibility improvements

### Phase 5: Advanced Features (Future)

- [ ] Cursor-based pagination (for real-time data)
- [ ] Infinite scroll option
- [ ] Virtual scrolling for very large lists
- [ ] Prefetch next page on hover

---

## Best Practices

### 1. Always Use URL Parameters

Store pagination state in URL, not component state:

```typescript
// ✅ Good - URL-based
const page = parseInt(searchParams.get('page') || '1')
router.push(`/module?page=${newPage}`)

// ❌ Bad - Component state
const [page, setPage] = useState(1)
```

### 2. Reset to Page 1 on Filter Change

When user changes filters, reset to page 1:

```typescript
const updateFilters = (updates: Record<string, string>) => {
  const params = new URLSearchParams(searchParams.toString())

  Object.entries(updates).forEach(([key, value]) => {
    params.set(key, value)
  })

  // Reset to page 1 unless updating page itself
  if (!updates.page) {
    params.set('page', '1')
  }

  router.push(`/module?${params.toString()}`)
}
```

### 3. Show Loading States

Display skeleton or spinner during pagination navigation:

```typescript
export default async function ModulePage({ searchParams }: PageProps) {
  // This will show loading.tsx automatically during navigation
  const records = await getModuleRecords(filters)

  return <ModuleListClient initialData={records} />
}
```

### 4. Handle Edge Cases

- Empty results
- Invalid page numbers
- Page > totalPages (redirect to last page)

```typescript
// Redirect if page out of bounds
if (currentPage > totalPages && totalPages > 0) {
  redirect(`/module?page=${totalPages}`)
}
```

### 5. Provide Result Count

Always show users how many results and which page:

```typescript
<div className="text-sm text-muted-foreground">
  Page {currentPage} of {totalPages} ({stats.filtered} results)
</div>
```

### 6. Use Consistent Page Sizes

Default page sizes by module type:

- **Main modules** (weddings, funerals, etc.): 50 per page
- **Supporting modules** (people, events): 50 per page
- **Pickers**: 10 per page
- **Reports**: 100 per page

---

## Testing Pagination

### Manual Testing Checklist

- [ ] Navigate to page 2, refresh - stays on page 2
- [ ] Change filter - resets to page 1
- [ ] Copy URL, open in new tab - shows same page
- [ ] Previous button disabled on page 1
- [ ] Next button disabled on last page
- [ ] Empty results show appropriate message
- [ ] Page count accurate after filtering
- [ ] Back button returns to previous page
- [ ] Search updates page count correctly

### Automated Testing

```typescript
test('pagination controls work correctly', async ({ page }) => {
  await page.goto('/masses')

  // Check initial state
  await expect(page.locator('text=Page 1 of')).toBeVisible()

  // Navigate to page 2
  await page.click('button:has-text("Next")')
  await expect(page).toHaveURL(/page=2/)
  await expect(page.locator('text=Page 2 of')).toBeVisible()

  // Previous button works
  await page.click('button:has-text("Previous")')
  await expect(page).toHaveURL(/page=1/)

  // Filter resets to page 1
  await page.goto('/masses?page=3')
  await page.selectOption('select[name="status"]', 'ACTIVE')
  await expect(page).toHaveURL(/page=1/)
})
```

---

## Related Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Data flow and performance patterns
- **[CODE_CONVENTIONS.md](./CODE_CONVENTIONS.md)** - General coding standards
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - CorePicker pagination props
- **[MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md)** - List page patterns
