'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SelectItem } from '@/components/ui/select'
import { FormInput } from '@/components/form-input'
import { FileText, Trash2 } from 'lucide-react'
import { ContentCard } from '@/components/content-card'
import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { deletePreset } from '@/lib/actions/event-presets'
import type { EventPresetWithRelations } from '@/lib/types'
import { toast } from 'sonner'
import { formatDatePretty } from '@/lib/utils/formatters'
import { useTranslations } from 'next-intl'

interface EventPresetsListProps {
  presets: EventPresetWithRelations[]
  allPresets: EventPresetWithRelations[]
}

export function EventPresetsList({
  presets,
  allPresets,
}: EventPresetsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [eventTypeFilter, setEventTypeFilter] = useState(searchParams.get('event_type') || 'all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [presetToDelete, setPresetToDelete] = useState<EventPresetWithRelations | null>(null)

  // Get unique event types from all presets
  const eventTypes = Array.from(
    new Map(allPresets.map(p => [p.event_type.id, p.event_type])).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/settings/event-presets?${params.toString()}`)
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
    router.push(`/settings/event-presets/${id}`)
  }

  const handleDeleteClick = (preset: EventPresetWithRelations) => {
    setPresetToDelete(preset)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!presetToDelete) return

    try {
      const result = await deletePreset(presetToDelete.id)
      if (result.success) {
        toast.success(t('settings.presetDeletedSuccess'))
        setDeleteDialogOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || t('settings.presetDeletedError'))
      }
    } catch (error) {
      console.error('Error deleting preset:', error)
      toast.error(t('settings.presetDeletedError'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <ContentCard>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            id="search-presets"
            label={t('settings.searchPresets')}
            hideLabel
            inputType="text"
            placeholder={t('settings.searchPresets')}
            value={search}
            onChange={handleSearchChange}
          />
          <FormInput
            id="event-type-filter"
            label={t('settings.filterByEventType')}
            hideLabel
            inputType="select"
            value={eventTypeFilter}
            onChange={handleEventTypeChange}
          >
            <SelectItem value="all">{t('settings.allEventTypes')}</SelectItem>
            {eventTypes.map((eventType) => (
              <SelectItem key={eventType.id} value={eventType.id}>
                {eventType.name}
              </SelectItem>
            ))}
          </FormInput>
        </div>
      </ContentCard>

      {/* Preset List */}
      {presets.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title={t('settings.noPresetsFound')}
          description={
            search || eventTypeFilter !== 'all'
              ? t('settings.tryAdjustingFilters')
              : t('settings.noPresetsCreated')
          }
        />
      ) : (
        <div className="grid gap-4">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="hover:bg-accent/50 cursor-pointer transition-colors rounded-lg"
              onClick={() => handleViewClick(preset.id)}
            >
              <ContentCard>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{preset.name}</h3>
                      <Badge variant="outline">
                        {preset.event_type.name}
                      </Badge>
                    </div>

                    {preset.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {preset.description}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-muted-foreground">
                      {t('settings.created')}: {formatDatePretty(preset.created_at)}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(preset)
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
        title={t('settings.deletePreset')}
        description={
          presetToDelete
            ? t('settings.deletePresetConfirm', { name: presetToDelete.name })
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />
    </div>
  )
}
