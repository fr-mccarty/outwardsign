'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer, FileText, FileDown, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/link-button'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { DynamicScriptViewer } from '@/components/dynamic-script-viewer'
import type { MassWithRelations } from '@/lib/schemas/mass-liturgies'
import type { ScriptWithSections } from '@/lib/types/event-types'
import type { ParishEventWithRelations } from '@/lib/types'

interface MassScriptViewClientProps {
  mass: MassWithRelations
  script: ScriptWithSections
}

/**
 * MassScriptViewClient Component
 *
 * Displays a Mass script with field placeholders replaced by actual Mass data.
 * Uses the same two-column layout pattern as the event script view:
 * - Main content: DynamicScriptViewer renders processed script
 * - Right sidebar: ModuleViewPanel with Back button + Export buttons
 */
export function MassLiturgyScriptViewClient({ mass, script }: MassScriptViewClientProps) {
  const router = useRouter()

  // Convert Mass data to match the ParishEventWithRelations interface expected by DynamicScriptViewer
  // Note: Only resolved_fields and parish are actually used by the script processor
  const eventForProcessing: ParishEventWithRelations = {
    id: mass.id,
    parish_id: mass.parish_id,
    event_type_id: mass.event_type_id!,
    liturgical_calendar_id: mass.liturgical_calendar_id || null,
    status: 'ACTIVE',
    field_values: mass.field_values || {},
    liturgical_color: mass.liturgical_color || null,
    resolved_fields: mass.resolved_fields || {},
    event_type: {
      ...mass.event_type!,
      input_field_definitions: [],  // Not needed for script processing
      scripts: [script]  // Pass the current script
    },
    calendar_events: [],
    people_event_assignments: mass.people_event_assignments || [],
    parish: mass.calendar_events?.[0]?.location ? {
      name: 'Parish',
      city: mass.calendar_events[0].location.city || '',
      state: mass.calendar_events[0].location.state || ''
    } : undefined,
    created_at: mass.created_at,
    updated_at: mass.updated_at,
    deleted_at: null
  }

  const handleBackToMass = () => {
    router.push(`/mass-liturgies/${mass.id}`)
  }

  // Action buttons for the sidebar
  const actionButtons = (
    <>
      <LinkButton href={`/print/mass-liturgies/${mass.id}/scripts/${script.id}`} variant="outline" className="w-full" target="_blank">
        <Printer className="h-4 w-4 mr-2" />
        Print View
      </LinkButton>
      <Button
        onClick={handleBackToMass}
        variant="outline"
        className="w-full"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Mass
      </Button>
    </>
  )

  // Export buttons for the sidebar
  const exportButtons = (
    <>
      <LinkButton href={`/api/mass-liturgies/${mass.id}/scripts/${script.id}/export/pdf`} variant="default" className="w-full" target="_blank">
        <FileText className="h-4 w-4 mr-2" />
        Download PDF
      </LinkButton>
      <LinkButton href={`/api/mass-liturgies/${mass.id}/scripts/${script.id}/export/docx`} variant="default" className="w-full">
        <FileDown className="h-4 w-4 mr-2" />
        Download Word
      </LinkButton>
      <LinkButton href={`/api/mass-liturgies/${mass.id}/scripts/${script.id}/export/txt`} variant="default" className="w-full">
        <File className="h-4 w-4 mr-2" />
        Download Text
      </LinkButton>
    </>
  )

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Main content area - appears second on mobile, first on desktop */}
      <div className="flex-1 order-2 md:order-1">
        <DynamicScriptViewer script={script} event={eventForProcessing} />
      </div>

      {/* Sidebar - uses ModuleViewPanel pattern */}
      <ModuleViewPanel
        entity={{ id: script.id, created_at: script.created_at }}
        entityType="Script"
        modulePath={`masses/${mass.id}/scripts`}
        actionButtons={actionButtons}
        exportButtons={exportButtons}
      />
    </div>
  )
}
