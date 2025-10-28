'use client'

import { useEffect, useState, useCallback } from 'react'
import { getAnnouncementTemplates, deleteAnnouncementTemplate } from '@/lib/actions/announcements'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from 'next/link'
import { FileText, Plus, Edit, Trash2 } from 'lucide-react'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { AnnouncementTemplate } from '@/lib/actions/announcements'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  DataTable,
  DataTableColumn,
  DataTableHeader,
  DataTableRowActions,
} from '@/components/data-table'
import { DeleteRowDialog } from '@/components/delete-row-dialog'

export default function AnnouncementTemplatesPage() {
  const [templates, setTemplates] = useState<AnnouncementTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null)
  const { setBreadcrumbs } = useBreadcrumbs()
  const router = useRouter()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Announcements", href: "/announcements" },
      { label: "Templates" }
    ])
  }, [setBreadcrumbs])

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    try {
      // We'll need to get the parish ID - for now, we'll get user's selected parish
      const result = await getAnnouncementTemplates()
      setTemplates(result.templates)
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const openDeleteDialog = (templateId: number) => {
    setTemplateToDelete(templateId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!templateToDelete) return
    
    try {
      await deleteAnnouncementTemplate(templateToDelete)
      toast.success("Template deleted successfully")
      await loadTemplates()
      setTemplateToDelete(null)
    } catch (error) {
      toast.error("Failed to delete template. Please try again.")
      throw error
    }
  }

  const getTemplateById = (templateId: number) => {
    return templates.find(t => t.id === templateId)
  }

  const columns: DataTableColumn<AnnouncementTemplate>[] = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      accessorFn: (template) => template.title,
      cell: (template) => (
        <span className="font-medium">{template.title}</span>
      ),
    },
    {
      key: "text",
      header: "Content Preview",
      sortable: false,
      hiddenOn: "sm",
      accessorFn: (template) => template.text,
      cell: (template) => (
        <div className="max-w-xs">
          <span className="text-muted-foreground line-clamp-2 text-sm">
            {template.text.length > 60 
              ? `${template.text.substring(0, 60)}...` 
              : template.text
            }
          </span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      hiddenOn: "md",
      sortable: true,
      accessorFn: (template) => new Date(template.created_at),
      cell: (template) => new Date(template.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-center",
      className: "text-center",
      cell: (template) => (
        <DataTableRowActions
          row={template}
          variant="hybrid"
          onDelete={(row) => openDeleteDialog(row.id)}
          customActions={[
            {
              label: "Edit",
              icon: <Edit className="h-4 w-4" />,
              onClick: (row) => router.push(`/announcements/templates/${row.id}/edit`),
              variant: "ghost",
            },
          ]}
        />
      ),
    },
  ]

  if (loading) {
    return (
      <PageContainer 
        title="Announcement Templates" 
        description="Manage reusable announcement templates"
        maxWidth="6xl"
      >
        <Loading variant="skeleton-table" />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Announcement Templates" 
      description="Create and manage reusable text snippets for announcements"
      maxWidth="6xl"
    >
      <div className="space-y-4">
        <DataTableHeader
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Search templates..."
          actions={
            <Button asChild>
              <Link href="/announcements/templates/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Link>
            </Button>
          }
        />

        <DataTable
          data={templates}
          columns={columns}
          keyExtractor={(template) => template.id.toString()}
          onRowClick={(template) => router.push(`/announcements/templates/${template.id}/edit`)}
          emptyState={{
            icon: <FileText className="h-12 w-12 mx-auto text-muted-foreground" />,
            title: "No templates yet",
            description: "Create your first announcement template to get started",
            action: (
              <Button asChild>
                <Link href="/announcements/templates/create">Create Template</Link>
              </Button>
            ),
          }}
        />
      </div>

      <DeleteRowDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Template"
        itemName={getTemplateById(templateToDelete || 0)?.title || 'this template'}
      />
    </PageContainer>
  )
}