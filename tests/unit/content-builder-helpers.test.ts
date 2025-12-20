/**
 * Unit tests for Content Builder Helpers
 *
 * Tests gendered text, status labels, and page break helpers.
 */

import { describe, it, expect } from 'vitest'
import {
  gendered,
  getStatusLabel,
  addPageBreaksBetweenSections,
} from '@/lib/content-builders/shared/helpers'
import type { Person } from '@/lib/types'
import type { ContentSection } from '@/lib/types/liturgy-content'

// ============================================================================
// gendered
// ============================================================================

describe('gendered', () => {
  it('returns male text for male person', () => {
    const person = { sex: 'MALE' } as Person
    expect(gendered(person, 'son', 'daughter')).toBe('son')
    expect(gendered(person, 'his', 'her')).toBe('his')
  })

  it('returns female text for female person', () => {
    const person = { sex: 'FEMALE' } as Person
    expect(gendered(person, 'son', 'daughter')).toBe('daughter')
    expect(gendered(person, 'his', 'her')).toBe('her')
  })

  it('defaults to male when sex is undefined', () => {
    const person = {} as Person
    expect(gendered(person, 'son', 'daughter')).toBe('son')
  })

  it('defaults to male when person is null', () => {
    expect(gendered(null, 'son', 'daughter')).toBe('son')
    expect(gendered(undefined, 'son', 'daughter')).toBe('son')
  })

  it('uses custom default sex when provided', () => {
    const person = {} as Person
    expect(gendered(person, 'son', 'daughter', 'FEMALE')).toBe('daughter')
  })

  it('handles Spanish gendered words', () => {
    const male = { sex: 'MALE' } as Person
    const female = { sex: 'FEMALE' } as Person
    expect(gendered(male, 'bautizado', 'bautizada')).toBe('bautizado')
    expect(gendered(female, 'bautizado', 'bautizada')).toBe('bautizada')
  })
})

// ============================================================================
// getStatusLabel
// ============================================================================

describe('getStatusLabel', () => {
  it('returns English labels', () => {
    expect(getStatusLabel('ACTIVE', 'en')).toBe('Active')
    expect(getStatusLabel('PLANNING', 'en')).toBe('Planning')
    expect(getStatusLabel('COMPLETED', 'en')).toBe('Completed')
    expect(getStatusLabel('CANCELLED', 'en')).toBe('Cancelled')
  })

  it('returns Spanish labels', () => {
    expect(getStatusLabel('ACTIVE', 'es')).toBe('Activo')
    expect(getStatusLabel('PLANNING', 'es')).toBe('Planificación')
    expect(getStatusLabel('COMPLETED', 'es')).toBe('Completado')
    expect(getStatusLabel('CANCELLED', 'es')).toBe('Cancelado')
  })

  it('returns mass-specific status labels', () => {
    expect(getStatusLabel('SCHEDULED', 'en')).toBe('Scheduled')
    expect(getStatusLabel('SCHEDULED', 'es')).toBe('Programado')
  })

  it('returns mass intention status labels', () => {
    expect(getStatusLabel('REQUESTED', 'en')).toBe('Requested')
    expect(getStatusLabel('CONFIRMED', 'en')).toBe('Confirmed')
    expect(getStatusLabel('FULFILLED', 'en')).toBe('Fulfilled')
  })

  it('returns empty string for null/undefined', () => {
    expect(getStatusLabel(null, 'en')).toBe('')
    expect(getStatusLabel(undefined, 'en')).toBe('')
  })

  it('returns raw status for unknown values', () => {
    expect(getStatusLabel('UNKNOWN_STATUS', 'en')).toBe('UNKNOWN_STATUS')
  })
})

// ============================================================================
// addPageBreaksBetweenSections
// ============================================================================

describe('addPageBreaksBetweenSections', () => {
  it('adds pageBreakAfter to all sections except last', () => {
    const sections: ContentSection[] = [
      { type: 'cover-page', heading: 'Cover' },
      { type: 'reading', heading: 'Reading' },
      { type: 'petitions', heading: 'Petitions' },
    ]

    const result = addPageBreaksBetweenSections(sections)

    expect(result[0].pageBreakAfter).toBe(true)
    expect(result[1].pageBreakAfter).toBe(true)
    expect(result[2].pageBreakAfter).toBe(false)
  })

  it('handles single section (no page breaks)', () => {
    const sections: ContentSection[] = [
      { type: 'cover-page', heading: 'Cover' },
    ]

    const result = addPageBreaksBetweenSections(sections)

    expect(result[0].pageBreakAfter).toBe(false)
  })

  it('handles empty array', () => {
    const sections: ContentSection[] = []
    const result = addPageBreaksBetweenSections(sections)
    expect(result).toHaveLength(0)
  })

  it('handles two sections', () => {
    const sections: ContentSection[] = [
      { type: 'cover-page', heading: 'Cover' },
      { type: 'reading', heading: 'Reading' },
    ]

    const result = addPageBreaksBetweenSections(sections)

    expect(result[0].pageBreakAfter).toBe(true)
    expect(result[1].pageBreakAfter).toBe(false)
  })

  it('modifies original array in place', () => {
    const sections: ContentSection[] = [
      { type: 'cover-page', heading: 'Cover' },
      { type: 'reading', heading: 'Reading' },
    ]

    addPageBreaksBetweenSections(sections)

    expect(sections[0].pageBreakAfter).toBe(true)
    expect(sections[1].pageBreakAfter).toBe(false)
  })
})
