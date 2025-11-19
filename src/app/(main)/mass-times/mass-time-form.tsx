'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, X } from 'lucide-react'
import { SaveButton } from '@/components/save-button'
import { CancelButton } from '@/components/cancel-button'
import { LocationPickerField } from '@/components/location-picker-field'
import { MassTypePicker } from '@/components/mass-type-picker'
import { usePickerState } from '@/hooks/use-picker-state'
import { toast } from 'sonner'
import { createMassTime, updateMassTime } from '@/lib/actions/mass-times'
import type { MassTimeWithRelations, ScheduleItem } from '@/lib/actions/mass-times'
import {
  LITURGICAL_LANGUAGE_VALUES,
  LITURGICAL_LANGUAGE_LABELS,
  DAYS_OF_WEEK_VALUES,
  DAYS_OF_WEEK_LABELS,
} from '@/lib/constants'

// Validation schema
const scheduleItemSchema = z.object({
  day: z.enum(DAYS_OF_WEEK_VALUES),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'),
})

const massTimeSchema = z.object({
  mass_type_id: z.string().min(1, 'Mass type is required'),
  schedule_items: z.array(scheduleItemSchema).min(1, 'At least one schedule item is required'),
  location_id: z.string().optional(),
  language: z.enum(LITURGICAL_LANGUAGE_VALUES),
  special_designation: z.string().optional(),
  effective_start_date: z.string().optional(),
  effective_end_date: z.string().optional(),
  active: z.boolean(),
  notes: z.string().optional(),
})

type MassTimeFormValues = z.infer<typeof massTimeSchema>

interface MassTimeFormProps {
  massTime?: MassTimeWithRelations
}

export function MassTimeForm({ massTime }: MassTimeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!massTime

  // Initialize form with default values
  const form = useForm<MassTimeFormValues>({
    resolver: zodResolver(massTimeSchema),
    defaultValues: {
      mass_type_id: massTime?.mass_type_id || '',
      schedule_items: massTime?.schedule_items || [{ day: 'SUNDAY', time: '09:00' }],
      location_id: massTime?.location_id || undefined,
      language: massTime?.language || 'en',
      special_designation: massTime?.special_designation || '',
      effective_start_date: massTime?.effective_start_date || '',
      effective_end_date: massTime?.effective_end_date || '',
      active: massTime?.active !== undefined ? massTime.active : true,
      notes: massTime?.notes || '',
    },
  })

  // Location picker state
  const location = usePickerState(massTime?.location)

  // Watch schedule items for dynamic rendering
  const scheduleItems = form.watch('schedule_items')

  // Add new schedule item
  const addScheduleItem = () => {
    const currentItems = form.getValues('schedule_items')
    form.setValue('schedule_items', [...currentItems, { day: 'SUNDAY', time: '09:00' }])
  }

  // Remove schedule item
  const removeScheduleItem = (index: number) => {
    const currentItems = form.getValues('schedule_items')
    if (currentItems.length > 1) {
      form.setValue(
        'schedule_items',
        currentItems.filter((_, i) => i !== index)
      )
    }
  }

  const onSubmit = async (data: MassTimeFormValues) => {
    setIsSubmitting(true)
    try {
      if (isEditing) {
        await updateMassTime(massTime.id, {
          mass_type_id: data.mass_type_id,
          schedule_items: data.schedule_items,
          location_id: data.location_id || null,
          language: data.language,
          special_designation: data.special_designation || null,
          effective_start_date: data.effective_start_date || null,
          effective_end_date: data.effective_end_date || null,
          active: data.active,
          notes: data.notes || null,
        })
        toast.success('Mass time updated successfully')
        router.push(`/mass-times/${massTime.id}`)
      } else {
        const newMassTime = await createMassTime({
          mass_type_id: data.mass_type_id,
          schedule_items: data.schedule_items,
          location_id: data.location_id,
          language: data.language,
          special_designation: data.special_designation,
          effective_start_date: data.effective_start_date,
          effective_end_date: data.effective_end_date,
          active: data.active,
          notes: data.notes,
        })
        toast.success('Mass time created successfully')
        router.push(`/mass-times/${newMassTime.id}`)
      }
    } catch (error) {
      console.error('Error saving mass time:', error)
      toast.error(isEditing ? 'Failed to update mass time' : 'Failed to create mass time')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Schedule Type */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="mass_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mass Type</FormLabel>
                  <FormControl>
                    <MassTypePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Schedule Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Schedule Items</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addScheduleItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time
                </Button>
              </div>

              {scheduleItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4 items-start">
                      <FormField
                        control={form.control}
                        name={`schedule_items.${index}.day`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Day</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DAYS_OF_WEEK_VALUES.map((day) => (
                                  <SelectItem key={day} value={day}>
                                    {DAYS_OF_WEEK_LABELS[day].en}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`schedule_items.${index}.time`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Time (HH:MM)</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {scheduleItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeScheduleItem(index)}
                          className="mt-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mass Details */}
        <Card>
          <CardHeader>
            <CardTitle>Mass Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocationPickerField
              label="Location"
              value={location.value}
              onValueChange={(loc) => {
                location.setValue(loc)
                form.setValue('location_id', loc?.id || undefined)
              }}
              showPicker={location.showPicker}
              onShowPickerChange={location.setShowPicker}
              placeholder="Select Location (optional)"
              description="Where the Mass will take place"
              openToNewLocation={!location.value}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LITURGICAL_LANGUAGE_VALUES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {LITURGICAL_LANGUAGE_LABELS[lang].en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="special_designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Youth Mass, Family Mass" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Effective Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Effective Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="effective_start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effective_end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Status and Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Status and Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Internal notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <CancelButton href="/mass-times" />
          <SaveButton isLoading={isSubmitting} />
        </div>
      </form>
    </Form>
  )
}
