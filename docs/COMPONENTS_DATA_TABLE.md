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
- Client-side sorting with visual indicators
- Responsive column hiding
- Empty state customization
- Row click handling
- Custom row and cell styling
- Accessible table structure

**Props:**
- `data`: Array of data objects
- `columns`: Array of column definitions
- `keyExtractor`: Function to extract unique key from row
- `onRowClick`: Optional row click handler
- `emptyState`: Empty state configuration
- `className`: Table CSS classes
- `containerClassName`: Container CSS classes
- `rowClassName`: Row CSS classes (string or function)
- `defaultSort`: Default sort configuration

**Column Definition:**
```tsx
interface DataTableColumn<T> {
  key: string
  header: string | ReactNode
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
  hidden?: boolean
  hiddenOn?: 'sm' | 'md' | 'lg' | 'xl'  // Responsive hiding
  sortable?: boolean
  sortFn?: (a: T, b: T) => number
  accessorFn?: (row: T) => any
}
```

**Usage:**
```tsx
import { DataTable, type DataTableColumn } from '@/components/data-table/data-table'

const columns: DataTableColumn<Person>[] = [
  {
    key: 'name',
    header: 'Name',
    cell: (person) => `${person.first_name} ${person.last_name}`,
    sortable: true,
    accessorFn: (person) => person.first_name
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

<DataTable
  data={people}
  columns={columns}
  keyExtractor={(person) => person.id}
  onRowClick={(person) => router.push(`/people/${person.id}`)}
  emptyState={{
    icon: <Users className="h-12 w-12" />,
    title: 'No people found',
    description: 'Get started by adding your first person',
    action: <Button onClick={() => router.push('/people/create')}>Add Person</Button>
  }}
  defaultSort={{ key: 'name', direction: 'asc' }}
/>
```

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

