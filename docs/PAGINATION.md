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
  - [Comparison Table](#comparison-table)
  - [Traditional Pagination](#1-traditional-pagination-server-side-with-previousnext-buttons)
  - [Infinite Scroll](#2-infinite-scroll-server-side-with-auto-load)
  - [Client-Side Pagination](#3-client-side-pagination)
  - [Hybrid Approach](#4-hybrid-approach)
- [Implementation Patterns](#implementation-patterns)
  - [Server-Side Pagination (Recommended)](#server-side-pagination-recommended)
  - [Infinite Scroll Implementation](#infinite-scroll-implementation)
  - [Client-Side Pagination](#client-side-pagination-1)
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

1. **Masses Module** - Full traditional pagination implementation with server actions
2. **People Actions** - Provides `getPeoplePaginated()` helper (not used in list view)
3. **CorePicker Component** - Built-in pagination support
4. **Infinite Scroll Infrastructure** - ✅ Fully implemented but **not currently used** by any modules
   - Hook: `/src/hooks/use-infinite-scroll.ts` (using IntersectionObserver)
   - DataTable integration: `/src/components/data-table/data-table.tsx` (`onLoadMore` and `hasMore` props)
   - Ready to use when mobile-first pagination is needed

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

### Comparison Table

| Strategy | Current Usage | Infrastructure | Best For | Mobile UX |
|----------|---------------|----------------|----------|-----------|
| **Traditional Pagination** | ✅ Masses module | Fully implemented | Desktop, known dataset size | Requires clicking Next |
| **Infinite Scroll** | ❌ None | ✅ Ready (unused) | Mobile, continuous browsing | Seamless, natural scrolling |
| **No Pagination** | ✅ Most modules | N/A | Small datasets (< 50 records) | Simple, all data visible |

### 1. Traditional Pagination (Server-Side with Previous/Next Buttons)

**When to Use:**
- Large datasets (> 50 records)
- Complex filtering/sorting
- Relations with large datasets
- Desktop-first interfaces
- Users need to know total page count

**Benefits:**
- Minimal data transfer
- Fast initial page load
- Supports large databases
- Clear navigation with page numbers
- Users can bookmark specific pages

**Trade-offs:**
- Requires URL param management
- Server action modifications
- More complex implementation
- Less natural on mobile devices

**Currently Used By:** Masses module

### 2. Infinite Scroll (Server-Side with Auto-Load)

**When to Use:**
- Mobile-first interfaces
- Social media-style feeds
- Continuous browsing experiences
- Unknown/variable dataset sizes
- Users don't need page numbers

**Benefits:**
- Natural mobile UX (no clicking required)
- Seamless content discovery
- Lower cognitive load (no pagination decisions)
- Better for touch interfaces
- Automatic loading reduces friction

**Trade-offs:**
- Harder to reach footer content
- No direct page access (can't jump to page 5)
- Difficult to bookmark specific positions
- Can be disorienting (users lose place)
- Performance issues if not implemented carefully

**Current Status:**
- ✅ Infrastructure exists (`useInfiniteScroll` hook + DataTable support)
- ❌ Not currently used by any modules
- 📋 Ready to implement when needed

**Infrastructure Location:**
- Hook: `/src/hooks/use-infinite-scroll.ts`
- DataTable integration: `/src/components/data-table/data-table.tsx` (lines 70-78)

### 3. Client-Side Pagination

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

### 4. Hybrid Approach

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

### Infinite Scroll Implementation

**Infrastructure Status:** ✅ Fully implemented but not currently used by any modules.

The application includes complete infinite scroll infrastructure through the `useInfiniteScroll` hook and DataTable component integration. This section documents how to implement infinite scroll when needed.

#### 1. How Infinite Scroll Works

Infinite scroll uses the IntersectionObserver API to detect when a "sentinel" element becomes visible at the bottom of the list. When the sentinel enters the viewport, it triggers a callback to fetch the next page of data.

**Key Benefits:**
- No manual "Next" button clicking required
- Natural scrolling behavior (especially on mobile)
- Automatic progressive loading
- Lower cognitive load for users

**Key Considerations:**
- Users may lose their place in the list
- Hard to access footer content
- Can't bookmark specific positions
- Need loading indicators
- Must handle edge cases (end of list, errors)

#### 2. Using the useInfiniteScroll Hook

```typescript
// Basic usage example
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'

function InfiniteListComponent() {
  const [items, setItems] = useState<Item[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const fetchNextPage = async () => {
    const nextPage = page + 1
    const newItems = await fetchItems({ page: nextPage, limit: 20 })

    setItems([...items, ...newItems])
    setPage(nextPage)
    setHasMore(newItems.length === 20) // Has more if full page returned
  }

  const { sentinelRef, isLoading } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore,
    threshold: 100, // Trigger 100px before reaching bottom (optional)
  })

  return (
    <div>
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}

      {/* Sentinel element - must be rendered when hasMore is true */}
      <div ref={sentinelRef} />

      {/* Loading indicator */}
      {isLoading && <Spinner />}

      {/* End of list message */}
      {!hasMore && <div>No more items</div>}
    </div>
  )
}
```

**Hook Parameters:**
- `onLoadMore` - Callback function to fetch next page (can be async)
- `hasMore` - Boolean indicating if more data exists
- `threshold` - Distance in pixels from bottom to trigger load (default: 100px)

**Hook Returns:**
- `sentinelRef` - Ref to attach to sentinel element
- `isLoading` - Boolean indicating if fetch is in progress

#### 3. DataTable with Infinite Scroll

The DataTable component has built-in infinite scroll support via `onLoadMore` and `hasMore` props:

```typescript
// Example: Using DataTable with infinite scroll
'use client'

import { useState } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { type Wedding } from '@/lib/types/wedding'
import { getWeddings } from '@/lib/actions/weddings'

interface WeddingsListClientProps {
  initialData: Wedding[]
  initialHasMore: boolean
}

export function WeddingsListClient({
  initialData,
  initialHasMore
}: WeddingsListClientProps) {
  const [weddings, setWeddings] = useState(initialData)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)

  const handleLoadMore = async () => {
    const nextPage = page + 1
    const newWeddings = await getWeddings({ page: nextPage, limit: 50 })

    setWeddings([...weddings, ...newWeddings])
    setPage(nextPage)
    setHasMore(newWeddings.length === 50) // Full page means more data exists
  }

  return (
    <DataTable
      data={weddings}
      columns={weddingColumns}
      keyExtractor={(wedding) => wedding.id}
      onRowClick={(wedding) => router.push(`/weddings/${wedding.id}`)}
      // Infinite scroll props
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      emptyState={{
        title: "No weddings found",
        description: "Create your first wedding to get started",
      }}
    />
  )
}
```

**DataTable Infinite Scroll Props:**
- `onLoadMore?: () => void | Promise<void>` - Callback to fetch next page
- `hasMore?: boolean` - Whether more data exists (default: false)

**Implementation Notes:**
- When `onLoadMore` and `hasMore` are provided, DataTable renders:
  - Sentinel element in a table row at the bottom
  - Loading indicator when fetching
  - Uses `useInfiniteScroll` hook internally
- The sentinel row spans all columns for proper table structure
- Loading state shows "Loading more..." with spinner

#### 4. Server Action Pattern for Infinite Scroll

```typescript
// src/lib/actions/weddings.ts

export interface WeddingFilterParams {
  search?: string
  status?: WeddingStatus | 'all'
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  hasMore: boolean
  total: number
}

export async function getWeddingsPaginated(
  filters?: WeddingFilterParams
): Promise<PaginatedResponse<WeddingWithNames>> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const page = filters?.page || 1
  const limit = filters?.limit || 50
  const offset = (page - 1) * limit

  // Fetch one extra record to determine if more exist
  let query = supabase
    .from('weddings')
    .select('*, bride:people!bride_id(*), groom:people!groom_id(*)')
    .eq('parish_id', selectedParishId)
    .range(offset, offset + limit) // Fetch limit + 1

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) throw new Error('Failed to fetch weddings')

  const records = data || []

  // Check if more records exist
  const hasMore = records.length > limit
  const dataToReturn = hasMore ? records.slice(0, limit) : records

  return {
    data: dataToReturn,
    page,
    limit,
    hasMore,
    total: -1, // Total count not needed for infinite scroll
  }
}
```

#### 5. Mobile UX Best Practices

**When implementing infinite scroll, consider:**

1. **Loading Indicators** - Always show clear loading state
   ```typescript
   {isLoading && (
     <div className="flex items-center justify-center py-8">
       <Loader2 className="h-6 w-6 animate-spin" />
       <span className="ml-2">Loading more...</span>
     </div>
   )}
   ```

2. **End of List Indicator** - Clearly communicate when no more data exists
   ```typescript
   {!hasMore && data.length > 0 && (
     <div className="text-center py-8 text-muted-foreground">
       You've reached the end of the list
     </div>
   )}
   ```

3. **Error Handling** - Handle fetch failures gracefully
   ```typescript
   const handleLoadMore = async () => {
     try {
       await fetchNextPage()
     } catch (error) {
       toast.error('Failed to load more items')
     }
   }
   ```

4. **Scroll Position Restoration** - Consider saving scroll position when navigating away
   ```typescript
   // Save position before navigation
   sessionStorage.setItem('scrollPosition', window.scrollY.toString())

   // Restore on mount
   useEffect(() => {
     const savedPosition = sessionStorage.getItem('scrollPosition')
     if (savedPosition) {
       window.scrollTo(0, parseInt(savedPosition))
       sessionStorage.removeItem('scrollPosition')
     }
   }, [])
   ```

5. **Performance** - Virtualize lists for very large datasets
   - Consider react-virtual or react-window for 1000+ items
   - Render only visible items plus buffer
   - Improves memory usage and scroll performance

#### 6. When to Choose Infinite Scroll vs Traditional Pagination

**Choose Infinite Scroll When:**
- ✅ Primary users are on mobile devices
- ✅ Content is discovery-focused (browsing, exploring)
- ✅ Page numbers aren't important
- ✅ UX should feel seamless and continuous
- ✅ Social media or feed-like interface

**Choose Traditional Pagination When:**
- ✅ Desktop is the primary interface
- ✅ Users need to navigate to specific pages
- ✅ Users need to bookmark/share specific positions
- ✅ Footer content must be accessible
- ✅ Total count and page numbers are important
- ✅ Admin or management interfaces

**Current Recommendation:**
- **Masses module** - Keep traditional pagination (admin interface, specific date ranges)
- **Future mobile-first modules** - Consider infinite scroll
- **Evaluate per module** - Based on user personas and use cases

#### 7. Complete Example: Grid View with Infinite Scroll

```typescript
// src/app/(main)/weddings/weddings-list-client.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { WeddingCard } from './wedding-card'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { getWeddingsPaginated } from '@/lib/actions/weddings'
import { type WeddingWithNames } from '@/lib/types/wedding'

interface WeddingsListClientProps {
  initialData: WeddingWithNames[]
  initialHasMore: boolean
}

export function WeddingsListClient({
  initialData,
  initialHasMore
}: WeddingsListClientProps) {
  const router = useRouter()
  const [weddings, setWeddings] = useState(initialData)
  const [page, setPage] = useState(1)
  const [hasMoreData, setHasMoreData] = useState(initialHasMore)

  const fetchNextPage = async () => {
    const nextPage = page + 1
    const response = await getWeddingsPaginated({ page: nextPage, limit: 50 })

    setWeddings(prev => [...prev, ...response.data])
    setPage(nextPage)
    setHasMoreData(response.hasMore)
  }

  const { sentinelRef, isLoading } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: hasMoreData,
  })

  if (weddings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No weddings found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grid of wedding cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weddings.map((wedding) => (
          <WeddingCard
            key={wedding.id}
            wedding={wedding}
            onClick={() => router.push(`/weddings/${wedding.id}`)}
          />
        ))}
      </div>

      {/* Sentinel element for infinite scroll trigger */}
      <div ref={sentinelRef} />

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading more weddings...</span>
        </div>
      )}

      {/* End of list message */}
      {!hasMoreData && weddings.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          You've reached the end of the list
        </div>
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

**Pattern:** Follow Masses implementation (traditional pagination with Previous/Next buttons).

**Note:** Evaluate whether any modules should use infinite scroll instead based on user personas and mobile usage patterns.

### Phase 2: Evaluate Infinite Scroll Adoption (Medium Priority)

**Decision Needed:** Which pagination strategy for each module?

Evaluate modules for infinite scroll vs traditional pagination:

- [ ] **Assess user personas** - Which modules are primarily used on mobile?
- [ ] **Mobile usage analytics** - Track device types per module
- [ ] **User workflow analysis** - Discovery browsing vs specific navigation?
- [ ] **Test with stakeholders** - Pilot infinite scroll on one module
- [ ] **Performance testing** - Measure scroll performance with large datasets

**Candidates for Infinite Scroll:**
- Modules with mobile-first usage patterns
- Browse-focused workflows (discovering events, exploring weddings)
- Modules where page numbers are less important

**Keep Traditional Pagination:**
- Admin/management interfaces (masses, mass intentions)
- Date-specific navigation (liturgical calendar views)
- Modules where bookmarking specific pages is important

### Phase 3: Improve Picker Pagination (Medium Priority)

- [ ] Update PersonPicker to use pagination
- [ ] Add pagination to EventPicker
- [ ] Add pagination to LocationPicker
- [ ] Test pagination with large datasets
- [ ] Consider infinite scroll for picker dialogs (natural mobile UX)

### Phase 4: Optimize Server Actions (Medium Priority)

- [ ] Add `getTotalCount()` helper for accurate counts
- [ ] Move more filters to database level where possible
- [ ] Add index optimization for common query patterns
- [ ] Implement `PaginatedResponse<T>` interface for consistency (supports both pagination types)

### Phase 5: Enhanced Pagination UI (Low Priority)

**Traditional Pagination Enhancements:**
- [ ] Add page number input (jump to page)
- [ ] Add "Show X per page" selector
- [ ] Add "View All" option (with warning for large datasets)
- [ ] Keyboard navigation (Page Up/Down)
- [ ] Accessibility improvements

**Infinite Scroll Enhancements:**
- [ ] Scroll position restoration on back navigation
- [ ] "Jump to top" floating button after scrolling
- [ ] Skeleton loading states during fetch
- [ ] Pull-to-refresh on mobile

### Phase 6: Advanced Features (Future)

- [ ] Cursor-based pagination (for real-time data)
- [ ] Virtual scrolling for very large lists (react-window integration)
- [ ] Prefetch next page on hover (traditional) or near-bottom (infinite scroll)
- [ ] Hybrid pagination (infinite scroll + "Load more" button fallback)
- [ ] Server-Sent Events for real-time updates during scrolling

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
