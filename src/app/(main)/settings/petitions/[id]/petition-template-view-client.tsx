"use client"

import { PetitionContextTemplate, deletePetitionTemplate } from '@/lib/actions/petition-templates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { PETITION_MODULE_LABELS, PETITION_LANGUAGE_LABELS } from '@/lib/constants'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'

interface PetitionTemplateViewClientProps {
  template: PetitionContextTemplate
}

export function PetitionTemplateViewClient({ template }: PetitionTemplateViewClientProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await deletePetitionTemplate(template.id)
      toast.success('Template deleted successfully')
      router.push('/settings/petitions')
    } catch (error) {
      toast.error('Failed to delete template')
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button asChild className="flex-1">
            <Link href={`/settings/petitions/${template.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Template
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Template
          </Button>
        </CardContent>
      </Card>

      {/* Template Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Title</dt>
            <dd className="mt-1 text-sm">{template.title}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Description</dt>
            <dd className="mt-1 text-sm">{template.description || 'No description'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Module</dt>
            <dd className="mt-1 text-sm">
              {template.module
                ? PETITION_MODULE_LABELS[template.module as keyof typeof PETITION_MODULE_LABELS]?.en || template.module
                : 'All modules'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Language</dt>
            <dd className="mt-1 text-sm">
              {template.language
                ? PETITION_LANGUAGE_LABELS[template.language as keyof typeof PETITION_LANGUAGE_LABELS]?.en || template.language
                : 'English'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Created</dt>
            <dd className="mt-1 text-sm">{new Date(template.created_at).toLocaleDateString()}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Updated</dt>
            <dd className="mt-1 text-sm">{new Date(template.updated_at).toLocaleDateString()}</dd>
          </div>
        </CardContent>
      </Card>

      {/* Template Text Card */}
      <Card>
        <CardHeader>
          <CardTitle>Template Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-6 rounded-lg">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {template.context}
            </pre>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Template"
        itemName={template.title}
      />
    </div>
  )
}
