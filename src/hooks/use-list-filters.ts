import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'

/**
 * Hook for managing list view filters in URL parameters
 *
 * This hook provides a consistent pattern for managing filter state across all module list views.
 * It handles URL parameter updates, filter clearing, and maintains page state.
 *
 * @param options - Configuration options
 * @param options.baseUrl - The base URL for the list view (e.g., '/weddings')
 * @param options.defaultFilters - Default filter values
 *
 * @example
 * ```tsx
 * const filters = useListFilters({
 *   baseUrl: '/weddings',
 *   defaultFilters: { status: 'all', sort: 'date_asc' }
 * })
 *
 * // Update a filter
 * filters.updateFilter('status', 'active')
 *
 * // Clear all filters
 * filters.clearFilters()
 *
 * // Check if filters are active
 * if (filters.hasActiveFilters) {
 *   // Show clear button
 * }
 * ```
 */
export function useListFilters(options: {
  baseUrl: string
  defaultFilters?: Record<string, string>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { baseUrl, defaultFilters = {} } = options

  /**
   * Update a single filter value in the URL
   *
   * @param key - The filter parameter name (e.g., 'status', 'search', 'sort')
   * @param value - The filter value
   */
  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // Determine default value for this key
    const defaultValue = defaultFilters[key] || 'all'

    // Set or delete parameter based on whether it matches default
    if (value && value !== defaultValue && value !== 'all' && value !== '') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Reset to page 1 when filters change (unless we're updating the page param itself)
    if (key !== 'page') {
      params.delete('page')
    }

    // Build new URL
    const newUrl = `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }, [baseUrl, defaultFilters, router, searchParams])

  /**
   * Clear all filters and return to base URL
   */
  const clearFilters = useCallback(() => {
    router.push(baseUrl)
  }, [baseUrl, router])

  /**
   * Get the current value of a filter from URL params
   *
   * @param key - The filter parameter name
   * @returns The current value or default value if not set
   */
  const getFilterValue = useCallback((key: string): string => {
    return searchParams.get(key) || defaultFilters[key] || ''
  }, [defaultFilters, searchParams])

  /**
   * Check if any filters are currently active (non-default values)
   */
  const hasActiveFilters = useCallback((): boolean => {
    const params = searchParams.toString()
    if (!params) return false

    // Check each param against its default value
    const currentParams = new URLSearchParams(params)

    for (const [key, value] of currentParams.entries()) {
      // Skip page parameter when checking for active filters
      if (key === 'page') continue

      const defaultValue = defaultFilters[key] || 'all'
      if (value && value !== defaultValue) {
        return true
      }
    }

    return false
  }, [defaultFilters, searchParams])

  return {
    updateFilter,
    clearFilters,
    getFilterValue,
    hasActiveFilters: hasActiveFilters()
  }
}
