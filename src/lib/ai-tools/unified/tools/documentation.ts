/**
 * Documentation Tools
 *
 * Tools for searching user documentation/help articles.
 * Used by: Admin, Staff Chat
 */

import type { CategorizedTool } from '../types'
import fs from 'fs'
import path from 'path'

// ============================================================================
// DOCUMENTATION SEARCH
// ============================================================================

const searchDocumentation: CategorizedTool = {
  name: 'search_documentation',
  description:
    'Search the user documentation/help articles for information about how to use Outward Sign features. Use when users ask "how do I", "where can I find", "help with", or general questions about using the application.',
  category: 'documentation',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query to find relevant documentation',
      },
      language: {
        type: 'string',
        enum: ['en', 'es'],
        description: 'Language for documentation (default: en)',
      },
    },
    required: ['query'],
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff'],
  async execute(args) {
    const query = args.query as string
    const lang = (args.language as string) || 'en'
    const CONTENT_DIR = path.join(process.cwd(), 'src/app/documentation/content')
    const langDir = path.join(CONTENT_DIR, lang)

    // Helper to recursively find all markdown files
    function getAllMarkdownFiles(dir: string): string[] {
      const files: string[] = []
      if (!fs.existsSync(dir)) return files
      const items = fs.readdirSync(dir)
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          files.push(...getAllMarkdownFiles(fullPath))
        } else if (item.endsWith('.md')) {
          files.push(fullPath)
        }
      }
      return files
    }

    // Extract title from markdown content
    function extractTitle(content: string): string {
      const titleMatch = content.match(/^#\s+(.+)$/m)
      return titleMatch ? titleMatch[1] : 'Untitled'
    }

    // Create excerpt around matching text
    function createExcerpt(content: string, searchQuery: string): string {
      const lowerContent = content.toLowerCase()
      const lowerQuery = searchQuery.toLowerCase()
      const index = lowerContent.indexOf(lowerQuery)
      if (index === -1) {
        return content.substring(0, 200).trim() + '...'
      }
      const start = Math.max(0, index - 100)
      const end = Math.min(content.length, index + searchQuery.length + 100)
      const excerpt = content.substring(start, end).trim()
      return (start > 0 ? '...' : '') + excerpt + (end < content.length ? '...' : '')
    }

    if (!fs.existsSync(langDir)) {
      return {
        success: true,
        count: 0,
        data: [],
        message: `No documentation found for language: ${lang}`,
      }
    }

    const files = getAllMarkdownFiles(langDir)
    const results: Array<{
      title: string
      path: string
      excerpt: string
      relevance: number
    }> = []

    const queryWords = query.toLowerCase().split(/\s+/)

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      const lowerContent = content.toLowerCase()

      // Calculate relevance score
      let relevance = 0
      for (const word of queryWords) {
        if (lowerContent.includes(word)) {
          relevance += 1
          // Bonus for title matches
          const title = extractTitle(content).toLowerCase()
          if (title.includes(word)) {
            relevance += 2
          }
        }
      }

      if (relevance > 0) {
        const relativePath = file.replace(langDir, '').replace(/\.md$/, '').replace(/^\//, '')
        results.push({
          title: extractTitle(content),
          path: `/documentation/${lang}/${relativePath}`,
          excerpt: createExcerpt(content, query),
          relevance,
        })
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance)

    // Return top results
    const topResults = results.slice(0, 5)

    return {
      success: true,
      count: topResults.length,
      data: topResults.map(({ title, path, excerpt }) => ({ title, path, excerpt })),
    }
  },
}

// ============================================================================
// EXPORTS
// ============================================================================

export const documentationTools: CategorizedTool[] = [searchDocumentation]
