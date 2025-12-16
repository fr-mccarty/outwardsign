"use client"

import type { MasterEventWithRelations } from '@/lib/types'
import { deleteEvent } from '@/lib/actions/master-events'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { Edit, Printer, FileText, FileDown, File } from 'lucide-react'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { ScriptCard } from '@/components/script-card'
import { RoleAssignmentSection } from '@/components/role-assignment-section'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Script } from '@/lib/types'
import { assignRole, removeRoleAssignment } from '@/lib/actions/master-events'
import { toast } from 'sonner'
import type { Person } from '@/lib/types'

interface EventViewClientProps {
  event: MasterEventWithRelations
  scripts: Script[]
}

export function EventViewClient({ event, scripts }: EventViewClientProps) {
  const router = useRouter()

  // Get primary calendar event for main event display
  const primaryCalendarEvent = event.calendar_events?.find(ce => ce.is_primary) || event.calendar_events?.[0]

  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const eventTypeName = event.event_type?.name || 'Event'
    const dateStr = primaryCalendarEvent?.start_datetime
      ? new Date(primaryCalendarEvent.start_datetime).toISOString().split('T')[0]
      : 'undated'
    return `${eventTypeName}-${dateStr}.${extension}`
  }

  // Extract template ID from event record
  const getTemplateId = () => {
    // TODO: Store template preference in master_event
    // For now, use default or first available template
    return 'default'
  }

  // Handle script card click
  const handleScriptClick = (scriptId: string) => {
    router.push(`/events/${event.id}/scripts/${scriptId}`)
  }

  // Handle role assignment
  const handleRoleAssigned = async (roleId: string, person: Person, notes?: string) => {
    try {
      await assignRole(event.id, roleId, person.id, notes)
      toast.success('Role assigned successfully')
      router.refresh()
    } catch (error) {
      console.error('Error assigning role:', error)
      toast.error('Failed to assign role')
      throw error
    }
  }

  // Handle role removal
  const handleRoleRemoved = async (roleAssignmentId: string) => {
    try {
      await removeRoleAssignment(roleAssignmentId)
      toast.success('Role removed successfully')
      router.refresh()
    } catch (error) {
      console.error('Error removing role:', error)
      toast.error('Failed to remove role')
      throw error
    }
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/events/${event.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Event
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/events/${event.id}`} target="_blank">
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </Link>
      </Button>
    </>
  )

  // Generate export buttons
  const exportButtons = (
    <>
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/events/${event.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/events/${event.id}/word?filename=${generateFilename('docx')}`}>
          <FileDown className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/events/${event.id}/txt?filename=${generateFilename('txt')}`}>
          <File className="h-4 w-4 mr-2" />
          Download Text
        </Link>
      </Button>
    </>
  )

  // Generate details section content
  const details = (
    <>
      {event.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <ModuleStatusLabel status={event.status} statusType="event" />
        </div>
      )}

      {primaryCalendarEvent?.location && (
        <div className={event.status ? "pt-2 border-t" : ""}>
          <span className="font-medium">Location:</span> {primaryCalendarEvent.location.name}
          {(primaryCalendarEvent.location.street || primaryCalendarEvent.location.city || primaryCalendarEvent.location.state) && (
            <div className="text-xs text-muted-foreground mt-1">
              {[primaryCalendarEvent.location.street, primaryCalendarEvent.location.city, primaryCalendarEvent.location.state]
                .filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Display resolved field values */}
      {event.resolved_fields && Object.keys(event.resolved_fields).length > 0 && (
        <div className="pt-2 border-t space-y-2">
          {Object.entries(event.resolved_fields).map(([fieldName, fieldValue]) => {
            if (!fieldValue.resolved_value) return null

            let displayValue = ''
            if (typeof fieldValue.resolved_value === 'object' && 'full_name' in fieldValue.resolved_value) {
              displayValue = fieldValue.resolved_value.full_name
            } else if (typeof fieldValue.resolved_value === 'object' && 'name' in fieldValue.resolved_value) {
              displayValue = fieldValue.resolved_value.name
            } else {
              displayValue = String(fieldValue.resolved_value)
            }

            return (
              <div key={fieldName}>
                <span className="font-medium">{fieldName}:</span> {displayValue}
              </div>
            )
          })}
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={event as any}
      entityType={event.event_type?.name || "Event"}
      modulePath="events"
      mainEvent={primaryCalendarEvent as any}
      generateFilename={generateFilename}
      buildLiturgy={undefined} // Events don't have a default liturgy builder
      getTemplateId={getTemplateId}
      statusType="event"
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      details={details}
      onDelete={deleteEvent}
    >
      {/* Role Assignments */}
      {event.event_type?.role_definitions && (
        <div className="mt-6">
          <RoleAssignmentSection
            masterEvent={event}
            onRoleAssigned={handleRoleAssigned}
            onRoleRemoved={handleRoleRemoved}
          />
        </div>
      )}

      {/* Show custom scripts if Event has an event type */}
      {event.event_type_id && scripts.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Custom Scripts</h3>
          {scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onClick={() => handleScriptClick(script.id)}
            />
          ))}
        </div>
      )}
    </ModuleViewContainer>
  )
}
