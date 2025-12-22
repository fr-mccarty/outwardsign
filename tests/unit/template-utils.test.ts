/**
 * Unit tests for Template Utilities
 *
 * Tests template variable replacement and prompt generation.
 */

import { describe, it, expect } from 'vitest'
import {
  replaceTemplateVariables,
  getTemplateVariables,
  getDefaultPromptTemplate,
  type TemplateVariables,
} from '@/lib/template-utils'
import type { CreatePetitionData } from '@/lib/types'

// ============================================================================
// replaceTemplateVariables
// ============================================================================

describe('replaceTemplateVariables', () => {
  it('replaces single variable', () => {
    const template = 'Hello {{TITLE}}'
    const variables: TemplateVariables = {
      TITLE: 'World',
      LANGUAGE: 'en',
      DETAILS: '',
      TEMPLATE_CONTENT: ''
    }
    expect(replaceTemplateVariables(template, variables)).toBe('Hello World')
  })

  it('replaces multiple variables', () => {
    const template = '{{TITLE}} in {{LANGUAGE}}'
    const variables: TemplateVariables = {
      TITLE: 'Petitions',
      LANGUAGE: 'Spanish',
      DETAILS: '',
      TEMPLATE_CONTENT: ''
    }
    expect(replaceTemplateVariables(template, variables)).toBe('Petitions in Spanish')
  })

  it('replaces all occurrences of the same variable', () => {
    const template = '{{LANGUAGE}} and {{LANGUAGE}} again'
    const variables: TemplateVariables = {
      TITLE: '',
      LANGUAGE: 'English',
      DETAILS: '',
      TEMPLATE_CONTENT: ''
    }
    expect(replaceTemplateVariables(template, variables)).toBe('English and English again')
  })

  it('replaces all four variables', () => {
    const template = '{{TITLE}}: {{DETAILS}} in {{LANGUAGE}}. Template: {{TEMPLATE_CONTENT}}'
    const variables: TemplateVariables = {
      TITLE: 'Sunday Petitions',
      LANGUAGE: 'English',
      DETAILS: 'For the sick and deceased',
      TEMPLATE_CONTENT: 'Standard template'
    }
    expect(replaceTemplateVariables(template, variables))
      .toBe('Sunday Petitions: For the sick and deceased in English. Template: Standard template')
  })

  it('leaves unknown placeholders unchanged', () => {
    const template = '{{TITLE}} and {{UNKNOWN}}'
    const variables: TemplateVariables = {
      TITLE: 'Test',
      LANGUAGE: 'en',
      DETAILS: '',
      TEMPLATE_CONTENT: ''
    }
    expect(replaceTemplateVariables(template, variables)).toBe('Test and {{UNKNOWN}}')
  })

  it('handles empty template', () => {
    const variables: TemplateVariables = {
      TITLE: 'Test',
      LANGUAGE: 'en',
      DETAILS: '',
      TEMPLATE_CONTENT: ''
    }
    expect(replaceTemplateVariables('', variables)).toBe('')
  })

  it('handles multiline templates', () => {
    const template = `Title: {{TITLE}}
Language: {{LANGUAGE}}
Details: {{DETAILS}}`
    const variables: TemplateVariables = {
      TITLE: 'Sunday Mass',
      LANGUAGE: 'Spanish',
      DETAILS: 'Parish intentions',
      TEMPLATE_CONTENT: ''
    }
    expect(replaceTemplateVariables(template, variables)).toBe(`Title: Sunday Mass
Language: Spanish
Details: Parish intentions`)
  })
})

// ============================================================================
// getTemplateVariables
// ============================================================================

describe('getTemplateVariables', () => {
  it('creates variables from petition data', () => {
    const data: CreatePetitionData = {
      title: 'Sunday Petitions',
      language: 'en',
      details: 'For the sick',
      date: '2025-01-01'
    }
    const result = getTemplateVariables(data)

    expect(result.TITLE).toBe('Sunday Petitions')
    expect(result.LANGUAGE).toBe('English')
    expect(result.DETAILS).toBe('For the sick')
    expect(result.TEMPLATE_CONTENT).toBe('')
  })

  it('includes template content when provided', () => {
    const data: CreatePetitionData = {
      title: 'Test',
      language: 'es',
      details: 'Details',
      date: '2025-01-01'
    }
    const result = getTemplateVariables(data, 'Custom template content')

    expect(result.TEMPLATE_CONTENT).toBe('Custom template content')
  })

  it('defaults template content to empty string', () => {
    const data: CreatePetitionData = {
      title: 'Test',
      language: 'en',
      details: '',
      date: '2025-01-01'
    }
    const result = getTemplateVariables(data)

    expect(result.TEMPLATE_CONTENT).toBe('')
  })

  it('handles undefined template content', () => {
    const data: CreatePetitionData = {
      title: 'Test',
      language: 'en',
      details: '',
      date: '2025-01-01'
    }
    const result = getTemplateVariables(data, undefined)

    expect(result.TEMPLATE_CONTENT).toBe('')
  })
})

// ============================================================================
// getDefaultPromptTemplate
// ============================================================================

describe('getDefaultPromptTemplate', () => {
  it('returns a non-empty template', () => {
    const template = getDefaultPromptTemplate()
    expect(template).toBeTruthy()
    expect(template.length).toBeGreaterThan(100)
  })

  it('includes LANGUAGE placeholder', () => {
    const template = getDefaultPromptTemplate()
    expect(template).toContain('{{LANGUAGE}}')
  })

  it('includes TEMPLATE_CONTENT placeholder', () => {
    const template = getDefaultPromptTemplate()
    expect(template).toContain('{{TEMPLATE_CONTENT}}')
  })

  it('includes DETAILS placeholder', () => {
    const template = getDefaultPromptTemplate()
    expect(template).toContain('{{DETAILS}}')
  })

  it('includes petition ordering instructions', () => {
    const template = getDefaultPromptTemplate()
    expect(template).toContain('Church')
    expect(template).toContain('world')
    expect(template).toContain('local community')
  })

  it('includes formatting rules', () => {
    const template = getDefaultPromptTemplate()
    expect(template).toContain('CRITICAL FORMATTING RULES')
    expect(template).toContain('DO NOT')
  })
})
