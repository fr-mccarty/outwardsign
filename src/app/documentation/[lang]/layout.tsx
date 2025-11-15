import { ReactNode } from 'react'
import { DocumentationSidebar } from '@/components/documentation-sidebar'
import { DocumentationSearch } from '@/components/documentation-search'
import { DocumentationLanguageSelector } from '@/components/documentation-language-selector'

interface DocumentationLangLayoutProps {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }]
}

export default async function DocumentationLangLayout({
  children,
  params,
}: DocumentationLangLayoutProps) {
  const { lang } = await params as { lang: 'en' | 'es' }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <DocumentationSidebar lang={lang} />

      {/* Main Content Area */}
      <div className="lg:pl-80">
        {/* Mobile header spacer */}
        <div className="h-16 lg:hidden" />

        {/* Content */}
        <main className="min-h-screen">
          {/* Search Bar */}
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="container mx-auto px-4 py-4 max-w-5xl">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <DocumentationSearch lang={lang} />
                </div>
                <DocumentationLanguageSelector lang={lang} />
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
