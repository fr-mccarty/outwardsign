import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocumentationPageProps {
  params: Promise<{ lang: string; slug: string[] }>
}

// Define the content directory
const CONTENT_DIR = path.join(process.cwd(), 'src/app/documentation/content')

// Helper function to read markdown file
async function getDocContent(lang: string, slug: string[]) {
  try {
    const filePath = path.join(CONTENT_DIR, lang, ...slug) + '.md'
    const fileContent = fs.readFileSync(filePath, 'utf8')

    // Simple markdown parsing - just extract title and content
    const lines = fileContent.split('\n')
    let title = ''
    let content = fileContent

    // Extract title from first # heading
    const titleMatch = fileContent.match(/^#\s+(.+)$/m)
    if (titleMatch) {
      title = titleMatch[1]
    }

    return { title, content }
  } catch (error) {
    return null
  }
}

export default async function DocumentationPage({ params }: DocumentationPageProps) {
  const { lang, slug } = await params
  const docContent = await getDocContent(lang, slug)

  if (!docContent) {
    notFound()
  }

  // Simple markdown to HTML conversion (basic)
  // This is a placeholder - you'll want to use a proper markdown library
  const renderMarkdown = (markdown: string) => {
    let html = markdown

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-foreground mt-6 mb-3">$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold text-foreground mt-8 mb-4">$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-foreground mb-6">$1</h1>')

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')

    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$2</code></pre>')

    // Inline code
    html = html.replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')

    // Links
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')

    // Lists
    html = html.replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>')
    html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-2 my-4">$&</ul>')

    // Paragraphs
    html = html.replace(/^(?!<[h|u|p|l]|```)(.+)$/gm, '<p class="text-foreground my-4">$1</p>')

    return html
  }

  const htmlContent = renderMarkdown(docContent.content)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/documentation" className="hover:text-foreground">
          Documentation
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/documentation/${lang}`} className="hover:text-foreground">
          {lang === 'en' ? 'English' : 'Español'}
        </Link>
        {slug.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            <span className={index === slug.length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground'}>
              {segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
          </div>
        ))}
      </nav>

      {/* Content */}
      <Card>
        <CardContent className="p-8">
          <article
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div>
          {/* Previous page link - can be enhanced */}
        </div>
        <div>
          {/* Next page link - can be enhanced */}
        </div>
      </div>
    </div>
  )
}

// Generate static params for known documentation pages
export async function generateStaticParams() {
  // This will be expanded as you add more pages
  const pages = [
    { lang: 'en', slug: ['getting-started', 'introduction'] },
    { lang: 'en', slug: ['getting-started', 'quick-start'] },
    { lang: 'en', slug: ['user-guides', 'staff-guide'] },
    { lang: 'en', slug: ['features', 'weddings'] },
    { lang: 'es', slug: ['getting-started', 'introduction'] },
    { lang: 'es', slug: ['getting-started', 'quick-start'] },
    { lang: 'es', slug: ['user-guides', 'staff-guide'] },
    { lang: 'es', slug: ['features', 'weddings'] },
  ]

  return pages
}
