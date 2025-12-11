'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { DynamicScriptViewer } from '@/components/dynamic-script-viewer'
import { ExportButtonGroup } from '@/components/export-button-group'
import type { ScriptWithSections, EventWithRelations } from '@/lib/types/event-types'

interface ScriptViewClientProps {
  event: EventWithRelations
  script: ScriptWithSections
  eventTypeSlug: string
}

/**
 * Script View Client Component
 *
 * Displays a dynamic event script with export options in sidebar.
 *
 * Per requirements:
 * - Two-column layout (ModuleViewContainer pattern)
 * - Right sidebar: Back button + Export buttons in ModuleViewPanel
 * - Main content: DynamicScriptViewer renders processed script
 */
export function ScriptViewClient({ event, script, eventTypeSlug }: ScriptViewClientProps) {
  const router = useRouter()

  const handleBackToEvent = () => {
    router.push(`/events/${eventTypeSlug}/${event.id}`)
  }

  const handleEditScript = () => {
    router.push(`/settings/event-types/${eventTypeSlug}/scripts/${script.id}`)
  }

  // Action buttons for the sidebar
  const actionButtons = (
    <div className="space-y-2">
      <Button
        onClick={handleEditScript}
        variant="outline"
        className="w-full"
      >
        <Pencil className="h-4 w-4 mr-2" />
        Edit Script
      </Button>
      <Button
        onClick={handleBackToEvent}
        variant="outline"
        className="w-full"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Event
      </Button>
    </div>
  )

  // Export buttons for the sidebar
  const exportButtons = (
    <ExportButtonGroup eventTypeSlug={eventTypeSlug} eventId={event.id} scriptId={script.id} />
  )

  return (
    <PageContainer title={script.name}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content area - appears second on mobile, first on desktop */}
        <div className="flex-1 order-2 md:order-1">
          <DynamicScriptViewer script={script} event={event} />
        </div>

        {/* Sidebar - uses ModuleViewPanel pattern */}
        <ModuleViewPanel
          entity={{ id: script.id, created_at: script.created_at }}
          entityType="Script"
          modulePath={`events/${eventTypeSlug}/${event.id}/scripts`}
          actionButtons={actionButtons}
          exportButtons={exportButtons}
        />
      </div>
    </PageContainer>
  )
}
