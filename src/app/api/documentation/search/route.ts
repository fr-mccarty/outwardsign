import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'src/app/documentation/content')

interface SearchResult {
  title: string
  slug: string[]
  excerpt: string
  url: string
}

// Helper to recursively find all markdown files
function getAllMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath, baseDir))
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
function createExcerpt(content: string, query: string): string {
  const lowerContent = content.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerContent.indexOf(lowerQuery)

  if (index === -1) {
    // If query not found in content, return first 150 chars
    return content.substring(0, 150).trim() + '...'
  }

  // Get 75 chars before and after the match
  const start = Math.max(0, index - 75)
  const end = Math.min(content.length, index + query.length + 75)
  const excerpt = content.substring(start, end).trim()

  return (start > 0 ? '...' : '') + excerpt + (end < content.length ? '...' : '')
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const lang = searchParams.get('lang') || 'en'

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const langDir = path.join(CONTENT_DIR, lang)

  // Check if language directory exists
  if (!fs.existsSync(langDir)) {
    return NextResponse.json({ results: [] })
  }

  const markdownFiles = getAllMarkdownFiles(langDir)
  const results: SearchResult[] = []
  const queryLower = query.toLowerCase()

  for (const filePath of markdownFiles) {
    const content = fs.readFileSync(filePath, 'utf8')
    const contentLower = content.toLowerCase()

    // Check if query matches content
    if (contentLower.includes(queryLower)) {
      const title = extractTitle(content)
      const relativePath = path.relative(langDir, filePath)
      const slug = relativePath.replace('.md', '').split(path.sep)
      const url = `/documentation/${lang}/${slug.join('/')}`
      const excerpt = createExcerpt(content, query)

      results.push({
        title,
        slug,
        excerpt,
        url,
      })
    }
  }

  // Sort results by relevance (title matches first)
  results.sort((a, b) => {
    const aTitleMatch = a.title.toLowerCase().includes(queryLower)
    const bTitleMatch = b.title.toLowerCase().includes(queryLower)

    if (aTitleMatch && !bTitleMatch) return -1
    if (!aTitleMatch && bTitleMatch) return 1
    return 0
  })

  // Limit to 10 results
  return NextResponse.json({ results: results.slice(0, 10) })
}
