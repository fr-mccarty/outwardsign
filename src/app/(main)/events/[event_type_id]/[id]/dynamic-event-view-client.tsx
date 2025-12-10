"use client"

import { useState } from 'react'
import type { DynamicEventWithRelations, DynamicEventType, Script } from '@/lib/types'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { ScriptCard } from '@/components/script-card'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDatePretty } from '@/lib/utils/formatters'
import { deleteEvent } from '@/lib/actions/dynamic-events'
import { toast } from 'sonner'

interface DynamicEventViewClientProps {
  event: DynamicEventWithRelations
  eventType: DynamicEventType
  scripts: Script[]
  eventTypeSlug: string
}

export function DynamicEventViewClient({ event, eventType, scripts, eventTypeSlug }: DynamicEventViewClientProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteEvent(event.id)
      toast.success(`${eventType.name} deleted successfully`)
      router.push(`/events/${eventTypeSlug}`)
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error(`Failed to delete ${eventType.name}`)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/events/${eventType.slug}/${event.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit {eventType.name}
        </Link>
      </Button>
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => setDeleteDialogOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete {eventType.name}
      </Button>
    </>
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
    <>
      <ModuleViewContainer
        entity={event}
        entityType={eventType.name}
        modulePath={`events/${eventType.slug}`}
        actionButtons={actionButtons}
        details={details}
      >
        {/* Script cards stacked vertically */}
        <div className="space-y-4">
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
      </ModuleViewContainer>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete ${eventType.name}?`}
        description={`Are you sure you want to delete this ${eventType.name.toLowerCase()}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  )
}
