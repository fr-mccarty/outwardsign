# List View Pattern

> **🔴 Context Requirement:** When implementing list pages for any module, you MUST include this file in your context. This file contains the authoritative pattern for all list pages to ensure consistency across the application.

> **Architecture Note:** Outward Sign uses a **unified Event Types system**. Sacraments and parish events are configured as Event Types, not separate modules. Some code examples may reference older patterns for illustration purposes, but the patterns themselves remain valid.

**Reference Implementation:** Masses module (`src/app/(main)/mass-liturgies/`)

---

## Overview

Every module list page follows a consistent two-file pattern:
1. **Server Page** (`page.tsx`) - Wraps everything in PageContainer, fetches data
2. **List Client** (`[entities]-list-client.tsx`) - Manages URL state, renders DataTable

This consistency ensures:
- Predictable user experience across all modules
- Easier code maintenance and onboarding
- Reusable patterns and components
- Proper SEO and performance

---

## Server Page Pattern

**File:** `page.tsx` in `app/(main)/[entity-plural]/`

### Complete Example

```tsx
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeddingsListClient } from './weddings-list-client'
import { getWeddings, getWeddingStats, type WeddingFilterParams } from '@/lib/actions/weddings'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    sort?: string
    page?: string
    start_date?: string
    end_date?: string
  }>
}

export default async function WeddingsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params WITH DEFAULTS
  // 🔴 CRITICAL: Apply defaults on server BEFORE calling server action
  const filters: WeddingFilterParams = {
    search: params.search,
    status: (params.status as WeddingFilterParams['status']) || 'ACTIVE',  // Default applied
    sort: (params.sort as WeddingFilterParams['sort']) || 'date_asc',      // Default applied
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: LIST_VIEW_PAGE_SIZE,
    start_date: params.start_date,
    end_date: params.end_date
  }

  // Fetch weddings server-side with filters
  const weddings = await getWeddings(filters)

  // Calculate stats server-side
  const stats = await getWeddingStats(weddings)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Weddings" }
  ]

  return (
    <PageContainer
      title="Our Weddings"
      description="Uniting couples in the bond of marriage before God."
      primaryAction={<ModuleCreateButton moduleName="Wedding" href="/weddings/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeddingsListClient initialData={weddings} stats={stats} />
    </PageContainer>
  )
}
```

### Key Requirements

- 🔴 **MUST wrap in PageContainer** with:
  - `title` - Module title (e.g., "Our Weddings")
  - `description` - Brief description of module purpose
  - `primaryAction` - `<ModuleCreateButton>` for creating new entities
- 🔴 **MUST apply default filters on server** BEFORE calling server actions (see Default Filter Application section below)
- ✅ Add `export const dynamic = 'force-dynamic'`
- ✅ Parse `searchParams` as Promise (Next.js 15)
- ✅ Include all standard filter params: search, status, sort, page, start_date, end_date
- ✅ Use `LIST_VIEW_PAGE_SIZE` constant for pagination
- ✅ Fetch data server-side with filters
- ✅ Calculate stats server-side using dedicated stats function
- ✅ Breadcrumb for current page should only have `label` (no `href`)

---

## 🔴 Default Filter Application (CRITICAL)

**Problem:** Default filters (status, sort, etc.) MUST be applied on the server page BEFORE calling server actions. Failure to do this causes the page to display incorrect data on initial load, even though the UI shows the correct filter selected.

### Why This Is Critical

**Timing Issue:**
1. **Server executes first** - Server page runs during SSR, fetches data, sends HTML to browser
2. **Client hydrates later** - Client-side `useListFilters` hook applies defaults AFTER server has already fetched data
3. **Data mismatch** - Server fetches wrong data (undefined filters), client shows correct UI (default filters)

**Real Example from Weddings Module:**
- Client default: `status: 'ACTIVE'` (show only active weddings)
- Server receives: `status: undefined` (when no URL param)
- Server action interprets `undefined` as "no filter" and returns ALL weddings (including PLANNING, COMPLETED, CANCELLED)
- Result: Page displays all weddings, but UI shows "Active" filter selected
- User sees incorrect data

### The Wrong Pattern (DO NOT USE)

```typescript
// ❌ INCORRECT - Defaults not applied on server
const filters: WeddingFilterParams = {
  search: params.search,
  status: params.status as WeddingFilterParams['status'],  // ❌ undefined when not in URL
  sort: params.sort as WeddingFilterParams['sort'],        // ❌ undefined when not in URL
  page: params.page ? parseInt(params.page, 10) : 1,
  limit: LIST_VIEW_PAGE_SIZE
}

// Server action receives undefined values
const weddings = await getWeddings(filters)  // status: undefined, sort: undefined

// Server action check FAILS when status is undefined
if (filters?.status && filters.status !== 'all') {
  query = query.eq('status', filters.status)  // ❌ Check skipped, shows ALL statuses
}
```

**What happens:**
- Page loads with no URL params
- Server passes `{ status: undefined, sort: undefined }` to server action
- Server action treats `undefined` as "no filter" and returns all data
- Client-side UI shows "Active" filter selected (from `useListFilters` defaults)
- **User sees ALL data but UI says "showing active"** - completely wrong

### The Correct Pattern (ALWAYS USE THIS)

```typescript
// ✅ CORRECT - Defaults applied on server before calling action
const filters: WeddingFilterParams = {
  search: params.search,
  status: (params.status as WeddingFilterParams['status']) || 'ACTIVE',    // ✅ Default applied
  sort: (params.sort as WeddingFilterParams['sort']) || 'date_asc',        // ✅ Default applied
  page: params.page ? parseInt(params.page, 10) : 1,
  limit: LIST_VIEW_PAGE_SIZE
}

// Server action receives actual default values
const weddings = await getWeddings(filters)  // status: 'ACTIVE', sort: 'date_asc'

// Server action check now works correctly
if (filters?.status && filters.status !== 'all') {
  query = query.eq('status', filters.status)  // ✅ Applies 'ACTIVE' filter correctly
}
```

**What happens:**
- Page loads with no URL params
- Server applies defaults: `{ status: 'ACTIVE', sort: 'date_asc' }`
- Server action receives actual default values and filters correctly
- Client-side UI shows "Active" filter selected (matches server defaults)
- **User sees ACTIVE data and UI says "showing active"** - correct

### Implementation Requirements

**For ALL server pages (`page.tsx`):**

1. **Apply defaults using OR operator pattern:**
   ```typescript
   status: (params.status as EntityFilterParams['status']) || 'ACTIVE'
   sort: (params.sort as EntityFilterParams['sort']) || 'date_asc'
   ```

2. **Match client-side defaults:**
   - Server defaults MUST match the `defaultFilters` in `useListFilters` hook
   - If client says `defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }`
   - Then server must apply same defaults

3. **Apply to ALL filters with defaults:**
   - Status filters (if module uses status filtering)
   - Sort filters (all modules)
   - Any other filters that have default values

4. **Test initial page load:**
   - Load page with NO URL parameters
   - Verify correct data is displayed
   - Verify UI filter display matches actual data shown

### Common Default Filters by Module Type

**Sacrament/Event Modules:**
```typescript
// Weddings, Funerals, Baptisms, Presentations, Quinceaneras
status: (params.status as WeddingFilterParams['status']) || 'ACTIVE',
sort: (params.sort as WeddingFilterParams['sort']) || 'date_asc',
```

**Entity Modules:**
```typescript
// Groups, People, Locations
sort: (params.sort as GroupFilterParams['sort']) || 'name_asc',
```

**Calendar/Mass Modules:**
```typescript
// Events, Masses, Mass Intentions
sort: (params.sort as EventFilterParams['sort']) || 'date_asc',
```

**Content Modules:**
```typescript
// Readings
sort: (params.sort as ReadingFilterParams['sort']) || 'created_desc',
```

### Migration Checklist

When implementing or updating server-side filtering for a module:

- [ ] Identify all filters that have defaults in `useListFilters`
- [ ] Apply defaults on server page using OR operator pattern
- [ ] Verify server defaults match client `defaultFilters` exactly
- [ ] Test initial page load with no URL parameters
- [ ] Verify correct data is displayed (not ALL data)
- [ ] Verify UI filter indicators match actual data shown
- [ ] Test that changing filters updates URL and re-fetches correctly
- [ ] Test that default filters persist across navigation

### Affected Modules

All modules with list views that use default filters:

- Weddings (status: 'ACTIVE', sort: 'date_asc')
- Funerals (status: 'ACTIVE', sort: 'date_asc')
- Baptisms (status: 'ACTIVE', sort: 'date_asc')
- Presentations (status: 'ACTIVE', sort: 'date_asc')
- Quinceaneras (status: 'ACTIVE', sort: 'date_asc')
- Groups (sort: 'name_asc')
- People (sort: 'name_asc')
- Locations (sort: 'name_asc')
- Events (sort: 'date_asc')
- Masses (sort: 'date_asc')
- Mass Intentions (sort: 'date_asc')
- Readings (sort: 'created_desc')

---

## List Client Pattern

**File:** `[entities]-list-client.tsx` (PLURAL) in `app/(main)/[entity-plural]/`

### Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ PageContainer (in server page)                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ SearchCard                                              │ │
│ │ • ClearableSearchInput                                  │ │
│ │ • AdvancedSearch (collapsible)                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ DataTable (if initialData.length > 0)                   │ │
│ │ • Column headers with sort                              │ │
│ │ • Rows (clickable)                                      │ │
│ │ • Built-in empty state for filtered results             │ │
│ │ • stickyHeader                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ OR                                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ContentCard (if initialData.length === 0)               │ │
│ │ • Icon                                                  │ │
│ │ • Title                                                 │ │
│ │ • Description                                           │ │
│ │ • "Create Your First [Entity]" button                   │ │
│ │ • "Clear Filters" button (if filters active)            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [ScrollToTopButton] (only with DataTable)                   │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ListStatsBar (only if stats.total > 0)                  │ │
│ │ • Total | Upcoming | Past | Filtered Results            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Complete Example

```tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { WeddingWithNames, WeddingStats } from '@/lib/actions/weddings'
import { deleteWedding } from '@/lib/actions/weddings'
import { DataTable } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from "@/components/search-card"
import { ContentCard } from "@/components/content-card"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, VenusAndMars, Filter } from "lucide-react"
import { toast } from "sonner"
import { MODULE_STATUS_VALUES } from "@/lib/constants"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import {
  buildAvatarColumn,
  buildWhoColumn,
  buildWhenColumn,
  buildWhereColumn,
  buildActionsColumn
} from '@/lib/utils/table-columns'

interface WeddingsListClientProps {
  initialData: WeddingWithNames[]
  stats: WeddingStats
}

export function WeddingsListClient({ initialData, stats }: WeddingsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/weddings',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Local state for search value (synced with URL)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Weddings' },
    { value: stats.upcoming, label: 'Upcoming' },
    { value: stats.past, label: 'Past' },
    { value: stats.filtered, label: 'Filtered Results' }
  ]

  // Date filters - convert string params to Date objects for DatePickerField
  const startDateParam = searchParams.get('start_date')
  const endDateParam = searchParams.get('end_date')
  const [startDate, setStartDate] = useState<Date | undefined>(
    startDateParam ? new Date(startDateParam) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    endDateParam ? new Date(endDateParam) : undefined
  )

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [weddingToDelete, setWeddingToDelete] = useState<WeddingWithNames | null>(null)

  // Clear all filters (including date filters)
  const handleClearFilters = () => {
    setSearchValue('')
    setStartDate(undefined)
    setEndDate(undefined)
    filters.clearFilters()
  }

  // Check if any filters are active
  const hasActiveFilters = filters.hasActiveFilters || startDate !== undefined || endDate !== undefined

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!weddingToDelete) return

    try {
      await deleteWedding(weddingToDelete.id)
      toast.success('Wedding deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete wedding:', error)
      toast.error('Failed to delete wedding. Please try again.')
      throw error
    }
  }

  // Define table columns using column builders
  const columns = [
    buildAvatarColumn<WeddingWithNames>({
      people: (wedding) => [wedding.bride, wedding.groom].filter(Boolean) as Array<{
        id: string
        avatar_url: string | null
        full_name: string
      }>,
      hiddenOn: 'sm'
    }),
    buildWhoColumn<WeddingWithNames>({
      header: 'Couple',
      getName: (wedding) => {
        const bride = wedding.bride?.full_name || ''
        const groom = wedding.groom?.full_name || ''
        return bride && groom ? `${bride} & ${groom}` : bride || groom || 'Unknown'
      },
      getStatus: (wedding) => wedding.status || 'PLANNING',
      sortable: true
    }),
    buildWhenColumn<WeddingWithNames>({
      getDate: (wedding) => wedding.wedding_event?.start_date || null,
      getTime: (wedding) => wedding.wedding_event?.start_time || null,
      sortable: true
    }),
    buildWhereColumn<WeddingWithNames>({
      getLocation: (wedding) => wedding.wedding_event?.location || null,
      hiddenOn: 'lg'
    }),
    buildActionsColumn<WeddingWithNames>({
      baseUrl: '/weddings',
      onDelete: (wedding) => {
        setWeddingToDelete(wedding)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (wedding) =>
        `Are you sure you want to delete the wedding for ${wedding.bride?.full_name || ''}${wedding.bride && wedding.groom ? ' and ' : ''}${wedding.groom?.full_name || ''}?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Weddings">
        <div className="space-y-4">
          {/* Main Search Row */}
          <ClearableSearchInput
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              filters.updateFilter('search', value)
            }}
            placeholder="Search by bride or groom name..."
            className="w-full"
          />

          {/* Advanced Search Collapsible */}
          <AdvancedSearch
            statusFilter={{
              value: filters.getFilterValue('status'),
              onChange: (value) => filters.updateFilter('status', value),
              statusValues: MODULE_STATUS_VALUES
            }}
            dateRangeFilter={{
              startDate: startDate,
              endDate: endDate,
              onStartDateChange: (date) => {
                setStartDate(date)
                filters.updateFilter('start_date', date ? toLocalDateString(date) : '')
              },
              onEndDateChange: (date) => {
                setEndDate(date)
                filters.updateFilter('end_date', date ? toLocalDateString(date) : '')
              }
            }}
          />
        </div>
      </SearchCard>

      {/* Weddings Table */}
      {initialData.length > 0 ? (
        <>
          <DataTable
            data={initialData}
            columns={columns}
            keyExtractor={(wedding) => wedding.id}
            onRowClick={(wedding) => router.push(`/weddings/${wedding.id}`)}
            emptyState={{
              icon: <VenusAndMars className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No weddings found' : 'No weddings yet',
              description: hasActiveFilters
                ? 'Try adjusting your search or filters to find more weddings.'
                : 'Create your first wedding to start managing wedding celebrations in your parish.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/weddings/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Wedding
                    </Link>
                  </Button>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      <Filter className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              )
            }}
            stickyHeader
          />
          <ScrollToTopButton />
        </>
      ) : (
        <EmptyState
          icon={<VenusAndMars className="h-16 w-16" />}
          title={hasActiveFilters ? 'No weddings found' : 'No weddings yet'}
          description={hasActiveFilters
            ? 'Try adjusting your search or filters to find more weddings.'
            : 'Create your first wedding to start managing wedding celebrations in your parish.'}
          action={
            <>
              <Button asChild>
                <Link href="/weddings/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Wedding
                </Link>
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </>
          }
        />
      )}

      {/* Quick Stats */}
      {stats.total > 0 && (
        <ListStatsBar title="Wedding Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Wedding"
        description={
          weddingToDelete
            ? `Are you sure you want to delete the wedding for ${weddingToDelete.bride?.full_name || ''}${weddingToDelete.bride && weddingToDelete.groom ? ' and ' : ''}${weddingToDelete.groom?.full_name || ''}? This action cannot be undone.`
            : 'Are you sure you want to delete this wedding? This action cannot be undone.'
        }
      />
    </div>
  )
}
```

### Critical Requirements

#### 1. NO Create Button in Client
🔴 **The Create button lives in PageContainer's `primaryAction` (in the server page).** Never add a create button in the list client component.

#### 2. Element Order (MUST follow exactly)
1. **SearchCard** - Search input + advanced filters
2. **DataTable** (if data exists) OR **ContentCard** (if no data)
3. **ScrollToTopButton** (only with DataTable)
4. **ListStatsBar** (only if `stats.total > 0`)
5. **DeleteConfirmationDialog**

#### 3. Empty State Handling
- **DataTable emptyState prop** - For when data exists but filters match nothing (filtered empty state)
- **ContentCard** - For when `initialData.length === 0` (true empty state)
- Both must include:
  - Icon (module-specific from lucide-react)
  - Conditional title based on `hasActiveFilters`
  - Conditional description based on `hasActiveFilters`
  - "Create Your First [Entity]" button
  - "Clear Filters" button (only if `hasActiveFilters`)

#### 4. Required Components
- ✅ `SearchCard` - Wrapper for search/filters
- ✅ `ClearableSearchInput` - Main search input with X button
- ✅ `AdvancedSearch` - Collapsible status/date filters
- ✅ `DataTable` - Table with column builders
- ✅ `ContentCard` - True empty state
- ✅ `ListStatsBar` - Stats at bottom
- ✅ `ScrollToTopButton` - After DataTable
- ✅ `DeleteConfirmationDialog` - Delete confirmation

#### 5. State Management
- ✅ Use `useListFilters` hook for URL state
- ✅ Local state for `searchValue` (synced with URL)
- ✅ Date filters stored as `Date | undefined`
- ✅ Delete dialog state (`deleteDialogOpen`, `entityToDelete`)
- ✅ Calculate `hasActiveFilters` for conditional rendering

#### 6. Column Builders
Use table column builders from `@/lib/utils/table-columns`:
- `buildAvatarColumn` - For avatar display (optional)
- `buildWhoColumn` - For primary entity name/identifier
- `buildWhenColumn` - For date/time display
- `buildWhereColumn` - For location display
- `buildActionsColumn` - For edit/delete actions

#### 7. ListStatsBar
- Must only show when `stats.total > 0`
- Must include `title` prop (e.g., "Wedding Overview")
- Must transform stats to `ListStat[]` format

---

## Common Mistakes to Avoid

❌ **Not applying default filters on server page** - 🔴 CRITICAL - Apply defaults using OR operator before calling server actions
❌ **Including `filters` in dependency arrays** - 🔴 CRITICAL - Causes infinite re-renders. See [REACT_HOOKS_PATTERNS.md](./REACT_HOOKS_PATTERNS.md)
❌ **Adding Create button in list client** - It belongs in PageContainer (server page)
❌ **ListStatsBar at top** - It must go at the bottom
❌ **No ContentCard for empty state** - Use ContentCard, not plain div
❌ **Missing stickyHeader on DataTable** - Always add `stickyHeader` prop
❌ **Not checking stats.total before showing ListStatsBar** - Always conditional
❌ **Hardcoding filters** - Use `useListFilters` hook
❌ **Not handling date filter state** - Must convert to/from Date objects
❌ **Missing "Clear Filters" button** - Always show when `hasActiveFilters`
❌ **Wrong empty state logic** - DataTable emptyState ≠ ContentCard empty state

---

## Checklist

When implementing a new list page, verify:

**Server Page:**
- [ ] Wrapped in `PageContainer`
- [ ] Has `title`, `description`, and `primaryAction`
- [ ] Uses `ModuleCreateButton` for primaryAction
- [ ] Has `export const dynamic = 'force-dynamic'`
- [ ] Awaits `searchParams` Promise
- [ ] Includes all standard filter params
- [ ] 🔴 **Applies default filters on server using OR operator** (status, sort)
- [ ] 🔴 **Server defaults match client `defaultFilters`** in `useListFilters`
- [ ] 🔴 **Tested initial page load with no URL params** - correct data displayed
- [ ] Uses `LIST_VIEW_PAGE_SIZE` constant
- [ ] Calls stats function server-side
- [ ] Breadcrumb for current page has no `href`

**List Client:**
- [ ] Uses `SearchCard` for search/filters
- [ ] Uses `ClearableSearchInput` for main search
- [ ] Uses `AdvancedSearch` for collapsible filters
- [ ] Uses `useListFilters` hook for URL state
- [ ] Uses `DataTable` with column builders
- [ ] Has `stickyHeader` on DataTable
- [ ] Uses `ContentCard` for true empty state
- [ ] Uses `ListStatsBar` at bottom (conditional)
- [ ] Uses `ScrollToTopButton` after DataTable
- [ ] Has `DeleteConfirmationDialog`
- [ ] NO create button in client
- [ ] Handles `hasActiveFilters` correctly
- [ ] Shows "Clear Filters" when filters active
- [ ] Elements in correct order

---

## Reference Files

- **Server Page Example:** `src/app/(main)/weddings/page.tsx`
- **List Client Example:** `src/app/(main)/weddings/weddings-list-client.tsx`
- **Components:**
  - `src/components/page-container.tsx`
  - `src/components/module-create-button.tsx`
  - `src/components/search-card.tsx`
  - `src/components/content-card.tsx`
  - `src/components/list-stats-bar.tsx`
  - `src/components/data-table/data-table.tsx`
  - `src/components/clearable-search-input.tsx`
  - `src/components/advanced-search.tsx`
  - `src/components/scroll-to-top-button.tsx`
  - `src/components/delete-confirmation-dialog.tsx`
- **Hooks:** `src/hooks/use-list-filters.ts`
- **Utils:** `src/lib/utils/table-columns.ts`
