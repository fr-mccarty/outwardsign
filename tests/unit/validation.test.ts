/**
 * Unit tests for Event Type Validation System
 *
 * Tests the placeholder extraction and validation logic that ensures
 * inputs, forms, and scripts work together correctly.
 */

import { describe, it, expect } from 'vitest'
import {
  extractPlaceholdersWithDetails,
  extractPropertyNames,
  findInvalidPlaceholders,
} from '@/lib/validation/placeholder-extractor'
import {
  validateEventType,
  validateAllEventTypes,
} from '@/lib/validation/event-type-validator'
import type { EventTypeForValidation } from '@/lib/validation/validation-types'

describe('extractPlaceholdersWithDetails', () => {
  it('extracts simple placeholders', () => {
    const content = 'Hello {{bride_name}}, welcome!'
    const results = extractPlaceholdersWithDetails(content)

    expect(results).toHaveLength(1)
    expect(results[0].fullMatch).toBe('{{bride_name}}')
    expect(results[0].propertyName).toBe('bride_name')
    expect(results[0].isBuiltIn).toBe(false)
  })

  it('extracts dot notation placeholders', () => {
    const content = 'The presider is {{presider.full_name}}'
    const results = extractPlaceholdersWithDetails(content)

    expect(results).toHaveLength(1)
    expect(results[0].propertyName).toBe('presider')
    expect(results[0].isBuiltIn).toBe(false)
  })

  it('extracts gendered placeholders', () => {
    const content = 'For {{deceased.sex | him | her}}'
    const results = extractPlaceholdersWithDetails(content)

    expect(results).toHaveLength(1)
    expect(results[0].propertyName).toBe('deceased')
    expect(results[0].innerContent).toBe('deceased.sex | him | her')
  })

  it('identifies parish as built-in', () => {
    const content = 'Welcome to {{parish.name}} in {{parish.city}}'
    const results = extractPlaceholdersWithDetails(content)

    expect(results).toHaveLength(2)
    expect(results[0].isBuiltIn).toBe(true)
    expect(results[1].isBuiltIn).toBe(true)
  })

  it('handles multiple placeholders', () => {
    const content = '{{bride.full_name}} and {{groom.full_name}} at {{parish.name}}'
    const results = extractPlaceholdersWithDetails(content)

    expect(results).toHaveLength(3)
    expect(results[0].propertyName).toBe('bride')
    expect(results[1].propertyName).toBe('groom')
    expect(results[2].propertyName).toBe('parish')
  })

  it('handles null/undefined/empty inputs', () => {
    expect(extractPlaceholdersWithDetails(null)).toEqual([])
    expect(extractPlaceholdersWithDetails(undefined)).toEqual([])
    expect(extractPlaceholdersWithDetails('')).toEqual([])
  })
})

describe('extractPropertyNames', () => {
  it('returns unique property names excluding built-ins', () => {
    const content = '{{bride.full_name}} and {{bride.email}} at {{parish.name}}'
    const names = extractPropertyNames(content)

    expect(names).toEqual(['bride'])
    expect(names).not.toContain('parish')
  })

  it('handles complex content', () => {
    const content = `
      Welcome {{bride.full_name}} and {{groom.full_name}}.
      Your ceremony at {{parish.name}} will be officiated by {{presider.full_name}}.
      We wish {{bride.first_name}} and {{groom.first_name}} well.
    `
    const names = extractPropertyNames(content)

    expect(names).toEqual(['bride', 'groom', 'presider'])
  })
})

describe('findInvalidPlaceholders', () => {
  it('finds placeholders not in valid set', () => {
    const content = '{{bride.full_name}} and {{typo_field}}'
    const validNames = new Set(['bride'])
    const invalid = findInvalidPlaceholders(content, validNames)

    expect(invalid).toHaveLength(1)
    expect(invalid[0].propertyName).toBe('typo_field')
  })

  it('returns empty array when all valid', () => {
    const content = '{{bride.full_name}} at {{parish.name}}'
    const validNames = new Set(['bride'])
    const invalid = findInvalidPlaceholders(content, validNames)

    expect(invalid).toEqual([])
  })
})

describe('validateEventType', () => {
  const createEventType = (
    overrides: Partial<EventTypeForValidation> = {}
  ): EventTypeForValidation => ({
    id: 'test-id',
    name: 'Test Event',
    slug: 'test-event',
    input_field_definitions: [],
    contents: [],
    ...overrides,
  })

  it('validates clean event type', () => {
    const eventType = createEventType({
      input_field_definitions: [
        { property_name: 'bride', name: 'Bride', type: 'person' },
      ],
      contents: [
        {
          id: 'script-1',
          name: 'Program',
          sections: [{ name: 'Cover', content: 'Hello {{bride.full_name}}' }],
        },
      ],
    })

    const result = validateEventType(eventType, new Set(), new Set(), new Set())

    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
  })

  it('detects invalid placeholder', () => {
    const eventType = createEventType({
      input_field_definitions: [
        { property_name: 'bride', name: 'Bride', type: 'person' },
      ],
      contents: [
        {
          id: 'script-1',
          name: 'Program',
          sections: [{ name: 'Cover', content: 'Hello {{brdie}}' }], // typo
        },
      ],
    })

    const result = validateEventType(eventType, new Set(), new Set(), new Set())

    expect(result.isValid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toMatchObject({
      scriptName: 'Program',
      sectionName: 'Cover',
      propertyName: 'brdie',
    })
  })

  it('detects invalid filter_tag', () => {
    const eventType = createEventType({
      input_field_definitions: [
        {
          property_name: 'first_reading',
          name: 'First Reading',
          type: 'content',
          filter_tags: ['invalid-tag'],
        },
      ],
    })

    const validTags = new Set(['valid-tag'])
    const result = validateEventType(eventType, validTags, new Set(), new Set())

    expect(result.isValid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toMatchObject({
      type: 'invalid_filter_tag',
      invalidValue: 'invalid-tag',
    })
  })

  it('detects invalid list_id', () => {
    const eventType = createEventType({
      input_field_definitions: [
        {
          property_name: 'music',
          name: 'Music Selection',
          type: 'list_item',
          list_id: 'nonexistent-list',
        },
      ],
    })

    const validLists = new Set(['valid-list'])
    const result = validateEventType(eventType, new Set(), validLists, new Set())

    expect(result.isValid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toMatchObject({
      type: 'invalid_list',
      invalidValue: 'nonexistent-list',
    })
  })

  it('warns about unused fields', () => {
    const eventType = createEventType({
      input_field_definitions: [
        { property_name: 'used_field', name: 'Used', type: 'text' },
        { property_name: 'unused_field', name: 'Unused', type: 'text' },
      ],
      contents: [
        {
          id: 'script-1',
          name: 'Program',
          sections: [{ name: 'Content', content: '{{used_field}}' }],
        },
      ],
    })

    const result = validateEventType(eventType, new Set(), new Set(), new Set())

    expect(result.isValid).toBe(true) // warnings don't fail validation
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0]).toMatchObject({
      type: 'unused_field',
      propertyName: 'unused_field',
    })
  })

  it('skips spacer fields for unused check', () => {
    const eventType = createEventType({
      input_field_definitions: [
        { property_name: 'divider', name: 'Divider', type: 'spacer' },
      ],
      contents: [],
    })

    const result = validateEventType(eventType, new Set(), new Set(), new Set())

    expect(result.warnings).toHaveLength(0)
  })
})

describe('validateAllEventTypes', () => {
  it('generates summary report', () => {
    const eventTypes: EventTypeForValidation[] = [
      {
        id: '1',
        name: 'Clean',
        slug: 'clean',
        input_field_definitions: [{ property_name: 'f', name: 'F', type: 'text' }],
        contents: [{ id: 's1', name: 'S', sections: [{ name: 'C', content: '{{f}}' }] }],
      },
      {
        id: '2',
        name: 'With Error',
        slug: 'error',
        input_field_definitions: [],
        contents: [{ id: 's2', name: 'S', sections: [{ name: 'C', content: '{{bad}}' }] }],
      },
    ]

    const report = validateAllEventTypes(eventTypes, new Set(), new Set(), new Set())

    expect(report.totalEventTypes).toBe(2)
    expect(report.eventTypesWithErrors).toBe(1)
    expect(report.eventTypesClean).toBe(1)
    expect(report.allValid).toBe(false)
  })
})
