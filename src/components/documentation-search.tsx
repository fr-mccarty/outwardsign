'use client'

import { useState, useEffect } from 'react'
import { Search, FileText, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DocumentationSearchProps {
  lang: 'en' | 'es'
  placeholder?: string
}

interface SearchResult {
  title: string
  slug: string[]
  excerpt: string
  url: string
}

export function DocumentationSearch({ lang, placeholder }: DocumentationSearchProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const defaultPlaceholder = lang === 'en' ? 'Search documentation...' : 'Buscar documentación...'

  // Keyboard shortcut listener - just 'K' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for 'K' key (case-insensitive)
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if ((e.key === 'k' || e.key === 'K') && !isInputField) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/documentation/search?q=${encodeURIComponent(searchQuery)}&lang=${lang}`)
        const data = await response.json()
        setSearchResults(data.results || [])
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, lang])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleResultClick = () => {
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <>
      {/* Search Button */}
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setSearchOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="flex-1 text-left">{placeholder || defaultPlaceholder}</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {lang === 'en' ? 'Search Documentation' : 'Buscar Documentación'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={placeholder || defaultPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
          </form>

          {/* Search Results */}
          <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
            {/* Loading state */}
            {isSearching && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm">
                  {lang === 'en' ? 'Searching...' : 'Buscando...'}
                </span>
              </div>
            )}

            {/* No query yet */}
            {!searchQuery && !isSearching && (
              <div className="text-sm text-muted-foreground text-center py-8">
                {lang === 'en'
                  ? 'Start typing to search the documentation'
                  : 'Comience a escribir para buscar en la documentación'}
              </div>
            )}

            {/* No results */}
            {searchQuery && !isSearching && searchResults.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                {lang === 'en'
                  ? 'No results found. Try a different search term.'
                  : 'No se encontraron resultados. Intente con otro término.'}
              </div>
            )}

            {/* Results */}
            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <Link
                    key={index}
                    href={result.url}
                    onClick={handleResultClick}
                    className="block p-4 rounded-lg border border-border hover:bg-accent hover:border-accent-foreground transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground mb-1">{result.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {result.excerpt}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {result.slug.join(' › ')}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
