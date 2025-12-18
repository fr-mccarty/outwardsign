"use client"

import { useState } from 'react'
import type { MasterEventWithRelations, EventTypeWithRelations, Script } from '@/lib/types'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScriptCard } from '@/components/script-card'
import { Edit, BookmarkPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatDatePretty, formatTime } from '@/lib/utils/formatters'
import { deleteEvent } from '@/lib/actions/master-events'
import { createTemplateFromEvent } from '@/lib/actions/master-event-templates'

interface MasterEventViewClientProps {
  event: MasterEventWithRelations
  eventType: EventTypeWithRelations
  scripts: Script[]
  eventTypeSlug: string
}

export function DynamicEventViewClient({ event, eventType, scripts, eventTypeSlug }: MasterEventViewClientProps) {
  const router = useRouter()
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)

  // Create lookup map for input field definitions by ID (for calendar event labels)
  const fieldDefinitionMap = new Map(
    (eventType.input_field_definitions || []).map(field => [field.id, field])
  )

  // Helper to get field label from input_field_definition_id
  const getFieldLabel = (inputFieldDefinitionId: string): string => {
    const field = fieldDefinitionMap.get(inputFieldDefinitionId)
    return field?.name || 'Calendar Event'
  }

  // Handle save as template
  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name')
      return
    }

    setIsSavingTemplate(true)
    try {
      const result = await createTemplateFromEvent(event.id, templateName, templateDescription)
      if (result.success) {
        toast.success('Template saved successfully')
        setShowSaveTemplateDialog(false)
        setTemplateName('')
        setTemplateDescription('')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to save template')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    } finally {
      setIsSavingTemplate(false)
    }
  }

  // Generate action buttons (Edit + Save as Template - Delete handled via onDelete prop)
  const actionButtons = (
    <div className="space-y-2 w-full">
      <Button asChild className="w-full">
        <Link href={`/events/${eventType.slug}/${event.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit {eventType.name}
        </Link>
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowSaveTemplateDialog(true)}
      >
        <BookmarkPlus className="h-4 w-4 mr-2" />
        Save as Template
      </Button>
    </div>
  )

  // Handle script card click
  const handleScriptClick = (scriptId: string) => {
    router.push(`/events/${eventTypeSlug}/${event.id}/scripts/${scriptId}`)
  }

  // Show last updated in details if different from created
  const details = (
    <>
      {event.updated_at !== event.created_at && (
        <div>
          <span className="font-medium">Last Updated:</span> {formatDatePretty(new Date(event.updated_at))}
        </div>
      )}
    </>
  )

  // Sort calendar_events by start_datetime
  const sortedCalendarEvents = [...(event.calendar_events || [])].sort((a, b) =>
    new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
  )

  return (
    <ModuleViewContainer
      entity={event}
      entityType={eventType.name}
      modulePath={`events/${eventType.slug}`}
      actionButtons={actionButtons}
      details={details}
      onDelete={deleteEvent}
    >
      {/* Calendar Events Section */}
      {sortedCalendarEvents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Calendar Events</h3>
          <div className="space-y-3">
            {sortedCalendarEvents.map((calendarEvent) => (
              <Card key={calendarEvent.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {getFieldLabel(calendarEvent.input_field_definition_id)}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {calendarEvent.start_datetime && (
                    <div>
                      <span className="font-medium">Date & Time:</span>{' '}
                      {formatDatePretty(new Date(calendarEvent.start_datetime))} at {formatTime(new Date(calendarEvent.start_datetime).toTimeString().slice(0, 8))}
                    </div>
                  )}
                  {calendarEvent.location && (
                    <div>
                      <span className="font-medium">Location:</span>{' '}
                      {calendarEvent.location.name}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Script cards stacked vertically */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Scripts</h3>
        {scripts.length > 0 ? (
          scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onClick={() => handleScriptClick(script.id)}
            />
          ))
        ) : (
          <div className="text-sm text-muted-foreground">
            No scripts available for this event type.
          </div>
        )}
      </div>

      {/* Save as Template Dialog */}
      <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Create a reusable template from this {eventType.name.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder={`${eventType.name} Template`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (optional)</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe what this template is for..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveTemplateDialog(false)}
              disabled={isSavingTemplate}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAsTemplate}
              disabled={isSavingTemplate || !templateName.trim()}
            >
              {isSavingTemplate ? 'Saving...' : 'Save Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleViewContainer>
  )
}
