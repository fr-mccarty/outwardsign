'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DocumentationSearchProps {
  lang: 'en' | 'es'
  placeholder?: string
}

export function DocumentationSearch({ lang, placeholder }: DocumentationSearchProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const defaultPlaceholder = lang === 'en' ? 'Search documentation...' : 'Buscar documentación...'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    // For now, this is a placeholder
    console.log('Searching for:', searchQuery)
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

          {/* Search Results - Placeholder */}
          <div className="mt-4 space-y-2">
            {searchQuery && (
              <div className="text-sm text-muted-foreground text-center py-8">
                {lang === 'en'
                  ? 'Search functionality coming soon...'
                  : 'Funcionalidad de búsqueda próximamente...'}
              </div>
            )}
            {!searchQuery && (
              <div className="text-sm text-muted-foreground text-center py-8">
                {lang === 'en'
                  ? 'Start typing to search the documentation'
                  : 'Comience a escribir para buscar en la documentación'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
