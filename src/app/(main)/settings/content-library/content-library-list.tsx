'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, FileText, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react'
import { ContentCard } from '@/components/content-card'
import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { deleteContent } from '@/lib/actions/contents'
import type { ContentWithTags, ContentTag } from '@/lib/types'
import { toast } from 'sonner'

interface ContentLibraryListProps {
  initialContents: ContentWithTags[]
  initialTotalCount: number
  initialPage: number
  allTags: ContentTag[]
}

const INITIAL_TAG_LIMIT = 10

export function ContentLibraryList({
  initialContents,
  initialTotalCount,
  initialPage,
  allTags,
}: ContentLibraryListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [language, setLanguage] = useState(searchParams.get('language') || 'all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contentToDelete, setContentToDelete] = useState<ContentWithTags | null>(null)
  const [showMoreTags, setShowMoreTags] = useState(false)

  // Parse active tags from URL
  const activeTags = useMemo(() => {
    const tagsParam = searchParams.get('tags')
    return tagsParam ? tagsParam.split(',') : []
  }, [searchParams])

  // Progressive disclosure for tags
  const visibleTags = useMemo(() => {
    if (showMoreTags) return allTags
    return allTags.slice(0, INITIAL_TAG_LIMIT)
  }, [allTags, showMoreTags])

  const hasMoreTags = allTags.length > INITIAL_TAG_LIMIT

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to page 1 when filters change
    router.push(`/settings/content-library?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    updateSearchParams('search', value)
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    updateSearchParams('language', value)
  }

  const handleToggleTag = (tagSlug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    let newTags: string[]

    if (activeTags.includes(tagSlug)) {
      newTags = activeTags.filter(slug => slug !== tagSlug)
    } else {
      newTags = [...activeTags, tagSlug]
    }

    if (newTags.length > 0) {
      params.set('tags', newTags.join(','))
    } else {
      params.delete('tags')
    }
    params.delete('page') // Reset to page 1 when filters change
    router.push(`/settings/content-library?${params.toString()}`)
  }

  const handleCreateClick = () => {
    router.push('/settings/content-library/create')
  }

  const handleEditClick = (id: string) => {
    router.push(`/settings/content-library/${id}/edit`)
  }

  const handleViewClick = (id: string) => {
    router.push(`/settings/content-library/${id}`)
  }

  const handleDeleteClick = (content: ContentWithTags) => {
    setContentToDelete(content)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!contentToDelete) return

    try {
      await deleteContent(contentToDelete.id)
      toast.success('Content deleted successfully')
      setDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error deleting content:', error)
      toast.error('Failed to delete content')
    }
  }

  const totalPages = Math.ceil(initialTotalCount / 20)
  const currentPage = initialPage

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/settings/content-library?${params.toString()}`)
  }

  return (
    <>
      {/* Search and Filter */}
      <ContentCard className="mb-6">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Input
                placeholder="Search by title or body text..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category tag filters */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleTags.map((tag) => (
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

              {/* Show more/less toggle */}
              {hasMoreTags && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMoreTags(!showMoreTags)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showMoreTags ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      +{allTags.length - INITIAL_TAG_LIMIT} more
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </ContentCard>

      {/* Content List */}
      {initialContents.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No content found"
          description={search || language !== 'all'
            ? 'Try adjusting your filters'
            : 'Get started by creating your first content'}
          action={!search && language === 'all' ? (
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Create Content
            </Button>
          ) : undefined}
        />
      ) : (
        <>
          <div className="grid gap-4 pb-6">
            {initialContents.map((content) => (
              <div
                key={content.id}
                className="hover:bg-accent/50 cursor-pointer transition-colors rounded-lg"
                onClick={() => handleViewClick(content.id)}
              >
                <ContentCard>
                  <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{content.title}</h3>
                      <Badge variant="outline" className="capitalize">
                        {content.language === 'en' ? 'English' : 'Spanish'}
                      </Badge>
                    </div>

                    {content.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {content.description}
                      </p>
                    )}

                    {content.tags && content.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {content.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(content.id)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(content)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  </div>
                </ContentCard>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center px-4 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Content?"
        description={
          contentToDelete
            ? `Are you sure you want to delete "${contentToDelete.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </>
  )
}
