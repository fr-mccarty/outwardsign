'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Trash2 } from 'lucide-react'
import { ContentCard } from '@/components/content-card'
import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { deleteTemplate } from '@/lib/actions/master-event-templates'
import type { MasterEventTemplateWithRelations } from '@/lib/types'
import { toast } from 'sonner'
import { formatDatePretty } from '@/lib/utils/formatters'
import { useTranslations } from 'next-intl'

interface EventTemplatesListProps {
  templates: MasterEventTemplateWithRelations[]
  allTemplates: MasterEventTemplateWithRelations[]
}

export function EventTemplatesList({
  templates,
  allTemplates,
}: EventTemplatesListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [eventTypeFilter, setEventTypeFilter] = useState(searchParams.get('event_type') || 'all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<MasterEventTemplateWithRelations | null>(null)

  // Get unique event types from all templates
  const eventTypes = Array.from(
    new Map(allTemplates.map(t => [t.event_type.id, t.event_type])).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/settings/event-templates?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    updateSearchParams('search', value)
  }

  const handleEventTypeChange = (value: string) => {
    setEventTypeFilter(value)
    updateSearchParams('event_type', value)
  }

  const handleViewClick = (id: string) => {
    router.push(`/settings/event-templates/${id}`)
  }

  const handleDeleteClick = (template: MasterEventTemplateWithRelations) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!templateToDelete) return

    try {
      const result = await deleteTemplate(templateToDelete.id)
      if (result.success) {
        toast.success(t('settings.templateDeletedSuccess'))
        setDeleteDialogOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || t('settings.templateDeletedError'))
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error(t('settings.templateDeletedError'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <ContentCard>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input
              placeholder={t('settings.searchTemplates')}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div>
            <Select value={eventTypeFilter} onValueChange={handleEventTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.filterByEventType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('settings.allEventTypes')}</SelectItem>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType.id} value={eventType.id}>
                    {eventType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ContentCard>

      {/* Template List */}
      {templates.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title={t('settings.noTemplatesFound')}
          description={
            search || eventTypeFilter !== 'all'
              ? t('settings.tryAdjustingFilters')
              : t('settings.noTemplatesCreated')
          }
        />
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="hover:bg-accent/50 cursor-pointer transition-colors rounded-lg"
              onClick={() => handleViewClick(template.id)}
            >
              <ContentCard>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <Badge variant="outline">
                        {template.event_type.name}
                      </Badge>
                    </div>

                    {template.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-muted-foreground">
                      {t('settings.created')}: {formatDatePretty(template.created_at)}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(template)
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
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={t('settings.deleteTemplate')}
        description={
          templateToDelete
            ? t('settings.deleteTemplateConfirm', { name: templateToDelete.name })
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />
    </div>
  )
}
