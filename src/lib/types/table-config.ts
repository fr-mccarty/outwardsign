import { type LucideIcon } from 'lucide-react'
import { type StandardSortOption } from '@/lib/constants'

/**
 * Configuration for a module's list view table
 *
 * This interface defines the contract for configuring a module's table view,
 * ensuring consistency across all module list implementations.
 *
 * @template T - The entity type for the module (e.g., WeddingWithNames, FuneralWithNames)
 *
 * @example
 * ```tsx
 * const weddingTableConfig: ModuleTableConfig<WeddingWithNames> = {
 *   searchPlaceholder: "Search by bride or groom name...",
 *   searchFields: ['bride.full_name', 'groom.full_name', 'notes'],
 *   hasStatusFilter: true,
 *   hasSortDropdown: true,
 *   hasDateRangeFilter: true,
 *   sortOptions: STANDARD_SORT_OPTIONS,
 *   emptyState: {
 *     icon: VenusAndMars,
 *     moduleNameSingular: "Wedding",
 *     moduleNamePlural: "Weddings"
 *   },
 *   createUrl: "/weddings/create",
 *   baseUrl: "/weddings"
 * }
 * ```
 */
export interface ModuleTableConfig {
  /**
   * Search Configuration
   */
  searchPlaceholder: string
  searchFields: string[] // For documentation purposes - actual search is server-side

  /**
   * Filter Configuration
   */
  hasStatusFilter: boolean
  hasSortDropdown: boolean
  hasDateRangeFilter: boolean
  sortOptions?: readonly { value: string; label: string }[] | typeof import('@/lib/constants').STANDARD_SORT_OPTIONS

  /**
   * Empty State Configuration
   */
  emptyState: {
    icon: LucideIcon
    moduleNameSingular: string // e.g., "Wedding", "Funeral"
    moduleNamePlural: string   // e.g., "Weddings", "Funerals"
  }

  /**
   * Module Routing
   */
  createUrl: string  // e.g., "/weddings/create"
  baseUrl: string    // e.g., "/weddings"
}

/**
 * Sort option type for module list views
 */
export type SortOption = StandardSortOption | string

/**
 * Data for person avatar display in table columns
 */
export interface PersonAvatarData {
  id: string
  first_name: string
  last_name: string
  full_name: string
  avatar_url?: string | null
}

/**
 * Configuration for building an avatar column
 */
export interface AvatarColumnConfig<T> {
  /**
   * Function to extract people from the row data
   */
  people: (row: T) => PersonAvatarData[]

  /**
   * Type of avatar display
   */
  type: 'single' | 'couple' | 'group'

  /**
   * Avatar size
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Column width class (e.g., 'w-[80px]')
   */
  width?: string

  /**
   * Responsive hiding behavior
   */
  hiddenOn?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Configuration for building a "who" column with status badge
 */
export interface WhoColumnConfig<T> {
  /**
   * Function to extract the display name from the row
   */
  getName: (row: T) => string

  /**
   * Function to extract the status from the row
   */
  getStatus: (row: T) => string

  /**
   * Fallback text when no name is available
   */
  fallback?: string

  /**
   * Column header text
   */
  header?: string

  /**
   * Column width class (e.g., 'max-w-[200px]')
   */
  className?: string

  /**
   * Whether the column is sortable
   */
  sortable?: boolean
}

/**
 * Configuration for building a "when" column (date + time)
 */
export interface WhenColumnConfig<T> {
  /**
   * Function to extract the date from the row
   */
  getDate: (row: T) => string | null

  /**
   * Function to extract the time from the row
   */
  getTime: (row: T) => string | null

  /**
   * Column header text
   */
  header?: string

  /**
   * Column width class (e.g., 'min-w-[120px]')
   */
  className?: string

  /**
   * Whether the column is sortable
   */
  sortable?: boolean
}

/**
 * Configuration for building a "where" column (location)
 */
export interface WhereColumnConfig<T> {
  /**
   * Function to extract the location from the row
   */
  getLocation: (row: T) => { name: string } | null

  /**
   * Column header text
   */
  header?: string

  /**
   * Column width class (e.g., 'min-w-[100px]')
   */
  className?: string

  /**
   * Responsive hiding behavior
   */
  hiddenOn?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Configuration for building an actions column
 */
export interface ActionsColumnConfig<T> {
  /**
   * Base URL for the module (e.g., '/weddings')
   */
  baseUrl: string

  /**
   * Callback when delete is clicked
   */
  onDelete: (row: T) => void

  /**
   * Function to generate delete confirmation message
   */
  getDeleteMessage: (row: T) => string

  /**
   * Column width class (e.g., 'w-[50px]')
   */
  width?: string
}
