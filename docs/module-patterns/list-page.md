# Module Patterns: List Page & List Client

> **Part of:** [Module Component Patterns](../MODULE_COMPONENT_PATTERNS.md)
>
> This document covers patterns for the list page (server) and list client components that form the foundation of module list views in Outward Sign.

> **Architecture Note:** Outward Sign uses a **unified Event Types system**. Sacraments are Event Types, not separate modules. Code examples may use older patterns for illustration. **Reference Implementation:** Masses module (`src/app/(main)/mass-liturgies/`).

## Table of Contents

- [Overview](#overview)
- [1. List Page (Server)](#1-list-page-server)
  - [Structure](#structure)
  - [Key Points](#key-points)
  - [Search Params Pattern](#search-params-pattern)
- [2. List Client](#2-list-client)
  - [Structure](#structure-1)
  - [Key Points](#key-points-1)
  - [Pattern Summary](#pattern-summary)
  - [ListView Card Status and Language Pattern](#listview-card-status-and-language-pattern)
- [Related Documentation](#related-documentation)

---

## Overview

Every module's list view consists of two components working together:

1. **List Page (Server)** - Fetches data server-side, handles authentication, manages search params
2. **List Client** - Renders UI with search/filters, manages URL state, handles interactions

This separation ensures optimal performance (server-side data fetching) while maintaining rich client-side interactivity.

**For complete list view documentation with visual examples and checklist, see [LIST_VIEW_PATTERN.md](../LIST_VIEW_PATTERN.md)**

---

## 1. List Page (Server)

**File:** `page.tsx` in `app/(main)/[entity-plural]/`

**Purpose:** Server-side list page that fetches entities with filters, computes stats, and passes data to client component. **Must wrap in PageContainer.**

### Structure

```tsx
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { [Entity]ListClient } from './[entities]-list-client'
import { get[Entities], get[Entity]Stats, type [Entity]FilterParams } from '@/lib/actions/[entities]'
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

export default async function [Entities]Page({ searchParams }: PageProps) {
  // 1. Authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Parse search params (Next.js 15 requires await)
  const params = await searchParams

  // 3. Build filters from search params
  const filters: [Entity]FilterParams = {
    search: params.search,
    status: params.status as [Entity]FilterParams['status'],
    sort: params.sort as [Entity]FilterParams['sort'],
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: LIST_VIEW_PAGE_SIZE,
    start_date: params.start_date,
    end_date: params.end_date
  }

  // 4. Fetch entities server-side with filters
  const entities = await get[Entities](filters)

  // 5. Calculate stats server-side
  const stats = await get[Entity]Stats(entities)

  // 6. Define breadcrumbs
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Our [Entities]' }
  ]

  return (
    <PageContainer
      title="Our [Entities]"
      description="[Brief description of what this module manages]"
      primaryAction={<ModuleCreateButton moduleName="[Entity]" href="/[entities]/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <[Entity]ListClient initialData={entities} stats={stats} />
    </PageContainer>
  )
}
```

### Key Points

- 🔴 **CRITICAL: Must wrap in PageContainer** with title, description, and primaryAction
- ✅ Use `ModuleCreateButton` for the primary action (not a custom Button)
- ✅ Add `export const dynamic = 'force-dynamic'` for proper Next.js caching
- ✅ Always authenticate first
- ✅ `searchParams` is a **Promise** in Next.js 15 - must await it
- ✅ Include all common filter params: search, status, sort, page, start_date, end_date
- ✅ Use `LIST_VIEW_PAGE_SIZE` constant for pagination
- ✅ Fetch data server-side for better performance and SEO
- ✅ Pass data via `initialData` prop to client component
- ✅ Compute stats server-side using dedicated stats function
- ✅ Breadcrumb label should NOT include "href" for current page (only label)

### Search Params Pattern

**Next.js 15 Change:** In Next.js 15, `searchParams` is a Promise and must be awaited before accessing its properties.

**Correct (Next.js 15):**
```tsx
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams  // ← Must await
  const filters = { search: params.search }
}
```

**Incorrect (Will error in Next.js 15):**
```tsx
export default async function Page({ searchParams }: PageProps) {
  const filters = { search: searchParams.search }  // ❌ Cannot access properties directly
}
```

**Reference:** `src/app/(main)/weddings/page.tsx`

---

## 2. List Client

**File:** `[entities]-list-client.tsx` (note: PLURAL) in `app/(main)/[entity-plural]/`

**Purpose:** Client component that manages URL state for search/filters and renders the DataTable. Uses SearchCard, DataTable/ContentCard, and ListStatsBar pattern.

### Structure

```tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { [Entity]WithNames, [Entity]Stats } from '@/lib/actions/[entities]'
import { delete[Entity] } from '@/lib/actions/[entities]'
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
import { Plus, [Icon], Filter } from "lucide-react"
import { toast } from "sonner"
import { MODULE_STATUS_VALUES } from "@/lib/constants"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import {
  buildWhoColumn,
  buildWhenColumn,
  buildWhereColumn,
  buildActionsColumn
} from '@/lib/utils/table-columns'

interface [Entity]ListClientProps {
  initialData: [Entity]WithNames[]
  stats: [Entity]Stats
}

export function [Entity]ListClient({ initialData, stats }: [Entity]ListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/[entities]',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Local state for search value (synced with URL)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total [Entities]' },
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
  const [entityToDelete, setEntityToDelete] = useState<[Entity]WithNames | null>(null)

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
    if (!entityToDelete) return

    try {
      await delete[Entity](entityToDelete.id)
      toast.success('[Entity] deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete [entity]:', error)
      toast.error('Failed to delete [entity]. Please try again.')
      throw error
    }
  }

  // Define table columns using column builders
  const columns = [
    buildWhoColumn<[Entity]WithNames>({
      header: '[Primary Field]',
      getName: (entity) => entity.[primary_field],
      getStatus: (entity) => entity.status || 'PLANNING',
      sortable: true
    }),
    buildWhenColumn<[Entity]WithNames>({
      getDate: (entity) => entity.[entity]_event?.start_date || null,
      getTime: (entity) => entity.[entity]_event?.start_time || null,
      sortable: true
    }),
    buildWhereColumn<[Entity]WithNames>({
      getLocation: (entity) => entity.[entity]_event?.location || null,
      hiddenOn: 'lg'
    }),
    buildActionsColumn<[Entity]WithNames>({
      baseUrl: '/[entities]',
      onDelete: (entity) => {
        setEntityToDelete(entity)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (entity) =>
        `Are you sure you want to delete [entity description]?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search [Entities]">
        <div className="space-y-4">
          {/* Main Search Row */}
          <ClearableSearchInput
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              filters.updateFilter('search', value)
            }}
            placeholder="Search by [field]..."
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

      {/* [Entities] Table */}
      {initialData.length > 0 ? (
        <>
          <DataTable
            data={initialData}
            columns={columns}
            keyExtractor={(entity) => entity.id}
            onRowClick={(entity) => router.push(`/[entities]/${entity.id}`)}
            emptyState={{
              icon: <[Icon] className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No [entities] found' : 'No [entities] yet',
              description: hasActiveFilters
                ? 'Try adjusting your search or filters to find more [entities].'
                : 'Create your first [entity] to start managing [description].',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/[entities]/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First [Entity]
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
          icon={<[Icon] className="h-16 w-16" />}
          title={hasActiveFilters ? 'No [entities] found' : 'No [entities] yet'}
          description={hasActiveFilters
            ? 'Try adjusting your search or filters to find more [entities].'
            : 'Create your first [entity] to start managing [description].'}
          action={
            <>
              <Button asChild>
                <Link href="/[entities]/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First [Entity]
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
        <ListStatsBar title="[Entity] Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete [Entity]"
        description={
          entityToDelete
            ? `Are you sure you want to delete [entity description]? This action cannot be undone.`
            : 'Are you sure you want to delete this [entity]? This action cannot be undone.'
        }
      />
    </div>
  )
}
```

### Key Points

- 🔴 **CRITICAL: NO Create button here** - It's in PageContainer's primaryAction (server page)
- ✅ Use `SearchCard` for search and filters section
- ✅ Use `ClearableSearchInput` for main search input
- ✅ Use `AdvancedSearch` component for status/date filters (collapsible)
- ✅ Use `useListFilters` hook for URL state management
- ✅ Use `DataTable` with column builders (buildWhoColumn, buildWhenColumn, etc.)
- ✅ DataTable has built-in emptyState for filtered results (when data exists but filters match nothing)
- ✅ Use `ContentCard` for true empty state (when initialData.length === 0)
- ✅ `ListStatsBar` goes at the BOTTOM, only shown when `stats.total > 0`
- ✅ Add `stickyHeader` prop to DataTable
- ✅ Use `ScrollToTopButton` after DataTable
- ✅ File name is PLURAL: `weddings-list-client.tsx` not `wedding-list-client.tsx`
- ✅ NO client-side filtering - server handles all filtering via searchParams

### Pattern Summary

**Order of elements:**
1. SearchCard (search + advanced filters)
2. DataTable (if data exists) OR ContentCard (if no data)
3. ScrollToTopButton (only with DataTable)
4. ListStatsBar (only if stats.total > 0)
5. DeleteConfirmationDialog

**Reference:** `src/app/(main)/weddings/weddings-list-client.tsx`

### ListView Card Status and Language Pattern

**CRITICAL:** All ListView cards with status fields must use the `status` and `statusType` props. All cards with language should use the `language` prop.

#### Visual Layout

```
┌─────────────────────────────────────────┐
│ Title...     [Status Badge]    [Edit ✏️] │ ← Status in header, title truncates
│ [Language Badge]                         │ ← Language directly under title
│─────────────────────────────────────────│
│ 📅 Date/Time info                        │
│                                          │
│ Entity Details:                          │
│ • Person 1: Name                         │
│ • Person 2: Name                         │
│                                          │
│ Notes text here...                       │
│                                          │
│                         [Preview Button] │
└─────────────────────────────────────────┘
```

#### Implementation Pattern

```tsx
<ListViewCard
  title="Entity Name"
  editHref={`/entities/${entity.id}/edit`}
  viewHref={`/entities/${entity.id}`}
  viewButtonText="Preview"
  status={entity.status}              // ← Pass status here
  statusType="module"                 // ← "module", "mass", or "mass-intention"
  language={entity.event?.language || undefined}  // ← Pass language here
>
  {/* Date/time and other metadata */}
  {entity.event && (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {formatDatePretty(entity.event.start_date)}
        {entity.event.start_time && ` at ${formatTime(entity.event.start_time)}`}
      </div>
    </div>
  )}

  {/* Entity-specific content */}
  <div className="text-sm space-y-1">
    {entity.person && (
      <p className="text-muted-foreground">
        <span className="font-medium">Person:</span> {entity.person.first_name} {entity.person.last_name}
      </p>
    )}
  </div>

  {/* Notes at the end */}
  {entity.note && (
    <p className="text-sm text-muted-foreground line-clamp-2">
      {entity.note}
    </p>
  )}
</ListViewCard>
```

#### Status Label Rules

1. **Position**: Status badge appears in the card header, between title and edit button
2. **Title Truncation**: Title will truncate (`line-clamp-1`) to make room for status badge
3. **Component Integration**: ListViewCard automatically renders ModuleStatusLabel when `status` prop is provided
4. **No Import Needed**: Don't import ModuleStatusLabel in list-client files - ListViewCard handles it
5. **StatusType**: Use `"module"` for all sacrament modules (weddings, funerals, baptisms, presentations, quinceañeras)

#### Language Display Rules

1. **Position**: Language appears as plain text directly below the title in the card header
2. **Styling**: ListViewCard automatically renders language text when `language` prop is provided
3. **Display**: Language is displayed using `LANGUAGE_LABELS` for localized names (e.g., "English", "Spanish", "Latin")
4. **Language Source**: Pass the language from the appropriate field:
   - **Events**: `event.language`
   - **Readings**: `reading.language`
   - **Sacrament modules**: `entity.[entity]_event?.language` (e.g., `wedding.wedding_event?.language`)
   - **Masses**: `mass.event?.language`

#### Modules Using Status Pattern

- ✅ Weddings
- ✅ Funerals
- ✅ Baptisms
- ✅ Presentations
- ✅ Quinceañeras

**Note:** Masses and Mass Intentions do not use status labels in list views.

#### Modules Using Language Pattern

- ✅ Weddings
- ✅ Funerals
- ✅ Baptisms
- ✅ Presentations
- ✅ Quinceañeras
- ✅ Masses
- ✅ Events
- ✅ Readings

**Note:** Modules without status fields (Events, People, Locations) do not use the status prop.

---

## Related Documentation

- **[LIST_VIEW_PATTERN.md](../LIST_VIEW_PATTERN.md)** - Complete list view pattern with visual examples and checklist
- **[COMPONENT_REGISTRY.md](../COMPONENT_REGISTRY.md)** - Full component reference including SearchCard, DataTable, ListStatsBar
- **[form-view.md](./form-view.md)** - Unified Form and View Client patterns
- **[create-edit.md](./create-edit.md)** - Create and Edit page patterns
