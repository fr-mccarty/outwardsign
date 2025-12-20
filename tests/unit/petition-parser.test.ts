/**
 * Unit tests for Petition Parser
 *
 * Tests parsing and formatting of petition text.
 */

import { describe, it, expect } from 'vitest'
import { parsePetitions, formatPetitionsForStorage } from '@/lib/utils/petition-parser'

describe('parsePetitions', () => {
  it('parses multi-line text into petitions', () => {
    const text = 'For the sick\nFor the deceased\nFor peace'
    const result = parsePetitions(text)

    expect(result).toHaveLength(3)
    expect(result[0].text).toBe('For the sick')
    expect(result[1].text).toBe('For the deceased')
    expect(result[2].text).toBe('For peace')
  })

  it('generates unique IDs for each petition', () => {
    const text = 'Petition 1\nPetition 2'
    const result = parsePetitions(text)

    expect(result[0].id).toBeDefined()
    expect(result[1].id).toBeDefined()
    expect(result[0].id).not.toBe(result[1].id)
  })

  it('skips empty lines', () => {
    const text = 'First\n\nSecond\n\n\nThird'
    const result = parsePetitions(text)

    expect(result).toHaveLength(3)
    expect(result[0].text).toBe('First')
    expect(result[1].text).toBe('Second')
    expect(result[2].text).toBe('Third')
  })

  it('trims whitespace from lines', () => {
    const text = '  First  \n  Second  '
    const result = parsePetitions(text)

    expect(result[0].text).toBe('First')
    expect(result[1].text).toBe('Second')
  })

  it('handles null/undefined/empty input', () => {
    expect(parsePetitions(null)).toEqual([])
    expect(parsePetitions(undefined)).toEqual([])
    expect(parsePetitions('')).toEqual([])
    expect(parsePetitions('   ')).toEqual([])
  })

  it('handles single petition', () => {
    const result = parsePetitions('Single petition')
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Single petition')
  })
})

describe('formatPetitionsForStorage', () => {
  it('formats petitions into newline-separated text', () => {
    const petitions = [
      { id: '1', text: 'For the sick' },
      { id: '2', text: 'For the deceased' },
      { id: '3', text: 'For peace' }
    ]
    expect(formatPetitionsForStorage(petitions)).toBe('For the sick\nFor the deceased\nFor peace')
  })

  it('trims whitespace from petition text', () => {
    const petitions = [
      { id: '1', text: '  First  ' },
      { id: '2', text: '  Second  ' }
    ]
    expect(formatPetitionsForStorage(petitions)).toBe('First\nSecond')
  })

  it('filters out empty petitions', () => {
    const petitions = [
      { id: '1', text: 'Valid' },
      { id: '2', text: '' },
      { id: '3', text: '   ' },
      { id: '4', text: 'Also valid' }
    ]
    expect(formatPetitionsForStorage(petitions)).toBe('Valid\nAlso valid')
  })

  it('handles empty array', () => {
    expect(formatPetitionsForStorage([])).toBe('')
  })

  it('roundtrips correctly', () => {
    const originalText = 'Petition 1\nPetition 2\nPetition 3'
    const parsed = parsePetitions(originalText)
    const formatted = formatPetitionsForStorage(parsed)
    expect(formatted).toBe(originalText)
  })
})
