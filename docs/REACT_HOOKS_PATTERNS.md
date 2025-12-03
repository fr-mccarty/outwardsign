# React Hooks Patterns - Preventing Re-renders

> **🔴 CRITICAL:** When working with custom hooks that return objects, be aware of dependency array patterns to prevent infinite re-render loops.

## useListFilters Hook - Re-render Prevention

### The Problem

The `useListFilters` hook returns an object. Even though functions inside are memoized with `useCallback`, the **object itself is a new reference on every render**. Including `filters` in dependency arrays causes infinite re-render loops.

```typescript
// useListFilters returns a NEW object on every render
const filters = useListFilters({ ... })  // { updateFilter, clearFilters, ... }

// ❌ BAD: Including filters in deps causes re-renders
useEffect(() => {
  filters.updateFilter('search', value)
}, [value, filters])  // ❌ filters is new every render → infinite loop
```

### The Solution

The functions inside `filters` are stable (memoized). Use them directly without including the parent `filters` object in dependency arrays.

```typescript
// ✅ GOOD: Only depend on actual values that change
useEffect(() => {
  filters.updateFilter('search', debouncedSearchValue)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [debouncedSearchValue])  // ✅ Only debouncedSearchValue
```

## Required Patterns for List Clients

### 1. Search with Debounce

```typescript
const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))
const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

// Update URL when debounced search value changes
useEffect(() => {
  filters.updateFilter('search', debouncedSearchValue)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [debouncedSearchValue])  // ✅ NOT [debouncedSearchValue, filters]
```

### 2. Sort Change Handler

```typescript
const handleSortChange = useCallback((column: string, direction: 'asc' | 'desc' | null) => {
  const sortValue = formatSort(column, direction)
  filters.updateFilter('sort', sortValue)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])  // ✅ Empty array, NOT [filters]
```

### 3. Inline Filter Updates

For simple inline updates, no `useCallback` needed:

```typescript
// ✅ Direct usage in JSX
<StatusSelect
  value={filters.getFilterValue('status')}
  onChange={(value) => filters.updateFilter('status', value)}
/>

<Button onClick={filters.clearFilters}>Clear Filters</Button>
```

## Migration Checklist

When fixing re-render issues in list clients:

- [ ] Find `useEffect` with `filters` in dependency array
- [ ] Remove `filters`, keep only actual changing values
- [ ] Add `// eslint-disable-next-line react-hooks/exhaustive-deps`
- [ ] Find `useCallback` with `filters` in dependency array
- [ ] Remove `filters`, use empty array `[]` if no other deps
- [ ] Add `// eslint-disable-next-line react-hooks/exhaustive-deps`
- [ ] Test: No visual flickering when typing in search
- [ ] Test: No excessive re-renders in React DevTools

## Why This Works

- `filters.updateFilter()` is memoized with `useCallback` in the hook
- It's a **stable function reference** that doesn't change between renders
- Safe to use without including parent object in dependencies
- Only depend on values that actually change (search text, sort order, etc.)

## Common Mistake: Hook Object in Dependencies

**Any hook that returns an object has this same issue:**

```typescript
// ❌ WRONG PATTERN
const someHook = useSomeHook()
useEffect(() => {
  someHook.doSomething()
}, [someHook])  // ❌ Object is new every render

// ✅ RIGHT PATTERN
const someHook = useSomeHook()
useEffect(() => {
  someHook.doSomething()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])  // ✅ Trust that doSomething is stable
```

## Affected Modules

All list views using `useListFilters` + debounced search:
- Weddings, Funerals, Baptisms, Presentations, Quinceaneras
- Group Baptisms, Groups, Group Members
- People, Locations, Events, Masses, Mass Intentions, Readings
