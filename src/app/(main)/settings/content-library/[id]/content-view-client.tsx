'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { deleteContent } from '@/lib/actions/contents'
import type { ContentWithTags } from '@/lib/types'
import { toast } from 'sonner'

interface ContentViewClientProps {
  content: ContentWithTags
}

export function ContentViewClient({ content }: ContentViewClientProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleEdit = () => {
    router.push(`/settings/content-library/${content.id}/edit`)
  }

  const handleDelete = async () => {
    try {
      await deleteContent(content.id)
      toast.success('Content deleted successfully')
      router.push('/settings/content-library')
    } catch (error) {
      console.error('Error deleting content:', error)
      toast.error('Failed to delete content')
    }
  }

  return (
    <PageContainer
      title={content.title}
      description="View liturgical content details"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Details */}
        <ContentCard>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Language</h3>
              <Badge variant="outline" className="mt-1 capitalize">
                {content.language === 'en' ? 'English' : 'Spanish'}
              </Badge>
            </div>

            {content.description && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Description</h3>
                <p className="mt-1 text-sm">{content.description}</p>
              </div>
            )}

            {content.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Tags</h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  {content.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ContentCard>

        {/* Content Body */}
        <ContentCard>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Content</h3>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm">{content.body}</pre>
            </div>
          </div>
        </ContentCard>

        {/* Metadata */}
        <ContentCard>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <h3 className="font-semibold text-muted-foreground">Created</h3>
              <p className="mt-1">{new Date(content.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground">Last Updated</h3>
              <p className="mt-1">{new Date(content.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </ContentCard>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Content?"
        description={`Are you sure you want to delete "${content.title}"? This action cannot be undone. Note: This will affect all events that reference this content.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </PageContainer>
  )
}
