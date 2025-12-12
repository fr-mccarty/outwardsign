'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getEventWithRelations } from '@/lib/actions/dynamic-events'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { processScriptForRendering } from '@/lib/utils/markdown-processor'
import type { DynamicEventWithRelations, ScriptWithSections } from '@/lib/types'

interface PrintScriptPageProps {
  params: Promise<{
    event_type_id: string
    event_id: string
    script_id: string
  }>
}

export default function PrintScriptPage({ params }: PrintScriptPageProps) {
  const [event, setEvent] = useState<DynamicEventWithRelations | null>(null)
  const [script, setScript] = useState<ScriptWithSections | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const { event_type_id: typeSlug, event_id, script_id } = await params

      if (!event_id || !script_id) {
        setError('Missing event or script ID')
        setLoading(false)
        return
      }

      try {
        // Fetch event with relations
        const eventData = await getEventWithRelations(event_id)
        if (!eventData) {
          setError('Event not found')
          setLoading(false)
          return
        }

        // Verify event belongs to correct event type slug
        if (eventData.event_type.slug !== typeSlug) {
          setError('Event type mismatch')
          setLoading(false)
          return
        }

        // Fetch script with sections
        const scriptData = await getScriptWithSections(script_id)
        if (!scriptData) {
          setError('Script not found')
          setLoading(false)
          return
        }

        // Verify script belongs to event's event type
        if (scriptData.event_type_id !== eventData.event_type_id) {
          setError('Script does not belong to this event type')
          setLoading(false)
          return
        }

        setEvent(eventData)
        setScript(scriptData)
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load script for printing')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params])

  const handlePrint = () => {
    window.print()
  }

  const handleClose = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="hide-on-print">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="text-gray-600">Loading script for printing...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !event || !script) {
    return (
      <div>
        <div className="print-preview-notice hide-on-print" style={{ background: '#ffebee', borderColor: '#f44336', color: '#c62828' }}>
          {error || 'Script not found'}
        </div>
        <div className="print-actions hide-on-print">
          <Button variant="outline" onClick={handleClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    )
  }

  // Process all sections using shared markdown processor
  const processedSections = processScriptForRendering(script, event)

  return (
    <>
      {/* Print Actions - Hidden on Print */}
      <div className="print-actions hide-on-print">
        <Button variant="outline" onClick={handleClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Script Content */}
      <div>
        {/* Script Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black">{script.name}</h1>
        </div>

        {/* Sections */}
        {processedSections.map((section) => (
          <div
            key={section.id}
            className={`reading-section ${section.pageBreakAfter ? 'page-break' : ''}`}
          >
            {section.name && (
              <div className="reading-title text-black">{section.name}</div>
            )}
            <div
              className="reading-text text-black prose max-w-none"
              dangerouslySetInnerHTML={{ __html: section.htmlContent }}
            />
          </div>
        ))}
      </div>
    </>
  )
}
