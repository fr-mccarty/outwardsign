"use client"

import { useState } from 'react'
import type { ParishEventWithRelations, EventTypeWithRelations, Script } from '@/lib/types'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/form-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScriptCard } from '@/components/script-card'
import { Edit, BookmarkPlus, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatDatePretty } from '@/lib/utils/formatters'
import { deleteEvent } from '@/lib/actions/parish-events'
import { createPresetFromEvent } from '@/lib/actions/event-presets'
import { LITURGICAL_COLOR_LABELS } from '@/lib/constants'

interface ParishEventViewClientProps {
  event: ParishEventWithRelations
  eventType: EventTypeWithRelations
  scripts: Script[]
  eventTypeSlug: string
}

export function ParishEventViewClient({ event, eventType, scripts, eventTypeSlug }: ParishEventViewClientProps) {
  const router = useRouter()
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetDescription, setPresetDescription] = useState('')
  const [isSavingPreset, setIsSavingPreset] = useState(false)

  // Handle save as preset
  const handleSaveAsPreset = async () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name')
      return
    }

    setIsSavingPreset(true)
    try {
      const result = await createPresetFromEvent(event.id, presetName, presetDescription)
      if (result.success) {
        toast.success('Preset saved successfully')
        setShowSavePresetDialog(false)
        setPresetName('')
        setPresetDescription('')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to save preset')
      }
    } catch (error) {
      console.error('Error saving preset:', error)
      toast.error('Failed to save preset')
    } finally {
      setIsSavingPreset(false)
    }
  }

  // Generate action buttons (Edit + Save as Preset + Settings - Delete handled via onDelete prop)
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
        onClick={() => setShowSavePresetDialog(true)}
      >
        <BookmarkPlus className="h-4 w-4 mr-2" />
        Save as Preset
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

  // Show liturgical color and last updated in details
  const details = (
    <>
      {event.liturgical_color && LITURGICAL_COLOR_LABELS[event.liturgical_color] && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Liturgical Color:</span>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-3 h-3 rounded-full bg-liturgy-${event.liturgical_color.toLowerCase()}`}
            />
            <span>{LITURGICAL_COLOR_LABELS[event.liturgical_color].en}</span>
          </div>
        </div>
      )}
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

      {/* Save as Preset Dialog */}
      <FormDialog
        open={showSavePresetDialog}
        onOpenChange={setShowSavePresetDialog}
        title="Save as Preset"
        description={`Create a reusable preset from this ${eventType.name.toLowerCase()}`}
        onSubmit={handleSaveAsPreset}
        isLoading={isSavingPreset}
        submitLabel="Save Preset"
        submitDisabled={!presetName.trim()}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name">Preset Name *</Label>
            <Input
              id="preset-name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder={`${eventType.name} Preset`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preset-description">Description (optional)</Label>
            <Textarea
              id="preset-description"
              value={presetDescription}
              onChange={(e) => setPresetDescription(e.target.value)}
              placeholder="Describe what this preset is for..."
              rows={3}
            />
          </div>
        </div>
      </FormDialog>
    </ModuleViewContainer>
  )
}
