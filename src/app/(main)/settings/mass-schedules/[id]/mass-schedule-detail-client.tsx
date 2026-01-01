'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Clock, Info, Trash2, ArrowLeft, Settings2 } from 'lucide-react'
import type { MassTimesTemplateWithItems } from '@/lib/actions/mass-times-templates'
import type { EventType } from '@/lib/types'
import {
  createTemplateItem,
  updateTemplateItem,
  deleteTemplateItem,
  type DayType,
} from '@/lib/actions/mass-times-template-items'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatTime } from '@/lib/utils/formatters'

interface MassScheduleDetailClientProps {
  template: MassTimesTemplateWithItems
  massEventTypes: EventType[]
}

interface MassTimeItem {
  id: string
  time: string
  day_type: DayType
  event_type_id?: string
  location_id?: string
  length_of_time?: number
  role_quantities: Record<string, number>
  event_type?: { id: string; name: string; slug: string | null }
  location?: { id: string; name: string }
  // For UI state
  isExpanded?: boolean
  availableRoles?: Array<{ property_name: string; name: string }>
}

export function MassScheduleDetailClient({
  template,
  massEventTypes,
}: MassScheduleDetailClientProps) {
  const t = useTranslations('massSchedules')
  const tCommon = useTranslations('common')

  const [items, setItems] = useState<MassTimeItem[]>(
    (template.items || []).map((item) => ({
      ...item,
      day_type: item.day_type as DayType,
      isExpanded: false,
    }))
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MassTimeItem | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  // Add new mass time
  const handleAddMassTime = async () => {
    try {
      const newItem = await createTemplateItem({
        mass_times_template_id: template.id,
        time: '09:00:00',
        day_type: 'IS_DAY',
        role_quantities: {},
      })

      setItems([
        ...items,
        {
          ...newItem,
          isExpanded: true,
        },
      ])
      toast.success(t('massTimeAdded'))
    } catch (error) {
      console.error('Failed to add mass time:', error)
      toast.error(t('massTimeAddError'))
    }
  }

  // Delete mass time
  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      await deleteTemplateItem(itemToDelete.id, template.id)
      setItems(items.filter((item) => item.id !== itemToDelete.id))
      toast.success(t('massTimeDeleted'))
      setItemToDelete(null)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Failed to delete mass time:', error)
      toast.error(t('massTimeDeleteError'))
    }
  }

  // Update mass time field
  const handleUpdateField = async (
    itemId: string,
    field: string,
    value: string | number | Record<string, number>
  ) => {
    setSaving(itemId)
    try {
      await updateTemplateItem(itemId, template.id, {
        [field]: value,
      })

      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item
        )
      )
    } catch (error) {
      console.error('Failed to update mass time:', error)
      toast.error(t('massTimeUpdateError'))
    } finally {
      setSaving(null)
    }
  }

  // Load available roles when event type changes
  const handleEventTypeChange = async (itemId: string, eventTypeId: string) => {
    setSaving(itemId)
    try {
      // Update the event type
      await updateTemplateItem(itemId, template.id, {
        event_type_id: eventTypeId,
        role_quantities: {}, // Reset quantities when type changes
      })

      // Fetch the input field definitions for this event type
      const fields = await getInputFieldDefinitions(eventTypeId)
      const personFields = fields.filter(
        (f) => f.type === 'person' && f.is_per_calendar_event
      )

      const eventType = massEventTypes.find((et) => et.id === eventTypeId)

      setItems(
        items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                event_type_id: eventTypeId,
                event_type: eventType
                  ? { id: eventType.id, name: eventType.name, slug: eventType.slug }
                  : undefined,
                role_quantities: {},
                availableRoles: personFields.map((f) => ({
                  property_name: f.property_name,
                  name: f.name,
                })),
                isExpanded: true,
              }
            : item
        )
      )
      toast.success(t('eventTypeUpdated'))
    } catch (error) {
      console.error('Failed to update event type:', error)
      toast.error(t('massTimeUpdateError'))
    } finally {
      setSaving(null)
    }
  }

  // Update role quantity
  const handleRoleQuantityChange = async (
    itemId: string,
    roleName: string,
    quantity: number
  ) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const newQuantities = {
      ...item.role_quantities,
      [roleName]: quantity,
    }

    // Remove zero quantities
    if (quantity === 0) {
      delete newQuantities[roleName]
    }

    await handleUpdateField(itemId, 'role_quantities', newQuantities)
  }

  // Toggle expanded state and load roles if needed
  const toggleExpanded = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    // If expanding and has event type but no roles loaded, fetch them
    if (!item.isExpanded && item.event_type_id && !item.availableRoles) {
      try {
        const fields = await getInputFieldDefinitions(item.event_type_id)
        const personFields = fields.filter(
          (f) => f.type === 'person' && f.is_per_calendar_event
        )

        setItems(
          items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  isExpanded: true,
                  availableRoles: personFields.map((f) => ({
                    property_name: f.property_name,
                    name: f.name,
                  })),
                }
              : i
          )
        )
      } catch (error) {
        console.error('Failed to load roles:', error)
      }
    } else {
      setItems(
        items.map((i) =>
          i.id === itemId ? { ...i, isExpanded: !i.isExpanded } : i
        )
      )
    }
  }

  // Sort items by time
  const sortedItems = [...items].sort((a, b) => {
    // DAY_BEFORE comes first
    if (a.day_type !== b.day_type) {
      return a.day_type === 'DAY_BEFORE' ? -1 : 1
    }
    return a.time.localeCompare(b.time)
  })

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button variant="outline" asChild>
          <Link href="/settings/mass-schedules">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {tCommon('back')}
          </Link>
        </Button>
      </div>

      {/* Explanation */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p>{t('detailExplanation')}</p>
        </AlertDescription>
      </Alert>

      {/* Add Mass Time Button */}
      <div className="flex justify-end">
        <Button onClick={handleAddMassTime}>
          <Plus className="h-4 w-4 mr-2" />
          {t('addMassTime')}
        </Button>
      </div>

      {/* Mass Times List */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-muted/30">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="font-medium mb-2">{t('noMassTimes')}</p>
          <p className="text-muted-foreground mb-4">{t('noMassTimesMessage')}</p>
          <Button onClick={handleAddMassTime}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addMassTime')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item) => (
            <Card key={item.id} className={saving === item.id ? 'opacity-70' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">
                        {formatTime(item.time)}
                        {item.day_type === 'DAY_BEFORE' && (
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            (Vigil)
                          </span>
                        )}
                      </CardTitle>
                      {item.event_type && (
                        <p className="text-sm text-muted-foreground">
                          {item.event_type.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(item.id)}
                    >
                      <Settings2 className="h-4 w-4 mr-2" />
                      {item.isExpanded ? t('collapse') : t('configure')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setItemToDelete(item)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {item.isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-4 border-t pt-4">
                    {/* Basic Settings Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Time */}
                      <div>
                        <Label>{t('time')}</Label>
                        <Input
                          type="time"
                          value={item.time.slice(0, 5)}
                          onChange={(e) =>
                            handleUpdateField(item.id, 'time', e.target.value + ':00')
                          }
                        />
                      </div>

                      {/* Day Type */}
                      <div>
                        <Label>{t('dayType')}</Label>
                        <Select
                          value={item.day_type}
                          onValueChange={(value) =>
                            handleUpdateField(item.id, 'day_type', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IS_DAY">{t('sameDay')}</SelectItem>
                            <SelectItem value="DAY_BEFORE">{t('vigil')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Event Type */}
                      <div>
                        <Label>{t('massType')}</Label>
                        <Select
                          value={item.event_type_id || ''}
                          onValueChange={(value) =>
                            handleEventTypeChange(item.id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectMassType')} />
                          </SelectTrigger>
                          <SelectContent>
                            {massEventTypes.map((et) => (
                              <SelectItem key={et.id} value={et.id}>
                                {et.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Role Quantities */}
                    {item.event_type_id && item.availableRoles && item.availableRoles.length > 0 && (
                      <div>
                        <Label className="mb-3 block">{t('ministryPositions')}</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {item.availableRoles.map((role) => (
                            <div
                              key={role.property_name}
                              className="flex items-center gap-2"
                            >
                              <Label className="text-sm font-normal flex-1 truncate">
                                {role.name}
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                max="99"
                                className="w-16 text-center"
                                value={item.role_quantities[role.property_name] || 0}
                                onChange={(e) =>
                                  handleRoleQuantityChange(
                                    item.id,
                                    role.property_name,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.event_type_id && (!item.availableRoles || item.availableRoles.length === 0) && (
                      <p className="text-sm text-muted-foreground italic">
                        {t('noRolesDefined')}
                      </p>
                    )}

                    {!item.event_type_id && (
                      <p className="text-sm text-muted-foreground italic">
                        {t('selectMassTypeFirst')}
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t('deleteMassTimeTitle')}
        description={t('deleteMassTimeDescription', {
          time: itemToDelete ? formatTime(itemToDelete.time) : '',
        })}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        variant="destructive"
      />
    </div>
  )
}
