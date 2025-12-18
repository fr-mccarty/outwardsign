'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Printer, FileText, FileDown, File } from 'lucide-react'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { DynamicScriptViewer } from '@/components/dynamic-script-viewer'
import Link from 'next/link'
import type { ScriptWithSections } from '@/lib/types/event-types'
import type { MasterEventWithRelations } from '@/lib/types'

interface ScriptViewClientProps {
  event: MasterEventWithRelations
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
    <>
      <Button
        onClick={handleEditScript}
        variant="default"
        className="w-full"
      >
        <Pencil className="h-4 w-4 mr-2" />
        Edit Script
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/events/${eventTypeSlug}/${event.id}/scripts/${script.id}`} target="_blank">
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </Link>
      </Button>
      <Button
        onClick={handleBackToEvent}
        variant="outline"
        className="w-full"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Event
      </Button>
    </>
  )

  // Export buttons for the sidebar
  const exportButtons = (
    <>
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/events/${eventTypeSlug}/${event.id}/scripts/${script.id}/export/pdf`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/events/${eventTypeSlug}/${event.id}/scripts/${script.id}/export/docx`}>
          <FileDown className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/events/${eventTypeSlug}/${event.id}/scripts/${script.id}/export/txt`}>
          <File className="h-4 w-4 mr-2" />
          Download Text
        </Link>
      </Button>
    </>
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
