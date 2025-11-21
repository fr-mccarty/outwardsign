'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { FormBottomActions } from '@/components/form-bottom-actions'
import { Plus, Trash2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { createMassTime, updateMassTime } from '@/lib/actions/mass-times'
import type { MassTimeWithRelations } from '@/lib/actions/mass-times'
import {
  MassTimesTemplateItem,
  DayType,
  createTemplateItem,
  deleteTemplateItem,
} from '@/lib/actions/mass-times-template-items'

// Validation schema
const massTimeTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
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

  // Initialize form with default values
  const form = useForm<MassTimeTemplateFormValues>({
    resolver: zodResolver(massTimeTemplateSchema),
    defaultValues: {
      name: massTime?.name || '',
      description: massTime?.description || '',
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
          is_active: data.is_active,
        })
        toast.success('Mass times template updated successfully')
        router.push(`/mass-times-templates/${massTime.id}`)
      } else {
        const newTemplate = await createMassTime({
          name: data.name,
          description: data.description,
          is_active: data.is_active,
        })
        toast.success('Mass times template created successfully')
        router.push(`/mass-times-templates/${newTemplate.id}`)
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
      })
      toast.success('Mass time added')
      setIsAddDialogOpen(false)
      setNewTime('09:00')
      setNewDayType('IS_DAY')
      router.refresh()
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add mass time')
    } finally {
      setIsAddingItem(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!massTime) return
    try {
      await deleteTemplateItem(itemId, massTime.id)
      toast.success('Mass time removed')
      router.refresh()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to remove mass time')
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
          cancelHref={isEditing ? `/mass-times-templates/${massTime.id}` : '/mass-times-templates'}
          moduleName="Template"
        />
      </form>

      {/* Add Time Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Mass Time</DialogTitle>
            <DialogDescription>
              Add a new mass time to this template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
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
    </Form>
  )
}
