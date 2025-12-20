/**
 * Unit tests for Liturgical Color Utilities
 *
 * Tests the mapping of liturgical API colors to CSS classes and variables.
 */

import { describe, it, expect } from 'vitest'
import {
  getLiturgicalCssVar,
  getLiturgicalBgClass,
  getLiturgicalTextClass,
  getLiturgicalColorClasses,
  getLiturgicalCssVarValue,
} from '@/lib/utils/liturgical-colors'

describe('getLiturgicalCssVar', () => {
  it('maps standard liturgical colors', () => {
    expect(getLiturgicalCssVar('white')).toBe('liturgy-white')
    expect(getLiturgicalCssVar('red')).toBe('liturgy-red')
    expect(getLiturgicalCssVar('purple')).toBe('liturgy-purple')
    expect(getLiturgicalCssVar('green')).toBe('liturgy-green')
    expect(getLiturgicalCssVar('gold')).toBe('liturgy-gold')
  })

  it('handles case insensitivity', () => {
    expect(getLiturgicalCssVar('WHITE')).toBe('liturgy-white')
    expect(getLiturgicalCssVar('Red')).toBe('liturgy-red')
    expect(getLiturgicalCssVar('GREEN')).toBe('liturgy-green')
  })

  it('returns null for unknown colors', () => {
    expect(getLiturgicalCssVar('blue')).toBe(null)
    expect(getLiturgicalCssVar('unknown')).toBe(null)
  })
})

describe('getLiturgicalBgClass', () => {
  it('returns background classes for valid colors', () => {
    expect(getLiturgicalBgClass('white')).toBe('bg-liturgy-white')
    expect(getLiturgicalBgClass('red')).toBe('bg-liturgy-red')
    expect(getLiturgicalBgClass('purple')).toBe('bg-liturgy-purple')
    expect(getLiturgicalBgClass('green')).toBe('bg-liturgy-green')
  })

  it('handles violet as purple alias', () => {
    expect(getLiturgicalBgClass('violet')).toBe('bg-liturgy-purple')
  })

  it('applies opacity when specified', () => {
    expect(getLiturgicalBgClass('white', 10)).toBe('bg-liturgy-white/10')
    expect(getLiturgicalBgClass('red', 50)).toBe('bg-liturgy-red/50')
  })

  it('returns fallback for null/undefined', () => {
    expect(getLiturgicalBgClass(null)).toBe('bg-muted')
    expect(getLiturgicalBgClass(undefined)).toBe('bg-muted')
  })

  it('returns fallback for unknown colors', () => {
    expect(getLiturgicalBgClass('blue')).toBe('bg-muted')
  })
})

describe('getLiturgicalTextClass', () => {
  it('returns text color classes for valid colors', () => {
    expect(getLiturgicalTextClass('white')).toBe('text-liturgy-white-foreground')
    expect(getLiturgicalTextClass('red')).toBe('text-liturgy-red-foreground')
    expect(getLiturgicalTextClass('green')).toBe('text-liturgy-green-foreground')
  })

  it('handles violet as purple alias', () => {
    expect(getLiturgicalTextClass('violet')).toBe('text-liturgy-purple-foreground')
  })

  it('returns empty string for null/undefined', () => {
    expect(getLiturgicalTextClass(null)).toBe('')
    expect(getLiturgicalTextClass(undefined)).toBe('')
  })

  it('returns empty string for unknown colors', () => {
    expect(getLiturgicalTextClass('blue')).toBe('')
  })
})

describe('getLiturgicalColorClasses', () => {
  it('combines background and text classes', () => {
    expect(getLiturgicalColorClasses('red')).toBe('bg-liturgy-red text-liturgy-red-foreground')
    expect(getLiturgicalColorClasses('green')).toBe('bg-liturgy-green text-liturgy-green-foreground')
  })

  it('omits text class when using opacity', () => {
    // With opacity, text class is omitted for better contrast
    expect(getLiturgicalColorClasses('red', 50)).toBe('bg-liturgy-red/50')
    expect(getLiturgicalColorClasses('green', 10)).toBe('bg-liturgy-green/10')
  })

  it('returns fallback for null/undefined', () => {
    expect(getLiturgicalColorClasses(null)).toBe('bg-muted/50')
    expect(getLiturgicalColorClasses(undefined)).toBe('bg-muted/50')
    expect(getLiturgicalColorClasses(null, 30)).toBe('bg-muted/30')
  })
})

describe('getLiturgicalCssVarValue', () => {
  it('returns CSS variable reference for valid colors', () => {
    expect(getLiturgicalCssVarValue('red')).toBe('var(--liturgy-red)')
    expect(getLiturgicalCssVarValue('green')).toBe('var(--liturgy-green)')
    expect(getLiturgicalCssVarValue('white')).toBe('var(--liturgy-white)')
  })

  it('returns fallback for unknown colors', () => {
    expect(getLiturgicalCssVarValue('blue')).toBe('var(--muted)')
    expect(getLiturgicalCssVarValue('unknown')).toBe('var(--muted)')
  })
})
