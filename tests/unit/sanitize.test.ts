/**
 * Unit tests for sanitization utility
 *
 * Tests the sanitize functions that strip HTML while preserving:
 * - Markdown syntax
 * - Custom {red}{/red} liturgical syntax
 * - {{placeholder}} field syntax
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeTextInput,
  sanitizeRichText,
  sanitizeFieldValues,
  sanitizeContentBody,
  sanitizeSectionContent
} from '@/lib/utils/sanitize'

describe('sanitizeTextInput', () => {
  it('strips all HTML tags', () => {
    expect(sanitizeTextInput('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello')
    expect(sanitizeTextInput('<div>Content</div>')).toBe('Content')
    expect(sanitizeTextInput('<span class="test">Text</span>')).toBe('Text')
    expect(sanitizeTextInput('<b>Bold</b> and <i>italic</i>')).toBe('Bold and italic')
  })

  it('handles null/undefined/empty inputs', () => {
    expect(sanitizeTextInput(null)).toBe('')
    expect(sanitizeTextInput(undefined)).toBe('')
    expect(sanitizeTextInput('')).toBe('')
    expect(sanitizeTextInput('  ')).toBe('')
  })

  it('trims whitespace', () => {
    expect(sanitizeTextInput('  Hello World  ')).toBe('Hello World')
  })
})

describe('sanitizeRichText', () => {
  it('strips HTML tags while preserving markdown', () => {
    const input = '<div>**Bold** and *italic*</div>'
    const result = sanitizeRichText(input)
    expect(result).toBe('**Bold** and *italic*')
    expect(result).toContain('**Bold**')
    expect(result).toContain('*italic*')
  })

  it('preserves {red}{/red} custom syntax', () => {
    const input = '<span>{red}Liturgical text{/red}</span>'
    expect(sanitizeRichText(input)).toBe('{red}Liturgical text{/red}')

    const multiline = '{red}Line 1\nLine 2{/red}'
    expect(sanitizeRichText(multiline)).toBe('{red}Line 1\nLine 2{/red}')
  })

  it('preserves {{placeholder}} syntax', () => {
    // Simple placeholder
    expect(sanitizeRichText('<p>{{bride_name}}</p>')).toBe('{{bride_name}}')

    // Dot notation
    expect(sanitizeRichText('<div>{{presider.full_name}}</div>')).toBe('{{presider.full_name}}')

    // Pipe syntax for gender
    expect(sanitizeRichText('<span>{{deceased.sex | him | her}}</span>')).toBe('{{deceased.sex | him | her}}')

    // Multiple placeholders
    const multi = '<div>{{bride.full_name}} and {{groom.full_name}}</div>'
    expect(sanitizeRichText(multi)).toBe('{{bride.full_name}} and {{groom.full_name}}')
  })

  it('handles complex mixed content', () => {
    const input = `<div class="section">
      # Welcome
      <script>alert('xss')</script>
      {red}Lord, hear our prayer.{/red}

      **{{presider.full_name}}** will preside.
      {{parish.name}} welcomes you.
    </div>`

    const result = sanitizeRichText(input)

    // Should strip HTML
    expect(result).not.toContain('<div')
    expect(result).not.toContain('<script>')

    // Should preserve markdown
    expect(result).toContain('# Welcome')
    expect(result).toContain('**{{presider.full_name}}**')

    // Should preserve custom syntax
    expect(result).toContain('{red}Lord, hear our prayer.{/red}')
    expect(result).toContain('{{parish.name}}')
  })

  it('handles null/undefined/empty inputs', () => {
    expect(sanitizeRichText(null)).toBe('')
    expect(sanitizeRichText(undefined)).toBe('')
    expect(sanitizeRichText('')).toBe('')
  })
})

describe('sanitizeFieldValues', () => {
  const fieldDefinitions = [
    { property_name: 'name', type: 'text' },
    { property_name: 'notes', type: 'rich_text' },
    { property_name: 'bride', type: 'person' },
    { property_name: 'intention', type: 'mass-intention' }
  ]

  it('sanitizes text fields with plain sanitization', () => {
    const values = { name: '<b>John</b> Smith', bride: 'uuid-123' }
    const result = sanitizeFieldValues(values, fieldDefinitions)
    expect(result.name).toBe('John Smith')
    expect(result.bride).toBe('uuid-123') // UUID unchanged
  })

  it('sanitizes rich_text fields preserving markdown', () => {
    const values = { notes: '<div>**Important**: {red}Rubric{/red}</div>' }
    const result = sanitizeFieldValues(values, fieldDefinitions)
    expect(result.notes).toBe('**Important**: {red}Rubric{/red}')
  })

  it('sanitizes mass-intention fields as rich text', () => {
    const values = { intention: '<script>bad</script>For {{deceased.full_name}}' }
    const result = sanitizeFieldValues(values, fieldDefinitions)
    expect(result.intention).toBe('badFor {{deceased.full_name}}')
  })

  it('ignores non-text field types', () => {
    const values = { bride: 'uuid-bride-123', name: 'Test' }
    const result = sanitizeFieldValues(values, fieldDefinitions)
    expect(result.bride).toBe('uuid-bride-123')
  })

  it('handles empty/null field values', () => {
    expect(sanitizeFieldValues({}, fieldDefinitions)).toEqual({})
    expect(sanitizeFieldValues(null as unknown as Record<string, unknown>, fieldDefinitions)).toEqual({})
  })
})

describe('wrapper functions', () => {
  it('sanitizeContentBody works like sanitizeRichText', () => {
    const input = '<div>{red}Test{/red}</div>'
    expect(sanitizeContentBody(input)).toBe('{red}Test{/red}')
    expect(sanitizeContentBody(null)).toBe('')
  })

  it('sanitizeSectionContent works like sanitizeRichText', () => {
    const input = '<span>{{field}} content</span>'
    expect(sanitizeSectionContent(input)).toBe('{{field}} content')
    expect(sanitizeSectionContent(undefined)).toBe('')
  })
})
