'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Loader2, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { getContents, type GetContentsResult } from '@/lib/actions/contents'
import { getContentTags } from '@/lib/actions/content-tags'
import type { ContentWithTags, ContentTag } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ContentPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (content: ContentWithTags) => void
  selectedContentId?: string
  defaultFilterTags?: string[] // Pre-selected tag slugs from field definition
  language?: 'en' | 'es' // Filter by language
  emptyMessage?: string
}

const PAGE_SIZE = 20

export function ContentPicker({
  open,
  onOpenChange,
  onSelect,
  selectedContentId,
  defaultFilterTags = [],
  language,
  emptyMessage = 'No content found. Try adjusting filters or add new content.',
}: ContentPickerProps) {
  const [contents, setContents] = useState<ContentWithTags[]>([])
  const [allTags, setAllTags] = useState<ContentTag[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [activeTags, setActiveTags] = useState<string[]>(defaultFilterTags)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContent, setSelectedContent] = useState<ContentWithTags | null>(null)

  // Define loadContents with useCallback BEFORE it's used in useEffect
  const loadContents = useCallback(async (
    page: number,
    tags: string[],
    search: string,
    lang?: 'en' | 'es'
  ) => {
    try {
      setLoading(true)
      const offset = (page - 1) * PAGE_SIZE
      const result: GetContentsResult = await getContents({
        tag_slugs: tags.length > 0 ? tags : undefined,
        search: search || undefined,
        language: lang,
        limit: PAGE_SIZE,
        offset,
      })
      setContents(result.items)
      setTotalCount(result.totalCount)
    } catch (error) {
      console.error('Error loading contents:', error)
      toast.error('Failed to load contents')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load tags when dialog opens
  useEffect(() => {
    if (open) {
      const loadTags = async () => {
        try {
          const tags = await getContentTags('sort_order')
          setAllTags(tags)
        } catch (error) {
          console.error('Error loading content tags:', error)
          toast.error('Failed to load content tags')
        }
      }
      loadTags()
    }
  }, [open])

  // Load contents when filters change
  useEffect(() => {
    if (open) {
      loadContents(currentPage, activeTags, searchTerm, language)
    }
  }, [open, currentPage, activeTags, searchTerm, language, loadContents])

  // Toggle tag filter
  const handleToggleTag = (tagSlug: string) => {
    setActiveTags((prev) => {
      if (prev.includes(tagSlug)) {
        return prev.filter((slug) => slug !== tagSlug)
      } else {
        return [...prev, tagSlug]
      }
    })
    setCurrentPage(1) // Reset to page 1 when filters change
  }

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle content selection
  const handleSelectContent = (content: ContentWithTags) => {
    setSelectedContent(content)
  }

  // Confirm selection
  const handleConfirmSelection = () => {
    if (selectedContent) {
      onSelect(selectedContent)
      onOpenChange(false)
    }
  }

  // Group tags by category based on sort_order ranges
  const tagsByCategory = useMemo(() => {
    const categories = {
      sacrament: allTags.filter((tag) => tag.sort_order >= 1 && tag.sort_order <= 10),
      section: allTags.filter((tag) => tag.sort_order >= 11 && tag.sort_order <= 30),
      theme: allTags.filter((tag) => tag.sort_order >= 31 && tag.sort_order <= 50),
      testament: allTags.filter((tag) => tag.sort_order >= 51 && tag.sort_order <= 60),
    }
    return categories
  }, [allTags])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-3xl max-h-[80vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Choose Content</DialogTitle>
        </DialogHeader>

        {/* Filter controls */}
        <div className="flex-shrink-0 space-y-3">
          {/* Search */}
          <div>
            <Input
              type="text"
              placeholder="Search by title or body text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tag filters - grouped by category */}
          <div className="space-y-2">
            {/* Sacrament Tags */}
            {tagsByCategory.sacrament.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">Sacrament</div>
                <div className="flex flex-wrap gap-1">
                  {tagsByCategory.sacrament.map((tag) => (
                    <Button
                      key={tag.id}
                      type="button"
                      variant={activeTags.includes(tag.slug) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleTag(tag.slug)}
                      className="h-7 text-xs"
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Section Tags */}
            {tagsByCategory.section.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">Section</div>
                <div className="flex flex-wrap gap-1">
                  {tagsByCategory.section.map((tag) => (
                    <Button
                      key={tag.id}
                      type="button"
                      variant={activeTags.includes(tag.slug) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleTag(tag.slug)}
                      className="h-7 text-xs"
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Theme Tags */}
            {tagsByCategory.theme.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">Theme</div>
                <div className="flex flex-wrap gap-1">
                  {tagsByCategory.theme.map((tag) => (
                    <Button
                      key={tag.id}
                      type="button"
                      variant={activeTags.includes(tag.slug) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleTag(tag.slug)}
                      className="h-7 text-xs"
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Testament Tags */}
            {tagsByCategory.testament.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">Testament</div>
                <div className="flex flex-wrap gap-1">
                  {tagsByCategory.testament.map((tag) => (
                    <Button
                      key={tag.id}
                      type="button"
                      variant={activeTags.includes(tag.slug) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleTag(tag.slug)}
                      className="h-7 text-xs"
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto px-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
          ) : (
            <div className="space-y-2 py-1">
              {contents.map((content) => {
                const isSelected = selectedContent?.id === content.id || selectedContentId === content.id

                return (
                  <button
                    key={content.id}
                    type="button"
                    onClick={() => handleSelectContent(content)}
                    className={cn(
                      'w-full text-left p-3 rounded-md border transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'bg-accent border-primary'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <FileText className="h-5 w-5 flex-shrink-0 mt-0.5 text-muted-foreground" />

                      {/* Content details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{content.title}</span>
                          {isSelected && (
                            <Badge variant="secondary" className="text-xs">
                              Selected
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {content.language === 'en' ? 'English' : 'Spanish'}
                          </Badge>
                        </div>

                        {content.description && (
                          <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {content.description}
                          </div>
                        )}

                        {content.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {content.tags.map((tag) => (
                              <Badge key={tag.id} variant="secondary" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer with pagination */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex-1 flex items-center justify-center gap-2">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalCount / PAGE_SIZE) || 1}
                {totalCount > 0 && ` (${totalCount} total)`}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE) || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Use This Content button */}
          <div className="flex justify-end mt-3">
            <Button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedContent}
            >
              Use This Content
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
