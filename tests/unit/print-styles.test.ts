/**
 * Unit tests for Print Styles Constants
 *
 * Tests margin calculations and style constants.
 */

import { describe, it, expect } from 'vitest'
import {
  PRINT_PAGE_MARGIN,
  WORD_PAGE_MARGIN,
  PDF_PAGE_MARGIN,
  PRINT_PAGE_STYLES,
  LITURGICAL_RUBRIC_STYLES,
} from '@/lib/print-styles'

// ============================================================================
// Margin Calculations
// ============================================================================

describe('Margin Constants', () => {
  it('PRINT_PAGE_MARGIN is in inches', () => {
    expect(PRINT_PAGE_MARGIN).toMatch(/^\d+\.?\d*in$/)
    expect(PRINT_PAGE_MARGIN).toBe('0.75in')
  })

  it('WORD_PAGE_MARGIN is in TWIPS (1440 per inch)', () => {
    // 0.75 inches * 1440 TWIPS/inch = 1080 TWIPS
    expect(WORD_PAGE_MARGIN).toBe(1080)
    expect(typeof WORD_PAGE_MARGIN).toBe('number')
  })

  it('PDF_PAGE_MARGIN is in points (72 per inch)', () => {
    // 0.75 inches * 72 points/inch = 54 points
    expect(PDF_PAGE_MARGIN).toBe(54)
    expect(typeof PDF_PAGE_MARGIN).toBe('number')
  })

  it('all margin constants are consistent (same source value)', () => {
    // Extract the inch value and verify all conversions are correct
    const inchValue = parseFloat(PRINT_PAGE_MARGIN.replace('in', ''))
    expect(WORD_PAGE_MARGIN).toBe(Math.round(inchValue * 1440))
    expect(PDF_PAGE_MARGIN).toBe(Math.round(inchValue * 72))
  })
})

// ============================================================================
// Style Strings
// ============================================================================

describe('Print Page Styles', () => {
  it('contains @page directive with margin', () => {
    expect(PRINT_PAGE_STYLES).toContain('@page')
    expect(PRINT_PAGE_STYLES).toContain('margin:')
    expect(PRINT_PAGE_STYLES).toContain(PRINT_PAGE_MARGIN)
  })

  it('sets body to white background', () => {
    expect(PRINT_PAGE_STYLES).toContain('background: white')
  })

  it('sets body text to black', () => {
    expect(PRINT_PAGE_STYLES).toContain('color: black')
  })

  it('removes box shadows from print container', () => {
    expect(PRINT_PAGE_STYLES).toContain('box-shadow: none')
  })

  it('removes border radius from print container', () => {
    expect(PRINT_PAGE_STYLES).toContain('border-radius: 0')
  })
})

describe('Liturgical Rubric Styles', () => {
  it('preserves liturgical red color', () => {
    expect(LITURGICAL_RUBRIC_STYLES).toContain('rgb(196, 30, 58)')
  })

  it('handles div elements with color styles', () => {
    expect(LITURGICAL_RUBRIC_STYLES).toContain('div[style')
  })

  it('handles span elements with color styles', () => {
    expect(LITURGICAL_RUBRIC_STYLES).toContain('span[style')
  })

  it('uses !important for print override', () => {
    expect(LITURGICAL_RUBRIC_STYLES).toContain('!important')
  })
})
