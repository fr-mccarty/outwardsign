# LIST VIEW - Critical Rules Only

> **Auto-injected for list page tasks. For complete details, see [LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md)**

## Required Components (All 4 MUST be present)

### 1. SearchCard (Top)
Filters and search input:
```tsx
<SearchCard
  searchPlaceholder="Search weddings..."
  filterGroups={[
    {
      param: 'status',
      label: 'Status',
      options: WEDDING_STATUS_OPTIONS
    }
  ]}
  createHref="/weddings/create"
  createLabel="New Wedding"
/>
```

### 2. ListStatsBar (Below SearchCard)
Shows count and active filters:
```tsx
<ListStatsBar
  entityName="Wedding"
  entityNamePlural="Weddings"
  totalCount={weddings.length}
  activeFilters={activeFilters}
/>
```

### 3. Entity Grid (Main Content)
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {weddings.map(wedding => (
    <ContentCard
      key={wedding.id}
      href={`/weddings/${wedding.id}`}
      title={getWeddingPageTitle(wedding)}
      metadata={[
        { label: 'Date', value: formatDatePretty(wedding.event?.date) }
      ]}
    />
  ))}
</div>
```

### 4. Empty State (When No Results)
```tsx
<EmptyState
  icon={Heart}
  title="No weddings found"
  description="Get started by creating your first wedding."
  actionLabel="Create Wedding"
  actionHref="/weddings/create"
/>
```

## Server Component Pattern

```tsx
interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    sort?: string
  }>
}

export default async function WeddingsPage({ searchParams }: PageProps) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Await searchParams
  const params = await searchParams

  // 🔴 CRITICAL: Apply default filters BEFORE calling server action
  // Server defaults must match client useListFilters defaults
  const filters = {
    search: params.search,
    status: (params.status as WeddingFilterParams['status']) || 'ACTIVE',  // ✅ Default applied
    sort: (params.sort as WeddingFilterParams['sort']) || 'date_asc',      // ✅ Default applied
  }

  // Fetch with filters
  const weddings = await getWeddingsWithRelations(filters)

  // Pass to client component
  return <WeddingsListClient weddings={weddings} />
}
```

**Why This Matters:**
- Server executes BEFORE client hydration
- Without defaults, server passes `undefined` to server actions
- Server actions treat `undefined` as "no filter" and return ALL data
- Client UI shows default filter selected but displays ALL data (WRONG!)
- **Solution:** Apply defaults on server using OR operator pattern

## Client Component Pattern

```tsx
'use client'

export function WeddingsListClient({ weddings }: Props) {
  return (
    <PageContainer
      title="Weddings"
      breadcrumbs={[{ label: 'Weddings' }]}
    >
      <SearchCard {...searchProps} />
      <ListStatsBar {...statsProps} />

      {weddings.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {weddings.map(wedding => <ContentCard key={wedding.id} {...} />)}
        </div>
      ) : (
        <EmptyState {...emptyProps} />
      )}
    </PageContainer>
  )
}
```

## Reference
- Complete pattern: [LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md)
- Component details: [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)
- Example: `src/app/(main)/weddings/page.tsx`
