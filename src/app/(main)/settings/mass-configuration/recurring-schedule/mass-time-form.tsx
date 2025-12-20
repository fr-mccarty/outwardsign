'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { FormBottomActions } from '@/components/form-bottom-actions'
import { PersonPickerField } from '@/components/person-picker-field'
import { LocationPickerField } from '@/components/location-picker-field'
import { TimePickerField } from '@/components/time-picker-field'
import { usePickerState } from '@/hooks/use-picker-state'
import type { Person, Location } from '@/lib/types'
import { Plus, Trash2, Edit, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { createMassTime, updateMassTime } from '@/lib/actions/mass-times-templates'
import type { MassTimeWithRelations } from '@/lib/actions/mass-times-templates'
import {
  MassTimesTemplateItem,
  DayType,
  createTemplateItem,
  updateTemplateItem,
  deleteTemplateItem,
} from '@/lib/actions/mass-times-template-items'
import { LITURGICAL_DAYS_OF_WEEK_VALUES, LITURGICAL_DAYS_OF_WEEK_LABELS, type LiturgicalDayOfWeek } from '@/lib/constants'

// Validation schema
const massTimeTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  day_of_week: z.string().min(1, 'Day of week is required'),
  is_active: z.boolean(),
})

type MassTimeTemplateFormValues = z.infer<typeof massTimeTemplateSchema>

interface MassTimeFormProps {
  massTime?: MassTimeWithRelations
  items?: MassTimesTemplateItem[]
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

// Format time for display (e.g., "09:00:00" -> "9:00 AM")
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Format day type for display
function formatDayType(dayType: DayType): string {
  return dayType === 'DAY_BEFORE' ? 'Vigil (Day Before)' : 'Day Of'
}

export function MassTimeForm({ massTime, items = [], formId, onLoadingChange }: MassTimeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!massTime

  const setLoading = (loading: boolean) => {
    setIsSubmitting(loading)
    onLoadingChange?.(loading)
  }

  // State for add dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newTime, setNewTime] = useState('09:00')
  const [newDayType, setNewDayType] = useState<DayType>('IS_DAY')
  const newPresider = usePickerState<Person>()
  const newLocation = usePickerState<Location>()
  const [newLengthOfTime, setNewLengthOfTime] = useState<number | undefined>()
  const newHomilist = usePickerState<Person>()

  // State for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [itemBeingEdited, setItemBeingEdited] = useState<MassTimesTemplateItem | null>(null)
  const [editTime, setEditTime] = useState('09:00')
  const [editDayType, setEditDayType] = useState<DayType>('IS_DAY')
  const editPresider = usePickerState<Person>()
  const editLocation = usePickerState<Location>()
  const [editLengthOfTime, setEditLengthOfTime] = useState<number | undefined>()
  const editHomilist = usePickerState<Person>()

  // State for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MassTimesTemplateItem | null>(null)

  // Initialize form with default values
  const form = useForm<MassTimeTemplateFormValues>({
    resolver: zodResolver(massTimeTemplateSchema),
    defaultValues: {
      name: massTime?.name || '',
      description: massTime?.description || '',
      day_of_week: massTime?.day_of_week || 'SUNDAY',
      is_active: massTime?.is_active !== undefined ? massTime.is_active : false,
    },
  })

  const onSubmit = async (data: MassTimeTemplateFormValues) => {
    setLoading(true)
    try {
      if (isEditing) {
        await updateMassTime(massTime.id, {
          name: data.name,
          description: data.description || null,
          day_of_week: data.day_of_week,
          is_active: data.is_active,
        })
        toast.success('Mass times template updated successfully')
        router.push(`/settings/mass-configuration/recurring-schedule/${massTime.id}`)
      } else {
        const newTemplate = await createMassTime({
          name: data.name,
          description: data.description,
          day_of_week: data.day_of_week,
          is_active: data.is_active,
        })
        toast.success('Mass times template created successfully')
        router.push(`/settings/mass-configuration/recurring-schedule/${newTemplate.id}`)
      }
    } catch (error) {
      console.error('Error saving mass times template:', error)
      toast.error(isEditing ? 'Failed to update template' : 'Failed to create template')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!massTime) return
    setIsAddingItem(true)
    try {
      await createTemplateItem({
        mass_times_template_id: massTime.id,
        time: newTime + ':00',
        day_type: newDayType,
        presider_id: newPresider.value?.id,
        location_id: newLocation.value?.id,
        length_of_time: newLengthOfTime,
        homilist_id: newHomilist.value?.id,
      })
      toast.success('Mass time added')
      setIsAddDialogOpen(false)
      setNewTime('09:00')
      setNewDayType('IS_DAY')
      newPresider.setValue(null)
      newLocation.setValue(null)
      setNewLengthOfTime(undefined)
      newHomilist.setValue(null)
      router.refresh()
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add mass time')
    } finally {
      setIsAddingItem(false)
    }
  }

  const handleOpenDeleteDialog = (item: MassTimesTemplateItem) => {
    setItemToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!massTime || !itemToDelete) return
    try {
      await deleteTemplateItem(itemToDelete.id, massTime.id)
      toast.success('Mass time removed')
      setItemToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to remove mass time')
    }
  }

  const handleOpenEditDialog = (item: MassTimesTemplateItem) => {
    setItemBeingEdited(item)
    setEditTime(item.time.substring(0, 5))
    setEditDayType(item.day_type)
    // Note: We only have IDs here, not full objects. The picker will need to fetch if needed
    // For now, we'll clear the pickers and let users re-select
    editPresider.setValue(null)
    editLocation.setValue(null)
    setEditLengthOfTime(item.length_of_time)
    editHomilist.setValue(null)
    setIsEditDialogOpen(true)
  }

  const handleEditItem = async () => {
    if (!massTime || !itemBeingEdited) return
    setIsAddingItem(true)
    try {
      await updateTemplateItem(itemBeingEdited.id, massTime.id, {
        time: editTime + ':00',
        day_type: editDayType,
        presider_id: editPresider.value?.id,
        location_id: editLocation.value?.id,
        length_of_time: editLengthOfTime,
        homilist_id: editHomilist.value?.id,
      })
      toast.success('Mass time updated')
      setIsEditDialogOpen(false)
      setItemBeingEdited(null)
      router.refresh()
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Failed to update mass time')
    } finally {
      setIsAddingItem(false)
    }
  }

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Template Information */}
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Regular Schedule, Summer Schedule, Advent Schedule"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of this mass times template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Details about when this template applies"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional details about when and how this template is used
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="day_of_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day of week" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LITURGICAL_DAYS_OF_WEEK_VALUES.map((day) => (
                        <SelectItem key={day} value={day}>
                          {LITURGICAL_DAYS_OF_WEEK_LABELS[day as LiturgicalDayOfWeek].en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The day of the week this template applies to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={form.watch('is_active')}
                onCheckedChange={(checked) => form.setValue('is_active', checked as boolean)}
              />
              <Label htmlFor="is_active" className="text-sm font-normal cursor-pointer">
                Active Template
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Template Items - Only show when editing */}
        {isEditing && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle>Mass Times</CardTitle>
              <Button type="button" size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Time
              </Button>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No mass times added yet. Click &quot;Add Time&quot; to add one.
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 px-3 border rounded-md bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatTime(item.time)}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatDayType(item.day_type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleOpenEditDialog(item)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleOpenDeleteDialog(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <FormBottomActions
          isEditing={isEditing}
          isLoading={isSubmitting}
          cancelHref={isEditing ? `/settings/mass-configuration/recurring-schedule/${massTime.id}` : '/settings/mass-configuration/recurring-schedule'}
          moduleName="Template"
        />
      </form>

      {/* Add Time Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Mass Time</DialogTitle>
            <DialogDescription>
              Add a new mass time to this template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <TimePickerField
              id="time"
              label="Time"
              value={newTime}
              onChange={(value) => setNewTime(value)}
            />
            <div className="space-y-2">
              <Label htmlFor="dayType">Day Type</Label>
              <Select value={newDayType} onValueChange={(v) => setNewDayType(v as DayType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IS_DAY">Day Of</SelectItem>
                  <SelectItem value="DAY_BEFORE">Vigil (Day Before)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select &quot;Vigil&quot; for masses that occur the evening before (e.g., Saturday evening for Sunday).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lengthOfTime">Duration (minutes)</Label>
              <Input
                id="lengthOfTime"
                type="number"
                min="0"
                placeholder="e.g., 60"
                value={newLengthOfTime ?? ''}
                onChange={(e) => setNewLengthOfTime(e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <p className="text-xs text-muted-foreground">
                Expected duration of the mass in minutes.
              </p>
            </div>
            <LocationPickerField
              label="Location"
              value={newLocation.value}
              onValueChange={newLocation.setValue}
              showPicker={newLocation.showPicker}
              onShowPickerChange={newLocation.setShowPicker}
              placeholder="Select location (optional)"
            />
            <PersonPickerField
              label="Presider"
              value={newPresider.value}
              onValueChange={newPresider.setValue}
              showPicker={newPresider.showPicker}
              onShowPickerChange={newPresider.setShowPicker}
              placeholder="Select presider (optional)"
              autoSetSex="MALE"
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
            <PersonPickerField
              label="Homilist"
              value={newHomilist.value}
              onValueChange={newHomilist.setValue}
              showPicker={newHomilist.showPicker}
              onShowPickerChange={newHomilist.setShowPicker}
              placeholder="Select homilist (optional)"
              autoSetSex="MALE"
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isAddingItem}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddItem} disabled={isAddingItem}>
              {isAddingItem ? 'Adding...' : 'Add Time'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Time Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Mass Time</DialogTitle>
            <DialogDescription>
              Update this mass time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <TimePickerField
              id="editTime"
              label="Time"
              value={editTime}
              onChange={(value) => setEditTime(value)}
            />
            <div className="space-y-2">
              <Label htmlFor="editDayType">Day Type</Label>
              <Select value={editDayType} onValueChange={(v) => setEditDayType(v as DayType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IS_DAY">Day Of</SelectItem>
                  <SelectItem value="DAY_BEFORE">Vigil (Day Before)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select &quot;Vigil&quot; for masses that occur the evening before (e.g., Saturday evening for Sunday).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLengthOfTime">Duration (minutes)</Label>
              <Input
                id="editLengthOfTime"
                type="number"
                min="0"
                placeholder="e.g., 60"
                value={editLengthOfTime ?? ''}
                onChange={(e) => setEditLengthOfTime(e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <p className="text-xs text-muted-foreground">
                Expected duration of the mass in minutes.
              </p>
            </div>
            <LocationPickerField
              label="Location"
              value={editLocation.value}
              onValueChange={editLocation.setValue}
              showPicker={editLocation.showPicker}
              onShowPickerChange={editLocation.setShowPicker}
              placeholder="Select location (optional)"
            />
            <PersonPickerField
              label="Presider"
              value={editPresider.value}
              onValueChange={editPresider.setValue}
              showPicker={editPresider.showPicker}
              onShowPickerChange={editPresider.setShowPicker}
              placeholder="Select presider (optional)"
              autoSetSex="MALE"
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
            <PersonPickerField
              label="Homilist"
              value={editHomilist.value}
              onValueChange={editHomilist.setValue}
              showPicker={editHomilist.showPicker}
              onShowPickerChange={editHomilist.setShowPicker}
              placeholder="Select homilist (optional)"
              autoSetSex="MALE"
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isAddingItem}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditItem} disabled={isAddingItem}>
              {isAddingItem ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Mass Time"
        itemName={itemToDelete ? formatTime(itemToDelete.time) : undefined}
        onConfirm={handleConfirmDelete}
      />
    </Form>
  )
}
