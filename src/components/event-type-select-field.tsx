'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

  return (
    <div className="space-y-2">
      <Label htmlFor="event_type_id">
        Event Type Template <span className="text-muted-foreground">(Optional)</span>
      </Label>
      <Select
        value={value || 'none'}
        onValueChange={(newValue) => onChange(newValue === 'none' ? null : newValue)}
        disabled={disabled || loading}
      >
        <SelectTrigger id="event_type_id">
          <SelectValue placeholder={loading ? 'Loading...' : 'Select a template'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">No template</span>
          </SelectItem>
          {eventTypes.map((eventType) => (
            <SelectItem key={eventType.id} value={eventType.id}>
              {eventType.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Select a template to add custom fields and scripts to this Mass
      </p>
    </div>
  )
}
