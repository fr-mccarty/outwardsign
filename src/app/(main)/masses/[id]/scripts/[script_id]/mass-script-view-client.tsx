'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer, FileText, FileDown, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { DynamicScriptViewer } from '@/components/dynamic-script-viewer'
import Link from 'next/link'
import type { MassWithRelations } from '@/lib/schemas/masses'
import type { ScriptWithSections } from '@/lib/types/event-types'
import type { MasterEventWithRelations } from '@/lib/types'

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
export function MassScriptViewClient({ mass, script }: MassScriptViewClientProps) {
  const router = useRouter()

  // Convert Mass data to match the MasterEventWithRelations interface expected by DynamicScriptViewer
  // Note: Only resolved_fields and parish are actually used by the script processor
  const eventForProcessing: MasterEventWithRelations = {
    id: mass.id,
    parish_id: mass.parish_id,
    event_type_id: mass.event_type_id!,
    status: 'ACTIVE',
    field_values: mass.field_values || {},
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
    router.push(`/masses/${mass.id}`)
  }

  // Action buttons for the sidebar
  const actionButtons = (
    <>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/masses/${mass.id}/scripts/${script.id}`} target="_blank">
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </Link>
      </Button>
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
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/masses/${mass.id}/scripts/${script.id}/export/pdf`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/masses/${mass.id}/scripts/${script.id}/export/docx`}>
          <FileDown className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/masses/${mass.id}/scripts/${script.id}/export/txt`}>
          <File className="h-4 w-4 mr-2" />
          Download Text
        </Link>
      </Button>
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
