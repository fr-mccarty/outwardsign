# Data Table System

> **Part of Component Registry** - See [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) for the complete component index.

This document covers the data table system used in module list views, including column definitions, sorting, and responsive tables.

---

## See Also

- **[LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md)** - Complete list view implementation pattern
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Complete component index

---

## Data Table System

### DataTable
**Path:** `src/components/data-table/data-table.tsx`

**Purpose:** Reusable data table component with sorting, responsive hiding, and empty states.

**Key Features:**
- Column-based configuration
- Server-side sorting with visual indicators
- Responsive column hiding
- Empty state customization
- Row click handling
- Custom row and cell styling
- Accessible table structure

**Props:**
- `data`: Array of data objects (pre-sorted by server)
- `columns`: Array of column definitions
- `keyExtractor`: Function to extract unique key from row
- `onRowClick`: Optional row click handler
- `emptyState`: Empty state configuration
- `className`: Table CSS classes
- `containerClassName`: Container CSS classes
- `rowClassName`: Row CSS classes (string or function)
- `currentSort`: Current sort state from URL (object with `column` and `direction`)
- `onSortChange`: Callback when column header clicked (receives column and direction)

**Column Definition:**
```tsx
interface DataTableColumn<T> {
  key: string  // Used as sort parameter (e.g., 'name', 'date', 'created_at')
  header: string | ReactNode
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
  hidden?: boolean
  hiddenOn?: 'sm' | 'md' | 'lg' | 'xl'  // Responsive hiding
  sortable?: boolean  // Opt-in for sortable column headers
  sortFn?: (a: T, b: T) => number  // Deprecated (server handles sorting)
  accessorFn?: (row: T) => any  // Deprecated (server handles sorting)
}
```

**Usage (Server-Side Sorting):**
```tsx
import { DataTable, type DataTableColumn } from '@/components/data-table/data-table'
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import { useListFilters } from '@/hooks/use-list-filters'

// In your list client component
export function PeopleListClient({ initialData }: { initialData: Person[] }) {
  const router = useRouter()

  // URL state management
  const filters = useListFilters({
    baseUrl: '/people',
    defaultFilters: { sort: 'name_asc' }
  })

  // Parse current sort from URL
  const currentSort = parseSort(filters.getFilterValue('sort'))

  // Handle sort change
  const handleSortChange = (column: string, direction: 'asc' | 'desc' | null) => {
    const sortValue = formatSort(column, direction)
    filters.updateFilter('sort', sortValue)
  }

  const columns: DataTableColumn<Person>[] = [
    {
      key: 'name',  // Sent to server as 'name_asc' or 'name_desc'
      header: 'Name',
      cell: (person) => person.full_name,
      sortable: true
    },
    {
      key: 'email',
      header: 'Email',
      cell: (person) => person.email || '—',
      hiddenOn: 'sm'  // Hide on small screens
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (person) => (
        <DropdownMenu>
          {/* Action buttons */}
        </DropdownMenu>
      )
    }
  ]

  return (
    <DataTable
      data={initialData}  // Already sorted by server
      columns={columns}
      keyExtractor={(person) => person.id}
      onRowClick={(person) => router.push(`/people/${person.id}`)}
      currentSort={currentSort || undefined}
      onSortChange={handleSortChange}
      emptyState={{
        icon: <Users className="h-12 w-12" />,
        title: 'No people found',
        description: 'Get started by adding your first person',
        action: <Button onClick={() => router.push('/people/create')}>Add Person</Button>
      }}
      stickyHeader
    />
  )
}
```

---

## Server-Side Sorting Pattern

**Overview:**
The DataTable component now uses server-side sorting instead of client-side sorting. Clicking sortable column headers updates URL parameters, triggers a server re-fetch, and displays the sorted data.

**Key Components:**
1. **Sort Utilities** (`src/lib/utils/sort-utils.ts`):
   - `parseSort(sortString)` - Parse URL sort string to object
   - `formatSort(column, direction)` - Format sort object to URL string
   - `getSortFromUrl(urlParams, defaultSort)` - Extract sort from URL with fallback

2. **List Client Pattern:**
   - Use `useListFilters` hook for URL state management
   - Parse current sort from URL using `parseSort()`
   - Pass `currentSort` and `onSortChange` to DataTable
   - Handle sort changes by updating URL via `filters.updateFilter()`

3. **Server Action:**
   - Accept `sort` parameter in format `'column_direction'` (e.g., `'name_asc'`, `'date_desc'`)
   - Parse and validate sort parameter
   - Apply ORDER BY clause at database level (preferred) or application level
   - Return sorted data

**Sort Cycle:**
- First click: unsorted → asc
- Second click: asc → desc
- Third click: desc → null (removes sort parameter)
- Fourth click: null → asc (cycle repeats)

**Column Key Mapping:**
The column `key` property is sent to the server as the sort parameter:
- Column key `'name'` → Server receives `'name_asc'` or `'name_desc'`
- Column key `'date'` → Server receives `'date_asc'` or `'date_desc'`
- Column key `'created_at'` → Server receives `'created_at_asc'` or `'created_at_desc'`

**Example Server Action:**
```typescript
export async function getEntities(filters?: EntityFilterParams) {
  let query = supabase.from('entities').select('*')

  // Parse and apply sort
  if (filters?.sort === 'name_asc') {
    query = query.order('name', { ascending: true })
  } else if (filters?.sort === 'name_desc') {
    query = query.order('name', { ascending: false })
  } else if (filters?.sort === 'created_at_asc') {
    query = query.order('created_at', { ascending: true })
  } else if (filters?.sort === 'created_at_desc') {
    query = query.order('created_at', { ascending: false })
  } else {
    // Default sort
    query = query.order('created_at', { ascending: false })
  }

  const { data } = await query
  return data || []
}
```

**Benefits:**
- Sort state persists across page navigation (stored in URL)
- Efficient for large datasets (sorting at database level)
- Works seamlessly with dropdown sort filters
- Supports bookmarking/sharing sorted views

**Migration Notes:**
- `defaultSort` prop is deprecated (use `defaultFilters` in `useListFilters`)
- `sortFn` and `accessorFn` column properties are deprecated (server handles sorting)
- Data should be pre-sorted by server before passing to DataTable

---

### DataTableEmpty
**Path:** `src/components/data-table/data-table-empty.tsx`

**Purpose:** Empty state component for data tables.

**Props:**
- `icon`: Optional icon to display
- `title`: Empty state title
- `description`: Empty state description
- `action`: Optional action button/element

---

### DataTableHeader
**Path:** `src/components/data-table/data-table-header.tsx`

**Purpose:** Table header component with search and actions.

---

### DataTableActions
**Path:** `src/components/data-table/data-table-actions.tsx`

**Purpose:** Action buttons for table rows (edit, delete, etc.).

---

