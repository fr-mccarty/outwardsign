'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { Button } from "@/components/ui/button"
import { Plus, FileText, Edit } from "lucide-react"
import { getPetitionTemplates, deletePetitionTemplate, type PetitionContextTemplate } from '@/lib/actions/petition-templates'
import { Parish } from '@/lib/types'
import { toast } from 'sonner'
import {
  DataTable,
  DataTableHeader,
  DataTableRowActions,
} from '@/components/data-table'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'

interface ParishPetitionsSettingsClientProps {
  parish: Parish
  initialPetitionTemplates: PetitionContextTemplate[]
}

export function ParishPetitionsSettingsClient({
  parish,
  initialPetitionTemplates
}: ParishPetitionsSettingsClientProps) {
  const router = useRouter()
  const [petitionTemplates, setPetitionTemplates] = useState<PetitionContextTemplate[]>(initialPetitionTemplates)
  const [petitionSearchTerm, setPetitionSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  async function loadPetitionTemplates() {
    try {
      const templates = await getPetitionTemplates()
      setPetitionTemplates(templates)
    } catch (error) {
      console.error('Error loading petition templates:', error)
      toast.error('Failed to load petition templates')
    }
  }

  const openDeleteDialog = (templateId: string) => {
    setTemplateToDelete(templateId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return

    try {
      await deletePetitionTemplate(templateToDelete)
      toast.success('Template deleted successfully')
      setTemplateToDelete(null)
      await loadPetitionTemplates()
    } catch (error) {
      toast.error('Failed to delete template. Please try again.')
      throw error
    }
  }

  return (
    <PageContainer
      title="Petitions Settings"
      description="Manage petition templates for your liturgical celebrations"
    >
      <ContentCard>
        <div>
          <h3 className="font-semibold mb-2">Petition Templates</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Manage petition templates for your liturgical celebrations. Create custom contexts as needed.
          </p>
          <div className="space-y-4">
          <DataTableHeader
            searchValue={petitionSearchTerm}
            onSearchChange={setPetitionSearchTerm}
            searchPlaceholder="Search templates..."
            actions={
              <Button asChild size="sm">
                <Link href="/settings/petitions/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Link>
              </Button>
            }
          />

          <DataTable
            data={petitionTemplates.filter(template =>
              !petitionSearchTerm ||
              template.title.toLowerCase().includes(petitionSearchTerm.toLowerCase()) ||
              (template.description || '').toLowerCase().includes(petitionSearchTerm.toLowerCase())
            )}
            columns={[
              {
                key: 'title',
                header: 'Title',
                sortable: true,
                accessorFn: (template) => template.title,
                cell: (template) => <span className="font-medium">{template.title}</span>,
              },
              {
                key: 'description',
                header: 'Description',
                hiddenOn: 'md',
                cell: (template) => (
                  <span className="text-sm text-muted-foreground">
                    {template.description || 'No description'}
                  </span>
                ),
              },
              {
                key: 'created_at',
                header: 'Created',
                hiddenOn: 'xl',
                sortable: true,
                accessorFn: (template) => new Date(template.created_at),
                cell: (template) => {
                  const date = new Date(template.created_at)
                  const now = new Date()
                  const diffTime = Math.abs(now.getTime() - date.getTime())
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  const displayDate = diffDays < 1 ? 'Today' : diffDays === 1 ? 'Yesterday' : diffDays < 7 ? `${diffDays} days ago` : date.toLocaleDateString()
                  return <span className="text-sm text-muted-foreground">{displayDate}</span>
                },
              },
              {
                key: 'actions',
                header: 'Actions',
                headerClassName: 'text-center',
                className: 'text-center',
                cell: (template) => (
                  <DataTableRowActions
                    row={template}
                    variant="hybrid"
                    customActions={[
                      {
                        label: "Edit",
                        icon: <Edit className="h-4 w-4" />,
                        onClick: (row) => router.push(`/settings/petitions/${row.id}`)
                      }
                    ]}
                    onDelete={(row) => openDeleteDialog(row.id)}
                  />
                ),
              },
            ]}
            keyExtractor={(template) => template.id}
            emptyState={{
              icon: <FileText className="h-12 w-12 text-muted-foreground" />,
              title: petitionSearchTerm ? 'No templates found' : 'No templates yet',
              description: petitionSearchTerm
                ? 'No templates found matching your search.'
                : 'No templates yet. Create your first template!',
              action: !petitionSearchTerm && (
                <Button asChild>
                  <Link href="/settings/petitions/create">Create Template</Link>
                </Button>
              ),
            }}
          />

          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDeleteTemplate}
            title="Delete Template"
            itemName={petitionTemplates.find(t => t.id === templateToDelete)?.title}
          />
          </div>
        </div>
      </ContentCard>
    </PageContainer>
  )
}
