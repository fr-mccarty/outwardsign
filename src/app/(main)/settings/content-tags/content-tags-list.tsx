'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Tag, Trash2, Edit } from 'lucide-react'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { deleteContentTag } from '@/lib/actions/content-tags'
import type { ContentTagWithUsageCount } from '@/lib/types'
import { toast } from 'sonner'

interface ContentTagsListProps {
  initialTags: ContentTagWithUsageCount[]
}

export function ContentTagsList({ initialTags }: ContentTagsListProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<ContentTagWithUsageCount | null>(null)

  const handleCreateClick = () => {
    router.push('/settings/content-tags/create')
  }

  const handleEditClick = (id: string) => {
    router.push(`/settings/content-tags/${id}/edit`)
  }

  const handleDeleteClick = (tag: ContentTagWithUsageCount) => {
    if (tag.usage_count > 0) {
      toast.error(`Cannot delete tag "${tag.name}" because it is assigned to ${tag.usage_count} content item(s)`)
      return
    }
    setTagToDelete(tag)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!tagToDelete) return

    try {
      await deleteContentTag(tagToDelete.id)
      toast.success('Tag deleted successfully')
      setDeleteDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting tag:', error)
      toast.error(error.message || 'Failed to delete tag')
    }
  }

  // Group tags by category based on sort_order
  const sacramentTags = initialTags.filter((tag) => tag.sort_order >= 1 && tag.sort_order <= 10)
  const sectionTags = initialTags.filter((tag) => tag.sort_order >= 11 && tag.sort_order <= 30)
  const themeTags = initialTags.filter((tag) => tag.sort_order >= 31 && tag.sort_order <= 50)
  const testamentTags = initialTags.filter((tag) => tag.sort_order >= 51 && tag.sort_order <= 60)

  const renderTagGroup = (title: string, tags: ContentTagWithUsageCount[]) => {
    if (tags.length === 0) return null

    return (
      <div key={title}>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">{title}</h3>
        <div className="grid gap-2">
          {tags.map((tag) => (
            <ContentCard key={tag.id} className="p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tag.name}</span>
                      <span className="text-xs text-muted-foreground">({tag.slug})</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Used in {tag.usage_count} content item{tag.usage_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(tag.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(tag)}
                    disabled={tag.usage_count > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </ContentCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <PageContainer
      title="Content Tags"
      description="Manage tags for organizing liturgical content (Admin only)"
      actions={
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Create Tag
        </Button>
      }
    >
      {initialTags.length === 0 ? (
        <ContentCard>
          <div className="text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No tags found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started by creating your first tag
            </p>
            <Button onClick={handleCreateClick} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Tag
            </Button>
          </div>
        </ContentCard>
      ) : (
        <div className="space-y-6">
          {renderTagGroup('Sacrament', sacramentTags)}
          {renderTagGroup('Section', sectionTags)}
          {renderTagGroup('Theme', themeTags)}
          {renderTagGroup('Testament', testamentTags)}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Tag?"
        description={
          tagToDelete
            ? `Are you sure you want to delete the tag "${tagToDelete.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </PageContainer>
  )
}
