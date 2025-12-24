'use client'

import { useEffect, useState } from 'react'
import { FormInput } from '@/components/form-input'
import { getEventTypes } from '@/lib/actions/event-types'
import type { EventType } from '@/lib/types/event-types'

interface EventTypeSelectFieldProps {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
}

/**
 * EventTypeSelectField Component
 *
 * Simple dropdown selector for choosing an event type template for Masses.
 * Fetches event types for the current parish and allows selection.
 * Simpler alternative to EventTypePickerField (which uses modal picker).
 *
 * Per requirements (2025-12-11-mass-templating-via-event-types.md):
 * - Optional field at top of form
 * - Only shows event types for current parish
 * - Help text explaining what event types do
 * - Allows clearing selection (set to null)
 * - Label indicates it's optional
 */
export function EventTypeSelectField({
  value,
  onChange,
  disabled = false
}: EventTypeSelectFieldProps) {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEventTypes() {
      try {
        const types = await getEventTypes()
        setEventTypes(types)
      } catch (error) {
        console.error('Error loading event types:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEventTypes()
  }, [])

  // Build options with "No template" as first option
  const options = [
    { value: 'none', label: 'No template' },
    ...eventTypes.map((eventType) => ({
      value: eventType.id,
      label: eventType.name
    }))
  ]

  return (
    <FormInput
      id="event_type_id"
      inputType="select"
      label="Event Type Template (Optional)"
      description="Select a template to add custom fields and scripts to this Mass"
      value={value || 'none'}
      onChange={(newValue) => onChange(newValue === 'none' ? null : newValue)}
      options={options}
      disabled={disabled || loading}
    />
  )
}
