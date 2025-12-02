# Module Component Patterns

> **🔴 Context Requirement:** When implementing module component structure (list pages, view pages, forms, etc.), you MUST include this file in your context. This file contains the authoritative patterns for all 8 module component files that ensure consistency across the application.

This document provides detailed implementation patterns for the 8 main component files that make up each module in Outward Sign. Each section explains the component's purpose, structure, props, and provides reference implementations.

**Reference Module:** Always use the Wedding module (`src/app/(main)/weddings/`) as the canonical implementation example.

---

## 🔴 Critical: PageContainer & ModuleViewContainer Usage

**View Page Structure:**
1. **Server Page** (`[id]/page.tsx`) - **Must wrap in `PageContainer`** with title and description
2. **View Client** (`[id]/[entity]-view-client.tsx`) - **Must use `ModuleViewContainer`** which internally manages `ModuleViewPanel`

**Never use `ModuleViewContainer` without `PageContainer` wrapping it in the server page.**

This two-layer pattern ensures:
- Consistent page headers and metadata (PageContainer)
- Standardized module view layout with side panel (ModuleViewContainer)
- Proper breadcrumb and navigation structure

**See:** [MODULE_VIEW_CONTAINER_PATTERN.md](./MODULE_VIEW_CONTAINER_PATTERN.md) for complete details.

---

## Table of Contents

- [Overview](#overview)
- [1. List Page (Server)](#1-list-page-server) - 🔴 See [LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md) for complete list view documentation
- [2. List Client](#2-list-client) - 🔴 See [LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md) for complete list view documentation
- [3. Create Page (Server)](#3-create-page-server)
- [4. View Page (Server)](#4-view-page-server)
- [5. Edit Page (Server)](#5-edit-page-server)
- [6. Form Wrapper (Client)](#6-form-wrapper-client)
- [7. Unified Form (Client)](#7-unified-form-client)
- [8. View Client](#8-view-client)

---

## Overview

Every module follows a consistent 8-file structure. This consistency ensures:
- Predictable code organization
- Easier onboarding for new developers
- Reusable patterns across all modules
- Testable, maintainable components

**The 8 Main Files:**

| # | File | Location | Type | Purpose |
|---|------|----------|------|---------|
| 1 | `page.tsx` | `[entity-plural]/` | Server | List page with search/filters |
| 2 | `[entities]-list-client.tsx` | `[entity-plural]/` | Client | List interactivity and URL state |
| 3 | `page.tsx` | `[entity-plural]/create/` | Server | Create page |
| 4 | `page.tsx` | `[entity-plural]/[id]/` | Server | View page |
| 5 | `page.tsx` | `[entity-plural]/[id]/edit/` | Server | Edit page |
| 6 | `[entity]-form-wrapper.tsx` | `[entity-plural]/` | Client | Form container with loading state |
| 7 | `[entity]-form.tsx` | `[entity-plural]/` | Client | Unified create/edit form |
| 8 | `[entity]-view-client.tsx` | `[entity-plural]/[id]/` | Client | View page display with actions |

**Note:** Delete functionality is handled by `ModuleViewContainer`/`ModuleViewPanel` via the `onDelete` prop, not a separate form-actions file.

---

## 1. List Page (Server)

> **🔴 For complete list view documentation with visual examples and checklist, see [LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md)**

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

**Reference:** `src/app/(main)/weddings/page.tsx`

---

## 2. List Client

> **🔴 For complete list view documentation with visual examples and checklist, see [LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md)**

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
        <ContentCard className="text-center py-12">
          <[Icon] className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? 'No [entities] found' : 'No [entities] yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more [entities].'
              : 'Create your first [entity] to start managing [description].'}
          </p>
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
        </ContentCard>
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

## 3. Create Page (Server)

**File:** `page.tsx` in `app/(main)/[entity-plural]/create/`

**Purpose:** Server page for creating new entities.

### Structure

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { [Entity]FormWrapper } from '../[entity]-form-wrapper'

export default async function Create[Entity]Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: '[Entities]', href: '/[entities]' },
    { label: 'Create', href: '/[entities]/create' }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <[Entity]FormWrapper />
    </>
  )
}
```

### Key Points

- ✅ No `entity` prop passed to FormWrapper (signals create mode)
- ✅ FormWrapper handles PageContainer and layout
- ✅ Minimal server page - just auth and breadcrumbs

**Reference:** `src/app/(main)/weddings/create/page.tsx`

---

## 4. View Page (Server)

**File:** `page.tsx` in `app/(main)/[entity-plural]/[id]/`

**Purpose:** Server page for viewing a single entity with full details.

### Structure

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { [Entity]ViewClient } from './[entity]-view-client'
import { get[Entity]WithRelations } from '@/lib/actions/[entities]'
import { get[Entity]PageTitle } from '@/lib/utils/formatters'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function [Entity]Page({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const entity = await get[Entity]WithRelations(id)
  if (!entity) notFound()

  // Build dynamic title from entity data
  const title = get[Entity]PageTitle(entity)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Our [Entities]', href: '/[entities]' },
    { label: 'View' }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download [entity] liturgy documents."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <[Entity]ViewClient entity={entity} />
    </PageContainer>
  )
}
```

### Key Points

- ✅ Fetch entity **with relations** using `get[Entity]WithRelations()`
- ✅ Return `notFound()` if entity doesn't exist
- ✅ **Must wrap in PageContainer** with dynamic title and description
- ✅ Use formatter helper to generate page title from entity data
- ✅ Pass full entity with relations to view client
- ✅ View client will use ModuleViewContainer internally

**Reference:** `src/app/(main)/weddings/[id]/page.tsx`

---

## 5. Edit Page (Server)

**File:** `page.tsx` in `app/(main)/[entity-plural]/[id]/edit/`

**Purpose:** Server page for editing an existing entity.

### Structure

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { [Entity]FormWrapper } from '../../[entity]-form-wrapper'
import { get[Entity]WithRelations } from '@/lib/actions/[entities]'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Edit[Entity]Page({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const entity = await get[Entity]WithRelations(id)
  if (!entity) notFound()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: '[Entities]', href: '/[entities]' },
    { label: entity.name || 'View', href: `/[entities]/${id}` },
    { label: 'Edit', href: `/[entities]/${id}/edit` }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <[Entity]FormWrapper entity={entity} />
    </>
  )
}
```

### Key Points

- ✅ Fetch entity **with relations** for editing
- ✅ Pass `entity` prop to FormWrapper (signals edit mode)
- ✅ FormWrapper shows action buttons in edit mode

**Reference:** `src/app/(main)/weddings/[id]/edit/page.tsx`

---

## 6. Form Wrapper (Client)

**File:** `[entity]-form-wrapper.tsx` in `app/(main)/[entity-plural]/`

**Purpose:** Wraps the form with PageContainer and manages loading state. Shows action buttons in edit mode.

### Structure

```tsx
'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { [Entity]Form } from './[entity]-form'
import type { [Entity] } from '@/lib/types'

interface [Entity]FormWrapperProps {
  [entity]?: [Entity]  // Base type, not WithRelations
  title: string
  description: string
  saveButtonLabel: string
}

export function [Entity]FormWrapper({
  [entity],
  title,
  description,
  saveButtonLabel
}: [Entity]FormWrapperProps) {
  const formId = '[entity]-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !![entity]

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/[entities]/${[entity].id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View [Entity]
          </Link>
        </Button>
      )}
      <SaveButton isLoading={isLoading} form={formId}>
        {saveButtonLabel}
      </SaveButton>
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      maxWidth="4xl"
      actions={actions}
    >
      <[Entity]Form
        [entity]={[entity]}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
```

### Key Points

- ✅ Uses **base type** (`[Entity]`), not `WithRelations` - wrapper doesn't need relations
- ✅ Accepts `title`, `description`, `saveButtonLabel` props for dynamic page header
- ✅ Detects edit mode via `entity` prop: `const isEditing = !!entity`
- ✅ Shows View button in edit mode only
- ✅ Uses `SaveButton` component connected to form via `formId`
- ✅ Manages `isLoading` state for the form
- ✅ Wraps form in `PageContainer` with `actions` prop
- ✅ Passes `formId` and `onLoadingChange` to form

**Reference:** `src/app/(main)/weddings/wedding-form-wrapper.tsx`

---

## 7. Unified Form (Client)

**File:** `[entity]-form.tsx` in `app/(main)/[entity-plural]/`

**Purpose:** Single form component that handles both create and edit modes.

### Structure

**Note:** Forms can use either simple useState or Zod validation. The example below shows the recommended Zod pattern for type safety and validation.

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { FormField } from '@/components/ui/form-field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormBottomActions } from '@/components/form-bottom-actions'
import { toast } from 'sonner'
import { create[Entity], update[Entity], type [Entity]WithRelations } from '@/lib/actions/[entities]'

// Zod validation schema (recommended)
const [entity]Schema = z.object({
  field1: z.string().min(1, 'Field is required'),
  field2: z.string().optional(),
  // ... all fields
})

type [Entity]FormValues = z.infer<typeof [entity]Schema>

interface [Entity]FormProps {
  entity?: [Entity]WithRelations
  formId?: string
  onLoadingChange?: (isLoading: boolean) => void
}

export function [Entity]Form({
  entity,
  formId = '[entity]-form',
  onLoadingChange
}: [Entity]FormProps) {
  const router = useRouter()
  const isEditing = !!entity
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [field1, setField1] = useState(entity?.field1 || '')
  const [field2, setField2] = useState(entity?.field2 || '')

  // Sync loading state with wrapper
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading)
    }
  }, [isLoading, onLoadingChange])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate with Zod
      const values = [entity]Schema.parse({
        field1,
        field2,
        // ... all fields
      })

      if (isEditing) {
        await update[Entity](entity.id, values)
        toast.success('[Entity] updated successfully')
        router.refresh() // ← Stays on edit page to show updated data
      } else {
        const new[Entity] = await create[Entity](values)
        toast.success('[Entity] created successfully')
        router.push(`/[entities]/${new[Entity].id}/edit`) // ← Goes to edit page
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message)  // Note: .issues (Zod v4)
      } else {
        console.error('Error saving [entity]:', error)
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} [entity]`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      id="[entity]-form"
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>[Entity] Details</CardTitle>
          <CardDescription>Basic information and fields</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            id="field1"
            label="Field 1"
            value={field1}
            onChange={setField1}
            required
            placeholder="Enter field 1"
          />

          <FormField
            id="field2"
            label="Field 2 (Optional)"
            value={field2}
            onChange={setField2}
            placeholder="Enter field 2"
          />

          {/* More fields... */}
        </CardContent>
      </Card>

      {/* Bottom Save/Cancel Buttons */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/[entities]/${entity.id}` : "/[entities]"}
        saveLabel={isEditing ? "Save [Entity]" : "Create [Entity]"}
      />
    </form>
  )
}
```

### Key Points

- ✅ Detects mode via `entity` prop
- ✅ Form ID matches wrapper's `form` attribute
- ✅ **Redirect behavior:**
  - **CREATE**: Redirects to edit page (`router.push(/entities/${id}/edit)`)
  - **UPDATE**: Stays on edit page (`router.refresh()`)
- ✅ **Zod validation recommended** for type safety and client-side validation
- ✅ **Save buttons appear in TWO locations:**
  - **Top:** In PageContainer actions (via wrapper - View + Save in edit mode, Save only in create mode)
  - **Bottom:** FormBottomActions component (Save + Cancel in both modes)
- ✅ All form fields wrapped in Card components with CardHeader/CardContent
- ✅ Uses FormField component for all inputs
- ✅ Syncs loading state with wrapper via `onLoadingChange` callback
- ✅ Handles Zod validation errors with user-friendly toast messages

**Current Implementation:** `src/app/(main)/weddings/wedding-form.tsx` (uses useState pattern without Zod)

**Recommended Pattern:** Use Zod validation as shown in example above for type safety

**See Also:** [FORMS.md](./FORMS.md) for comprehensive form patterns

---

## 8. View Client

**File:** `[entity]-view-client.tsx` in `app/(main)/[entity-plural]/[id]/`

**Purpose:** Displays entity details, renders liturgy content, and integrates ModuleViewContainer with ModuleViewPanel.

### Structure

```tsx
'use client'

import { [Entity]WithRelations, update[Entity], delete[Entity] } from '@/lib/actions/[entities]'
import { ModuleViewContainer } from '@/components/module-view-container'
import { build[Entity]Liturgy, [ENTITY]_TEMPLATES } from '@/lib/content-builders/[entity]'
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { get[Entity]Filename } from '@/lib/utils/formatters'

interface [Entity]ViewClientProps {
  entity: [Entity]WithRelations
}

export function [Entity]ViewClient({ entity }: [Entity]ViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    return get[Entity]Filename(entity, extension)
  }

  // Extract template ID from entity record
  const getTemplateId = (entity: [Entity]WithRelations) => {
    return entity.[entity]_template_id || '[entity]-full-script-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await update[Entity](entity.id, {
      [entity]_template_id: templateId,
    })
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/[entities]/${entity.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit [Entity]
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/[entities]/${entity.id}`} target="_blank">
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </Link>
      </Button>
    </>
  )

  // Generate export buttons
  const exportButtons = (
    <>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/[entities]/${entity.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/[entities]/${entity.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate template selector
  const templateSelector = (
    <TemplateSelectorDialog
      currentTemplateId={entity.[entity]_template_id}
      templates={[ENTITY]_TEMPLATES}
      moduleName="[Entity]"
      onSave={handleUpdateTemplate}
      defaultTemplateId="[entity]-full-script-english"
    />
  )

  // Build status label
  const statusLabel = <ModuleStatusLabel status={entity.status} />

  return (
    <ModuleViewContainer
      entity={entity}
      entityType="[Entity]"
      modulePath="[entities]"
      mainEvent={entity.[entity]_event}
      buildLiturgy={build[Entity]Liturgy}
      getTemplateId={getTemplateId}
      generateFilename={generateFilename}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      templateSelector={templateSelector}
      statusLabel={statusLabel}
      onDelete={delete[Entity]}
    />
  )
}
```

### Key Points

- ✅ **Uses ModuleViewContainer** which internally manages ModuleViewPanel
- ✅ Passes content builder function to ModuleViewContainer
- ✅ Provides action buttons, export buttons, and template selector
- ✅ ModuleViewContainer handles layout and liturgy rendering automatically
- ✅ **PageContainer is used in the server page**, not here

**Important:** The view page structure is:
1. **Server Page** (`page.tsx`) - Wraps everything in `PageContainer`
2. **View Client** (this component) - Uses `ModuleViewContainer` which includes `ModuleViewPanel`

**Reference:** `src/app/(main)/weddings/[id]/wedding-view-client.tsx`

**See Also:**
- [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)
- [MODULE_VIEW_CONTAINER_PATTERN.md](./MODULE_VIEW_CONTAINER_PATTERN.md)

---

## File Location Summary

```
app/(main)/[entity-plural]/
├── page.tsx                              # 1. List Page (Server)
├── [entities]-list-client.tsx            # 2. List Client
├── [entity]-form-wrapper.tsx             # 6. Form Wrapper (Client)
├── [entity]-form.tsx                     # 7. Unified Form (Client)
├── create/
│   └── page.tsx                         # 3. Create Page (Server)
└── [id]/
    ├── page.tsx                         # 4. View Page (Server)
    ├── [entity]-view-client.tsx         # 8. View Client (with actions via ModuleViewContainer)
    └── edit/
        └── page.tsx                     # 5. Edit Page (Server)
```

---

## Common Patterns

### Server vs Client Components

**Server Components (no 'use client'):**
- All `page.tsx` files
- Handle authentication
- Fetch data
- Pass serializable props to client components

**Client Components ('use client'):**
- All interactive components
- Forms with state
- Action buttons
- URL state management

### Type Safety

Always use the `[Entity]WithRelations` type for:
- Edit form props
- View client props
- Form actions props

Use base `[Entity]` type only when relations aren't needed.

### Error Handling

**Not Found:**
```tsx
const entity = await get[Entity]WithRelations(id)
if (!entity) notFound()
```

**Client Errors:**
```tsx
try {
  await delete[Entity](entity.id)
  toast.success('Success message')
} catch (error) {
  console.error('Error:', error)
  toast.error('Error message')
}
```

### Redirection Pattern

After successful operations:
- **Create:** Redirect to edit page (`/[entities]/${newEntity.id}/edit`)
- **Update:** Stay on edit page (`router.refresh()`)
- **Delete:** Redirect to list page (`/[entities]`)

---

## Related Documentation

- **[MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md)** - Step-by-step module creation checklist
- **[FORMS.md](./FORMS.md)** - Comprehensive form patterns and styling
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Globally reusable components
- **[LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)** - Content builders and renderers
- **[PICKER_PATTERNS.md](./PICKER_PATTERNS.md)** - Picker modal behavior patterns
