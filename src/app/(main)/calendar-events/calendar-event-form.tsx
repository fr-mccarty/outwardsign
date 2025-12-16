"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { createStandaloneCalendarEvent, updateCalendarEvent } from "@/lib/actions/calendar-events"
import type { CalendarEvent, Location } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { LocationPickerField } from "@/components/location-picker-field"
import { DatePickerField } from "@/components/date-picker-field"
import { TimePickerField } from "@/components/time-picker-field"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { usePickerState } from "@/hooks/use-picker-state"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useTranslations } from 'next-intl'

// Zod schema for calendar event
const calendarEventSchema = z.object({
  label: z.string().min(1, "Event name is required"),
  location_id: z.string().optional(),
})

type CalendarEventFormData = z.infer<typeof calendarEventSchema>

interface CalendarEventFormProps {
  calendarEvent?: CalendarEvent
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function CalendarEventForm({ calendarEvent, formId, onLoadingChange }: CalendarEventFormProps) {
  const router = useRouter()
  const isEditing = !!calendarEvent
  const tCommon = useTranslations('common')

  // Initialize React Hook Form
  const { handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<CalendarEventFormData>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: {
      label: calendarEvent?.label || "",
      location_id: calendarEvent?.location_id || undefined,
    }
  })

  const label = watch('label')

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Picker states
  const location = usePickerState<Location>()
  const [date, setDate] = useState<Date | undefined>()
  const [time, setTime] = useState<string | undefined>()

  // Initialize form with calendar event data when editing
  useEffect(() => {
    if (calendarEvent) {
      // Set location
      if (calendarEvent.location) location.setValue(calendarEvent.location)

      // Set date
      if (calendarEvent.date) {
        setDate(new Date(calendarEvent.date))
      }

      // Set time
      if (calendarEvent.time) {
        setTime(calendarEvent.time)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarEvent])

  // Update form field when location changes
  useEffect(() => {
    setValue('location_id', location.value?.id || '')
  }, [location.value, setValue])

  // Form submission
  const onSubmit = async (data: CalendarEventFormData) => {
    try {
      if (isEditing) {
        // Update existing calendar event
        await updateCalendarEvent(calendarEvent.id, {
          label: data.label,
          location_id: data.location_id || null,
          date: date ? toLocalDateString(date) : null,
          time: time || null,
        })
        toast.success(tCommon('updateSuccess'))
        router.refresh()
      } else {
        // Create new calendar event
        const newEvent = await createStandaloneCalendarEvent({
          label: data.label,
          location_id: data.location_id || null,
          date: date ? toLocalDateString(date) : null,
          time: time || null,
        })
        toast.success(tCommon('createSuccess'))
        router.push(`/calendar-events/${newEvent.id}/edit`)
      }
    } catch (error) {
      console.error('Error saving calendar event:', error)
      toast.error(isEditing ? tCommon('updateError') : tCommon('createError'))
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSectionCard title="Event Details">
        <FormInput
          id="label"
          label="Event Name"
          value={label}
          onChange={(value) => setValue('label', value)}
          error={errors.label?.message}
          required
          placeholder="e.g., Zumba Class, Parish Picnic, Choir Practice"
        />
      </FormSectionCard>

      <FormSectionCard title="Schedule">
        <div className="space-y-4">
          <DatePickerField
            label="Date"
            value={date}
            onValueChange={setDate}
            placeholder="Select date"
          />

          <TimePickerField
            label="Time"
            value={time || ''}
            onChange={setTime}
            placeholder="Select time"
          />

          <LocationPickerField
            label="Location"
            value={location.value}
            onValueChange={location.setValue}
            showPicker={location.showPicker}
            onShowPickerChange={location.setShowPicker}
          />
        </div>
      </FormSectionCard>

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref="/calendar-events"
        moduleName="Calendar Event"
      />
    </form>
  )
}
