/**
 * Unit tests for Petition Context Utilities
 *
 * Tests JSON parsing and context extraction functions.
 */

import { describe, it, expect } from 'vitest'
import {
  getPetitionTextFromContext,
  parseContextData,
} from '@/lib/petition-context-utils'

// ============================================================================
// getPetitionTextFromContext
// ============================================================================

describe('getPetitionTextFromContext', () => {
  it('returns empty string for empty input', () => {
    expect(getPetitionTextFromContext('')).toBe('')
    expect(getPetitionTextFromContext('   ')).toBe('')
  })

  it('returns simple text as-is', () => {
    expect(getPetitionTextFromContext('For the sick')).toBe('For the sick')
    expect(getPetitionTextFromContext('Multiple line\npetition')).toBe('Multiple line\npetition')
  })

  it('returns empty for JSON objects', () => {
    const json = JSON.stringify({ name: 'Test', details: 'Details' })
    expect(getPetitionTextFromContext(json)).toBe('')
  })

  it('handles JSON arrays by returning empty', () => {
    const json = JSON.stringify(['item1', 'item2'])
    expect(getPetitionTextFromContext(json)).toBe('')
  })

  it('handles invalid JSON as simple text', () => {
    expect(getPetitionTextFromContext('Not {valid} JSON')).toBe('Not {valid} JSON')
  })
})

// ============================================================================
// parseContextData
// ============================================================================

describe('parseContextData', () => {
  it('returns null for empty input', () => {
    expect(parseContextData('')).toBe(null)
    expect(parseContextData('   ')).toBe(null)
  })

  it('returns null for invalid JSON', () => {
    expect(parseContextData('not json')).toBe(null)
    expect(parseContextData('{invalid}')).toBe(null)
  })

  it('returns null for missing required name field', () => {
    expect(parseContextData(JSON.stringify({ details: 'test' }))).toBe(null)
    expect(parseContextData(JSON.stringify({ name: '' }))).toBe(null)
    expect(parseContextData(JSON.stringify({ name: '   ' }))).toBe(null)
  })

  it('parses valid context data', () => {
    const input = JSON.stringify({
      name: 'Test Parish',
      details: 'Some details',
    })
    const result = parseContextData(input)

    expect(result).not.toBe(null)
    expect(result?.name).toBe('Test Parish')
    expect(result?.details).toBe('Some details')
  })

  it('provides defaults for missing optional fields', () => {
    const input = JSON.stringify({ name: 'Test Parish' })
    const result = parseContextData(input)

    expect(result).not.toBe(null)
    expect(result?.description).toBe('')
    expect(result?.details).toBe('')
    expect(result?.sacraments_received).toEqual([])
    expect(result?.deaths_this_week).toEqual([])
    expect(result?.sick_members).toEqual([])
    expect(result?.special_petitions).toEqual([])
    expect(result?.default_petition_text).toBe('')
  })

  it('parses arrays correctly', () => {
    const input = JSON.stringify({
      name: 'Test Parish',
      sacraments_received: [{ name: 'John', details: 'Baptism' }],
      deaths_this_week: [{ name: 'Mary' }],
      sick_members: [{ name: 'Bob', details: 'Surgery' }],
      special_petitions: [{ name: 'Peace' }],
    })
    const result = parseContextData(input)

    expect(result?.sacraments_received).toHaveLength(1)
    expect(result?.sacraments_received[0].name).toBe('John')
    expect(result?.deaths_this_week).toHaveLength(1)
    expect(result?.sick_members).toHaveLength(1)
    expect(result?.special_petitions).toHaveLength(1)
  })

  it('handles non-array values for array fields', () => {
    const input = JSON.stringify({
      name: 'Test Parish',
      sacraments_received: 'not an array',
      deaths_this_week: null,
    })
    const result = parseContextData(input)

    expect(result?.sacraments_received).toEqual([])
    expect(result?.deaths_this_week).toEqual([])
  })
})
