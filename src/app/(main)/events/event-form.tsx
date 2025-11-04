"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Save } from "lucide-react"
import { createEvent, updateEvent, type CreateEventData } from "@/lib/actions/events"
import type { Event } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'

interface EventFormProps {
  event?: Event
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const isEditing = !!event
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(event?.name || "")
  const [description, setDescription] = useState(event?.description || "")
  const [responsiblePartyId, setResponsiblePartyId] = useState(event?.responsible_party_id || "")
  const [eventType, setEventType] = useState(event?.event_type || "")
  const [startDate, setStartDate] = useState(event?.start_date || "")
  const [startTime, setStartTime] = useState(event?.start_time || "")
  const [endDate, setEndDate] = useState(event?.end_date || "")
  const [endTime, setEndTime] = useState(event?.end_time || "")
  const [location, setLocation] = useState(event?.location || "")
  const [language, setLanguage] = useState(event?.language || "")
  const [notes, setNotes] = useState(event?.notes || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const eventData: CreateEventData = {
        name,
        description: description || undefined,
        responsible_party_id: responsiblePartyId,
        event_type: eventType,
        start_date: startDate || undefined,
        start_time: startTime || undefined,
        end_date: endDate || undefined,
        end_time: endTime || undefined,
        location: location || undefined,
        language: language || undefined,
        note: notes || undefined,
      }

      if (isEditing) {
        await updateEvent(event.id, eventData)
        toast.success('Event updated successfully')
        router.push(`/events/${event.id}`)
      } else {
        const newEvent = await createEvent(eventData)
        toast.success('Event created successfully!')
        router.push(`/events/${newEvent.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} event:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} event. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        id="name"
        label="Event Name"
        value={name}
        onChange={setName}
        required
        placeholder="Enter event name"
      />

      <FormField
        id="description"
        label="Description (Optional)"
        inputType="textarea"
        value={description}
        onChange={setDescription}
        placeholder="Enter event description..."
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="event_type"
          label="Event Type"
          value={eventType}
          onChange={setEventType}
          required
          placeholder="e.g., Wedding, Baptism, Mass, Meeting"
        />

        <FormField
          id="responsible_party_id"
          label="Responsible Party ID"
          value={responsiblePartyId}
          onChange={setResponsiblePartyId}
          required
          placeholder="Enter responsible party ID"
          description="ID of the person responsible for this event"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="start_date"
          label="Start Date (Optional)"
          inputType="date"
          value={startDate}
          onChange={setStartDate}
        />

        <FormField
          id="start_time"
          label="Start Time (Optional)"
          inputType="time"
          value={startTime}
          onChange={setStartTime}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="end_date"
          label="End Date (Optional)"
          inputType="date"
          value={endDate}
          onChange={setEndDate}
        />

        <FormField
          id="end_time"
          label="End Time (Optional)"
          inputType="time"
          value={endTime}
          onChange={setEndTime}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="location"
          label="Location (Optional)"
          value={location}
          onChange={setLocation}
          placeholder="Enter event location"
        />

        <FormField
          id="language"
          label="Language (Optional)"
          value={language}
          onChange={setLanguage}
          placeholder="e.g., English, Spanish"
        />
      </div>

      <FormField
        id="notes"
        label="Notes (Optional)"
        inputType="textarea"
        value={notes}
        onChange={setNotes}
        placeholder="Enter any additional notes..."
        rows={4}
      />

      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Event Guidelines</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Provide a clear and descriptive event name</li>
          <li>• Specify the event type for better organization</li>
          <li>• Include start date and time for scheduling</li>
          <li>• Add location information for attendees</li>
          <li>• Assign a responsible party to manage the event</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Event")}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={isEditing ? `/events/${event.id}` : "/events"}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
