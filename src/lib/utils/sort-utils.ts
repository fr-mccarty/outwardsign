/**
 * Sort Utilities
 *
 * Utilities for parsing and formatting sort parameters for server-side sorting.
 * These utilities convert between URL sort strings (e.g., 'name_asc') and
 * structured sort objects { column: 'name', direction: 'asc' }.
 */

export interface SortConfig {
  column: string
  direction: 'asc' | 'desc'
}

/**
 * Parse a sort string from URL into a structured sort configuration.
 *
 * @param sortString - Sort string in format 'column_direction' (e.g., 'name_asc', 'date_desc')
 * @returns Structured sort config or null if invalid
 *
 * @example
 * parseSort('name_asc') // { column: 'name', direction: 'asc' }
 * parseSort('created_at_desc') // { column: 'created_at', direction: 'desc' }
 * parseSort('invalid') // null
 * parseSort('') // null
 */
export function parseSort(sortString: string | undefined | null): SortConfig | null {
  if (!sortString) {
    return null
  }

  const parts = sortString.split('_')
  if (parts.length < 2) {
    return null
  }

  // Last part is direction
  const direction = parts[parts.length - 1]

  // Everything before last part is column name (handles multi-word columns like 'created_at')
  const column = parts.slice(0, -1).join('_')

  // Validate direction
  if (direction !== 'asc' && direction !== 'desc') {
    return null
  }

  return { column, direction }
}

/**
 * Format a sort configuration into a URL sort string.
 *
 * @param column - Column name to sort by
 * @param direction - Sort direction ('asc' or 'desc'), or null to clear sort
 * @returns Sort string in format 'column_direction' or empty string if direction is null
 *
 * @example
 * formatSort('name', 'asc') // 'name_asc'
 * formatSort('created_at', 'desc') // 'created_at_desc'
 * formatSort('date', null) // ''
 */
export function formatSort(column: string, direction: 'asc' | 'desc' | null): string {
  if (direction === null) {
    return ''
  }

  return `${column}_${direction}`
}

/**
 * Get sort configuration from URL parameters with fallback to default.
 *
 * @param urlParams - URLSearchParams from useSearchParams
 * @param defaultSort - Default sort string if none in URL (e.g., 'name_asc')
 * @returns Structured sort config or null
 *
 * @example
 * const searchParams = useSearchParams()
 * const sortConfig = getSortFromUrl(searchParams, 'name_asc')
 */
export function getSortFromUrl(
  urlParams: URLSearchParams | null,
  defaultSort?: string
): SortConfig | null {
  const sortString = urlParams?.get('sort') || defaultSort
  return parseSort(sortString)
}
