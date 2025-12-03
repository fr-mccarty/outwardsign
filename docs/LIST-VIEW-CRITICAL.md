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
  }>
}

export default async function WeddingsPage({ searchParams }: PageProps) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Await searchParams
  const params = await searchParams

  // Fetch with filters
  const weddings = await getWeddingsWithRelations({
    search: params.search,
    status: params.status
  })

  // Pass to client component
  return <WeddingsListClient weddings={weddings} />
}
```

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
