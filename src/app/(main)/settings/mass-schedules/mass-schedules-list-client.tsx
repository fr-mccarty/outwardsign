'use client'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { Plus, Calendar, Clock, ChevronRight, Info, Trash2 } from 'lucide-react'
import type { MassTimesTemplateWithItems } from '@/lib/actions/mass-times-templates'
import { deleteMassTime } from '@/lib/actions/mass-times-templates'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { LinkButton } from '@/components/link-button'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { formatTime } from '@/lib/utils/formatters'

interface MassSchedulesListClientProps {
  initialData: MassTimesTemplateWithItems[]
}

// Day of week display order
const DAY_ORDER = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'MOVABLE']

export function MassSchedulesListClient({ initialData }: MassSchedulesListClientProps) {
  const router = useRouter()
  const t = useTranslations('massSchedules')
  const tCommon = useTranslations('common')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<MassTimesTemplateWithItems | null>(null)

  // Sort templates by day of week
  const sortedTemplates = [...initialData].sort((a, b) => {
    return DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
  })

  const handleDelete = async () => {
    if (!templateToDelete) return

    try {
      await deleteMassTime(templateToDelete.id)
      toast.success(t('deleteSuccess'))
      setTemplateToDelete(null)
      setDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete schedule:', error)
      toast.error(t('deleteError'))
    }
  }

  const confirmDelete = (template: MassTimesTemplateWithItems) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  // Format day of week for display
  const formatDayOfWeek = (day: string) => {
    const days: Record<string, string> = {
      SUNDAY: 'Sunday',
      MONDAY: 'Monday',
      TUESDAY: 'Tuesday',
      WEDNESDAY: 'Wednesday',
      THURSDAY: 'Thursday',
      FRIDAY: 'Friday',
      SATURDAY: 'Saturday',
      MOVABLE: 'Movable Feasts'
    }
    return days[day] || day
  }

  return (
    <>
      {/* Explanatory Alert */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription className="space-y-2">
          <p>{t('explanation')}</p>
          <p className="text-muted-foreground text-sm">{t('howItWorks')}</p>
        </AlertDescription>
      </Alert>

      {/* Templates Grid */}
      {sortedTemplates.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-muted/30">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="font-medium mb-2">{t('noSchedules')}</p>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            {t('noSchedulesMessage')}
          </p>
          <LinkButton href="/settings/mass-schedules/create">
            <Plus className="h-4 w-4 mr-2" />
            {t('createSchedule')}
          </LinkButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDayOfWeek(template.day_of_week)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault()
                        confirmDelete(template)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                )}

                {/* Mass Times Summary */}
                <div className="space-y-1 mb-4">
                  {template.items && template.items.length > 0 ? (
                    template.items.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{formatTime(item.time)}</span>
                        {item.day_type === 'DAY_BEFORE' && (
                          <span className="text-xs text-muted-foreground">(Vigil)</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      {t('noMassTimes')}
                    </p>
                  )}
                  {template.items && template.items.length > 4 && (
                    <p className="text-xs text-muted-foreground">
                      +{template.items.length - 4} more
                    </p>
                  )}
                </div>

                <LinkButton href={`/settings/mass-schedules/${template.id}`} variant="outline" className="w-full justify-between">
                  {t('configure')}
                  <ChevronRight className="h-4 w-4" />
                </LinkButton>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t('deleteTitle')}
        description={t('deleteDescription', { name: templateToDelete?.name || '' })}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        variant="destructive"
      />
    </>
  )
}
