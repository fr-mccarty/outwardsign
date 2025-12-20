/**
 * Unit tests for Markdown Processor
 *
 * Tests markdown parsing and custom syntax handling.
 */

import { describe, it, expect } from 'vitest'
import { parseMarkdownToHTML } from '@/lib/utils/markdown-processor'

describe('parseMarkdownToHTML', () => {
  it('converts basic markdown to HTML', () => {
    const result = parseMarkdownToHTML('**bold** and *italic*')
    expect(result).toContain('<strong>bold</strong>')
    expect(result).toContain('<em>italic</em>')
  })

  it('converts headings', () => {
    const h1 = parseMarkdownToHTML('# Heading 1')
    expect(h1).toContain('<h1')
    expect(h1).toContain('Heading 1')

    const h2 = parseMarkdownToHTML('## Heading 2')
    expect(h2).toContain('<h2')
    expect(h2).toContain('Heading 2')
  })

  it('converts lists', () => {
    const unordered = parseMarkdownToHTML('- Item 1\n- Item 2')
    expect(unordered).toContain('<ul>')
    expect(unordered).toContain('<li>')
    expect(unordered).toContain('Item 1')

    const ordered = parseMarkdownToHTML('1. First\n2. Second')
    expect(ordered).toContain('<ol>')
    expect(ordered).toContain('<li>')
  })

  it('converts line breaks', () => {
    const result = parseMarkdownToHTML('Line 1\nLine 2')
    expect(result).toContain('<br>')
  })

  it('processes custom {red}{/red} syntax', () => {
    const result = parseMarkdownToHTML('{red}Liturgical text{/red}')
    expect(result).toContain('<span style="color: #c41e3a">Liturgical text</span>')
  })

  it('handles multiple {red} sections', () => {
    const result = parseMarkdownToHTML('{red}First{/red} normal {red}Second{/red}')
    expect(result).toContain('<span style="color: #c41e3a">First</span>')
    expect(result).toContain('<span style="color: #c41e3a">Second</span>')
    expect(result).toContain('normal')
  })

  it('combines markdown and custom syntax', () => {
    const result = parseMarkdownToHTML('**Bold** and {red}red text{/red}')
    expect(result).toContain('<strong>Bold</strong>')
    expect(result).toContain('<span style="color: #c41e3a">red text</span>')
  })

  it('handles paragraphs', () => {
    const result = parseMarkdownToHTML('First paragraph\n\nSecond paragraph')
    expect(result).toContain('<p>')
  })

  it('handles empty content', () => {
    const result = parseMarkdownToHTML('')
    expect(result).toBe('')
  })
})
