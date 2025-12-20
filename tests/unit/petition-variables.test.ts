/**
 * Unit tests for Petition Variables
 *
 * Tests gender-based pronoun substitution and variable replacement in templates.
 */

import { describe, it, expect } from 'vitest'
import {
  replaceVariables,
  extractVariables,
  hasVariables,
  getMissingVariables,
  type PetitionVariables,
} from '@/lib/utils/petition-variables'

// ============================================================================
// extractVariables
// ============================================================================

describe('extractVariables', () => {
  it('extracts simple variables', () => {
    const result = extractVariables('Hello {{name}}, welcome to {{place}}')
    expect(result).toEqual(['name', 'place'])
  })

  it('extracts variables with underscores', () => {
    const result = extractVariables('For {{deceased_name}} and {{family_name}}')
    expect(result).toEqual(['deceased_name', 'family_name'])
  })

  it('returns empty array for no variables', () => {
    expect(extractVariables('No variables here')).toEqual([])
    expect(extractVariables('')).toEqual([])
  })

  it('extracts duplicate variables', () => {
    const result = extractVariables('{{name}} and {{name}} again')
    expect(result).toEqual(['name', 'name'])
  })
})

// ============================================================================
// hasVariables
// ============================================================================

describe('hasVariables', () => {
  it('returns true when variables present', () => {
    expect(hasVariables('Hello {{name}}')).toBe(true)
    expect(hasVariables('{{a}} and {{b}}')).toBe(true)
  })

  it('returns false when no variables', () => {
    expect(hasVariables('No variables here')).toBe(false)
    expect(hasVariables('')).toBe(false)
    expect(hasVariables('Just some { curly } braces')).toBe(false)
  })
})

// ============================================================================
// getMissingVariables
// ============================================================================

describe('getMissingVariables', () => {
  it('finds missing variables', () => {
    const template = '{{name}} and {{age}} and {{city}}'
    const variables: PetitionVariables = { name: 'John', age: '30' }
    expect(getMissingVariables(template, variables)).toEqual(['city'])
  })

  it('returns empty array when all provided', () => {
    const template = '{{name}} is {{age}}'
    const variables: PetitionVariables = { name: 'John', age: '30' }
    expect(getMissingVariables(template, variables)).toEqual([])
  })

  it('returns all variables when none provided', () => {
    const template = '{{a}} {{b}} {{c}}'
    const variables: PetitionVariables = {}
    expect(getMissingVariables(template, variables)).toEqual(['a', 'b', 'c'])
  })
})

// ============================================================================
// replaceVariables - Basic Replacement
// ============================================================================

describe('replaceVariables - basic', () => {
  it('replaces simple variables', () => {
    const result = replaceVariables('Hello {{name}}!', { name: 'John' })
    expect(result).toBe('Hello John!')
  })

  it('replaces multiple variables', () => {
    const result = replaceVariables(
      'For {{deceased_name}} from {{family_name}}',
      { deceased_name: 'John Smith', family_name: 'the Smith family' }
    )
    expect(result).toBe('For John Smith from the Smith family')
  })

  it('replaces missing variables with [Name] placeholder', () => {
    const result = replaceVariables('Hello {{unknown_var}}!', {})
    expect(result).toBe('Hello [Name]!')
  })
})

// ============================================================================
// replaceVariables - English Gender Pronouns
// ============================================================================

describe('replaceVariables - English gender pronouns', () => {
  it('replaces male pronouns', () => {
    const template = 'May {{he_she}} rest in peace. We pray for {{him_her}}.'
    const result = replaceVariables(template, { gender: 'male', language: 'en' })
    expect(result).toBe('May he rest in peace. We pray for him.')
  })

  it('replaces female pronouns', () => {
    const template = 'May {{he_she}} rest in peace. We pray for {{him_her}}.'
    const result = replaceVariables(template, { gender: 'female', language: 'en' })
    expect(result).toBe('May she rest in peace. We pray for her.')
  })

  it('replaces unknown gender with they/them', () => {
    const template = 'May {{he_she}} rest in peace. We pray for {{him_her}}.'
    const result = replaceVariables(template, { gender: 'unknown', language: 'en' })
    expect(result).toBe('May they rest in peace. We pray for them.')
  })

  it('handles possessive pronouns (his/her/their)', () => {
    const template = '{{his_her}} family mourns {{his_hers}}.'

    expect(replaceVariables(template, { gender: 'male' })).toBe('his family mourns his.')
    expect(replaceVariables(template, { gender: 'female' })).toBe('her family mourns hers.')
    expect(replaceVariables(template, { gender: 'unknown' })).toBe('their family mourns theirs.')
  })

  it('handles reflexive pronouns (himself/herself/themselves)', () => {
    const template = 'May {{himself_herself}} find peace.'

    expect(replaceVariables(template, { gender: 'male' })).toBe('May himself find peace.')
    expect(replaceVariables(template, { gender: 'female' })).toBe('May herself find peace.')
    expect(replaceVariables(template, { gender: 'unknown' })).toBe('May themselves find peace.')
  })

  it('defaults to unknown gender when not specified', () => {
    const template = '{{he_she}} is remembered.'
    const result = replaceVariables(template, {})
    expect(result).toBe('they is remembered.')
  })
})

// ============================================================================
// replaceVariables - Spanish Gender Pronouns
// ============================================================================

describe('replaceVariables - Spanish gender pronouns', () => {
  it('replaces male Spanish pronouns', () => {
    const template = 'Por {{el_la}} {{difunto_difunta}}'
    const result = replaceVariables(template, { gender: 'male', language: 'es' })
    expect(result).toBe('Por el difunto')
  })

  it('replaces female Spanish pronouns', () => {
    const template = 'Por {{el_la}} {{difunto_difunta}}'
    const result = replaceVariables(template, { gender: 'female', language: 'es' })
    expect(result).toBe('Por la difunta')
  })

  it('replaces unknown Spanish gender with both forms', () => {
    const template = 'Por {{el_la}} {{difunto_difunta}}'
    const result = replaceVariables(template, { gender: 'unknown', language: 'es' })
    expect(result).toBe('Por el/la difunto/a')
  })

  it('handles Spanish articles (del/de la)', () => {
    const template = 'En memoria {{del_de_la}} {{niño_niña}}'

    expect(replaceVariables(template, { gender: 'male', language: 'es' }))
      .toBe('En memoria del niño')
    expect(replaceVariables(template, { gender: 'female', language: 'es' }))
      .toBe('En memoria de la niña')
  })

  it('handles Spanish baptism/presentation terms', () => {
    const template = '{{bautizado_bautizada}} en Cristo'

    expect(replaceVariables(template, { gender: 'male', language: 'es' }))
      .toBe('bautizado en Cristo')
    expect(replaceVariables(template, { gender: 'female', language: 'es' }))
      .toBe('bautizada en Cristo')
  })
})

// ============================================================================
// replaceVariables - Combined Variables and Pronouns
// ============================================================================

describe('replaceVariables - combined', () => {
  it('replaces both variables and pronouns', () => {
    const template = 'For {{deceased_name}}, may {{he_she}} rest in peace.'
    const result = replaceVariables(template, {
      deceased_name: 'John Smith',
      gender: 'male',
      language: 'en',
    })
    expect(result).toBe('For John Smith, may he rest in peace.')
  })

  it('handles complex funeral template', () => {
    const template = `For {{deceased_name}}, that {{he_she}} may enter eternal life.
We commend {{him_her}} to God's mercy.
May {{his_her}} soul rest in peace.`

    const result = replaceVariables(template, {
      deceased_name: 'Mary Johnson',
      gender: 'female',
      language: 'en',
    })

    expect(result).toContain('For Mary Johnson')
    expect(result).toContain('that she may enter')
    expect(result).toContain('We commend her to')
    expect(result).toContain('May her soul rest')
  })

  it('handles Spanish funeral template', () => {
    const template = 'Por {{deceased_name}}, {{el_la}} {{difunto_difunta}}'
    const result = replaceVariables(template, {
      deceased_name: 'Juan García',
      gender: 'male',
      language: 'es',
    })
    expect(result).toBe('Por Juan García, el difunto')
  })
})

// ============================================================================
// Edge Cases
// ============================================================================

describe('replaceVariables - edge cases', () => {
  it('is case insensitive for pronoun matching', () => {
    const template = '{{HE_SHE}} and {{He_She}} and {{he_she}}'
    const result = replaceVariables(template, { gender: 'male' })
    expect(result).toBe('he and he and he')
  })

  it('handles empty template', () => {
    expect(replaceVariables('', {})).toBe('')
  })

  it('handles template with no variables', () => {
    expect(replaceVariables('Just plain text', {})).toBe('Just plain text')
  })

  it('defaults to English when language not specified', () => {
    const template = '{{he_she}} is here'
    const result = replaceVariables(template, { gender: 'male' })
    expect(result).toBe('he is here')
  })
})
