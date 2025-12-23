"use client"

import { useState } from 'react'
import type { MasterEventWithRelations, EventTypeWithRelations, Script } from '@/lib/types'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
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
import { Edit, BookmarkPlus, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatDatePretty } from '@/lib/utils/formatters'
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

  // Generate action buttons (Edit + Save as Template + Settings - Delete handled via onDelete prop)
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
      <Button asChild variant="outline" className="w-full">
        <Link href={`/settings/event-types/${eventType.slug}/scripts`}>
          <Settings className="h-4 w-4 mr-2" />
          Configure Scripts
        </Link>
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

  return (
    <ModuleViewContainer
      entity={event}
      entityType={eventType.name}
      modulePath={`events/${eventType.slug}`}
      actionButtons={actionButtons}
      details={details}
      onDelete={deleteEvent}
    >
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
