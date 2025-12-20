/**
 * Unit tests for Sort Utilities
 *
 * Tests URL sort parameter parsing and formatting.
 */

import { describe, it, expect } from 'vitest'
import { parseSort, formatSort, getSortFromUrl } from '@/lib/utils/sort-utils'

describe('parseSort', () => {
  it('parses simple column_direction format', () => {
    expect(parseSort('name_asc')).toEqual({ column: 'name', direction: 'asc' })
    expect(parseSort('date_desc')).toEqual({ column: 'date', direction: 'desc' })
  })

  it('handles multi-word column names (snake_case)', () => {
    expect(parseSort('created_at_desc')).toEqual({ column: 'created_at', direction: 'desc' })
    expect(parseSort('first_name_asc')).toEqual({ column: 'first_name', direction: 'asc' })
    expect(parseSort('start_date_time_asc')).toEqual({ column: 'start_date_time', direction: 'asc' })
  })

  it('returns null for invalid direction', () => {
    expect(parseSort('name_invalid')).toBe(null)
    expect(parseSort('name_ascending')).toBe(null)
  })

  it('returns null for missing direction', () => {
    expect(parseSort('name')).toBe(null)
    expect(parseSort('created')).toBe(null)
  })

  it('returns null for empty/null/undefined input', () => {
    expect(parseSort('')).toBe(null)
    expect(parseSort(null)).toBe(null)
    expect(parseSort(undefined)).toBe(null)
  })
})

describe('formatSort', () => {
  it('formats column and direction', () => {
    expect(formatSort('name', 'asc')).toBe('name_asc')
    expect(formatSort('created_at', 'desc')).toBe('created_at_desc')
  })

  it('returns empty string when direction is null', () => {
    expect(formatSort('name', null)).toBe('')
    expect(formatSort('date', null)).toBe('')
  })
})

describe('getSortFromUrl', () => {
  it('gets sort from URL params', () => {
    const params = new URLSearchParams('sort=name_asc')
    expect(getSortFromUrl(params)).toEqual({ column: 'name', direction: 'asc' })
  })

  it('uses default when no sort in URL', () => {
    const params = new URLSearchParams('')
    expect(getSortFromUrl(params, 'date_desc')).toEqual({ column: 'date', direction: 'desc' })
  })

  it('returns null when no sort and no default', () => {
    const params = new URLSearchParams('')
    expect(getSortFromUrl(params)).toBe(null)
  })

  it('handles null params', () => {
    expect(getSortFromUrl(null, 'name_asc')).toEqual({ column: 'name', direction: 'asc' })
    expect(getSortFromUrl(null)).toBe(null)
  })
})
