/**
 * Unit tests for cn (className) Utility
 *
 * Tests the class name merging utility that combines clsx + tailwind-merge.
 */

import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

// ============================================================================
// Basic Functionality
// ============================================================================

describe('cn utility', () => {
  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('')
  })

  it('returns single class unchanged', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('joins multiple classes', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles undefined values', () => {
    expect(cn('px-4', undefined, 'py-2')).toBe('px-4 py-2')
  })

  it('handles null values', () => {
    expect(cn('px-4', null, 'py-2')).toBe('px-4 py-2')
  })

  it('handles false values', () => {
    expect(cn('px-4', false, 'py-2')).toBe('px-4 py-2')
  })

  it('handles empty string values', () => {
    expect(cn('px-4', '', 'py-2')).toBe('px-4 py-2')
  })
})

// ============================================================================
// Conditional Classes (clsx behavior)
// ============================================================================

describe('cn with conditionals', () => {
  it('handles conditional object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })

  it('handles array syntax', () => {
    expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2')
  })

  it('handles mixed syntax', () => {
    expect(cn('base-class', { 'conditional': true }, ['array-class'])).toBe('base-class conditional array-class')
  })

  it('handles ternary conditions', () => {
    const isActive = true
    expect(cn('base', isActive ? 'active' : 'inactive')).toBe('base active')

    const isInactive = false
    expect(cn('base', isInactive ? 'active' : 'inactive')).toBe('base inactive')
  })
})

// ============================================================================
// Tailwind Merge Behavior
// ============================================================================

describe('cn with tailwind-merge', () => {
  it('merges conflicting padding classes (last wins)', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8')
  })

  it('merges conflicting margin classes', () => {
    expect(cn('mt-2', 'mt-4')).toBe('mt-4')
  })

  it('merges conflicting text color classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('merges conflicting background classes', () => {
    expect(cn('bg-white', 'bg-gray-100')).toBe('bg-gray-100')
  })

  it('merges conflicting width classes', () => {
    expect(cn('w-full', 'w-1/2')).toBe('w-1/2')
  })

  it('preserves non-conflicting classes', () => {
    expect(cn('px-4', 'py-2', 'text-red-500')).toBe('px-4 py-2 text-red-500')
  })

  it('handles responsive variants correctly', () => {
    expect(cn('px-4', 'md:px-8')).toBe('px-4 md:px-8')
  })

  it('handles hover variants correctly', () => {
    expect(cn('bg-blue-500', 'hover:bg-blue-600')).toBe('bg-blue-500 hover:bg-blue-600')
  })
})

// ============================================================================
// Real-World Usage Patterns
// ============================================================================

describe('cn real-world patterns', () => {
  it('handles button variant pattern', () => {
    const baseClasses = 'px-4 py-2 rounded'
    const variantClasses = 'bg-blue-500 text-white'
    const sizeClasses = 'text-sm'

    expect(cn(baseClasses, variantClasses, sizeClasses))
      .toBe('px-4 py-2 rounded bg-blue-500 text-white text-sm')
  })

  it('handles component prop overrides', () => {
    const defaultClasses = 'px-4 py-2 bg-gray-100'
    const propsClassName = 'px-8 bg-blue-500'

    // Props should override defaults
    expect(cn(defaultClasses, propsClassName)).toBe('py-2 px-8 bg-blue-500')
  })

  it('handles disabled state classes', () => {
    const isDisabled = true
    expect(cn(
      'px-4 py-2',
      isDisabled && 'opacity-50 cursor-not-allowed'
    )).toBe('px-4 py-2 opacity-50 cursor-not-allowed')
  })
})
