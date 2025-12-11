'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { DynamicScriptViewer } from '@/components/dynamic-script-viewer'
import { MassExportButtonGroup } from '@/components/mass-export-button-group'
import type { MassWithRelations } from '@/lib/actions/masses'
import type { ScriptWithSections, EventWithRelations } from '@/lib/types/event-types'

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

  // Convert Mass data to match the EventWithRelations interface expected by DynamicScriptViewer
  const eventForProcessing: EventWithRelations = {
    id: mass.id,
    parish_id: mass.parish_id,
    event_type_id: mass.event_type_id!,
    field_values: mass.field_values || {},
    resolved_fields: mass.resolved_fields || {},
    event_type: mass.event_type!,
    occasions: [],
    parish: mass.event?.location ? {
      name: 'Parish',
      city: mass.event.location.city || '',
      state: mass.event.location.state || ''
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
    <div className="space-y-2">
      <Button
        onClick={handleBackToMass}
        variant="outline"
        className="w-full"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Mass
      </Button>
    </div>
  )

  // Export buttons for the sidebar
  const exportButtons = (
    <MassExportButtonGroup massId={mass.id} scriptId={script.id} />
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
