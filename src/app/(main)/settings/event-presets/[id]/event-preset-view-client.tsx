'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, ArrowLeft, Pencil } from 'lucide-react'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { deletePreset } from '@/lib/actions/event-presets'
import type { EventPresetWithRelations } from '@/lib/types'
import { toast } from 'sonner'
import { formatDatePretty } from '@/lib/utils/formatters'
import { useTranslations } from 'next-intl'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { PAGE_SECTIONS_SPACING } from '@/lib/constants/form-spacing'

interface EventPresetViewClientProps {
  preset: EventPresetWithRelations
}

export function EventPresetViewClient({ preset }: EventPresetViewClientProps) {
  const router = useRouter()
  const t = useTranslations()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      const result = await deletePreset(preset.id)
      if (result.success) {
        toast.success(t('settings.presetDeletedSuccess'))
        router.push('/settings/event-presets')
      } else {
        toast.error(result.error || t('settings.presetDeletedError'))
      }
    } catch (error) {
      console.error('Error deleting preset:', error)
      toast.error(t('settings.presetDeletedError'))
    }
  }

  const handleBack = () => {
    router.push('/settings/event-presets')
  }

  const handleEdit = () => {
    router.push(`/settings/event-presets/${preset.id}/edit`)
  }

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.eventPresets'), href: '/settings/event-presets' },
    { label: preset.name },
  ]

  return (
    <PageContainer
      title={preset.name}
      description={t('settings.eventPresetDetails')}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            {t('common.edit')}
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('common.delete')}
          </Button>
        </div>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className={PAGE_SECTIONS_SPACING}>
        {/* Details */}
        <ContentCard>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">{t('settings.eventType')}</h3>
              <Badge variant="outline" className="mt-1">
                {preset.event_type.name}
              </Badge>
            </div>

            {preset.description && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">{t('common.description')}</h3>
                <p className="mt-1 text-sm">{preset.description}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 text-sm pt-2 border-t">
              <div>
                <h3 className="font-semibold text-muted-foreground">{t('common.created')}</h3>
                <p className="mt-1">{formatDatePretty(preset.created_at)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">{t('common.lastUpdated')}</h3>
                <p className="mt-1">{formatDatePretty(preset.updated_at)}</p>
              </div>
            </div>
          </div>
        </ContentCard>

        {/* Preset Data - Field Values */}
        {preset.preset_data.field_values && Object.keys(preset.preset_data.field_values).length > 0 && (
          <ContentCard>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('settings.fieldValues')}</h3>
              <div className="space-y-2">
                {Object.entries(preset.preset_data.field_values).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
                    <div className="text-sm font-medium text-muted-foreground">{key}</div>
                    <div className="col-span-2 text-sm">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ContentCard>
        )}

        {/* Preset Data - Presider/Homilist */}
        {(preset.preset_data.presider_id || preset.preset_data.homilist_id) && (
          <ContentCard>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('settings.liturgicalRoles')}</h3>
              <div className="space-y-2">
                {preset.preset_data.presider_id && (
                  <div className="grid grid-cols-3 gap-4 py-2 border-b">
                    <div className="text-sm font-medium text-muted-foreground">{t('settings.presider')}</div>
                    <div className="col-span-2 text-sm">{preset.preset_data.presider_id}</div>
                  </div>
                )}
                {preset.preset_data.homilist_id && (
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="text-sm font-medium text-muted-foreground">{t('settings.homilist')}</div>
                    <div className="col-span-2 text-sm">{preset.preset_data.homilist_id}</div>
                  </div>
                )}
              </div>
            </div>
          </ContentCard>
        )}

        {/* Preset Data - Calendar Events */}
        {preset.preset_data.calendar_events && Object.keys(preset.preset_data.calendar_events).length > 0 && (
          <ContentCard>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('settings.calendarEvents')}</h3>
              <div className="space-y-3">
                {Object.entries(preset.preset_data.calendar_events).map(([fieldName, eventData]) => (
                  <div key={fieldName} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-2">{fieldName}</div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {eventData.location_id && (
                        <div>
                          {t('settings.location')}: {eventData.location_id}
                        </div>
                      )}
                      <div>
                        {t('settings.allDay')}: {eventData.is_all_day ? t('common.yes') : t('common.no')}
                      </div>
                      {eventData.duration_days && (
                        <div>
                          {t('settings.durationDays')}: {eventData.duration_days}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ContentCard>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t('settings.deletePreset')}
        description={t('settings.deletePresetConfirm', { name: preset.name })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />
    </PageContainer>
  )
}
