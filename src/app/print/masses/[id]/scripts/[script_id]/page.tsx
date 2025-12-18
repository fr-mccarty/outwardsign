import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassWithRelations } from '@/lib/actions/masses'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { DynamicScriptViewer } from '@/components/dynamic-script-viewer'

interface PageProps {
  params: Promise<{
    id: string
    script_id: string
  }>
}

/**
 * Print View for Mass Scripts
 *
 * Displays a Mass script optimized for printing (no navigation, no action buttons)
 */
export default async function PrintMassScriptPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id: massId, script_id: scriptId } = await params

  // Fetch mass with relations
  const mass = await getMassWithRelations(massId)

  if (!mass) {
    notFound()
  }

  // Verify Mass has an event type
  if (!mass.event_type_id) {
    notFound()
  }

  // Fetch script with sections
  const script = await getScriptWithSections(scriptId)

  if (!script) {
    notFound()
  }

  // Verify script belongs to mass's event type
  if (script.event_type_id !== mass.event_type_id) {
    notFound()
  }

  // Convert Mass data to match the MasterEventWithRelations interface expected by DynamicScriptViewer
  // Note: Only resolved_fields and parish are actually used by the script processor
  const eventForProcessing = {
    id: mass.id,
    parish_id: mass.parish_id,
    event_type_id: mass.event_type_id,
    presider_id: mass.presider_id || null,
    homilist_id: mass.homilist_id || null,
    status: 'ACTIVE' as const,
    field_values: mass.field_values || {},
    resolved_fields: mass.resolved_fields || {},
    event_type: {
      ...mass.event_type!,
      role_definitions: mass.event_type?.role_definitions ?? null,
      input_field_definitions: [],  // Not needed for script processing
      scripts: [script]  // Pass the current script
    },
    calendar_events: [],
    roles: [],
    parish: mass.calendar_events?.[0]?.location ? {
      name: 'Parish', // TODO: Get actual parish name if needed
      city: mass.calendar_events[0].location.city || '',
      state: mass.calendar_events[0].location.state || ''
    } : undefined,
    created_at: mass.created_at,
    updated_at: mass.updated_at,
    deleted_at: null
  }

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="max-w-4xl mx-auto p-8">
        {/* Use the existing DynamicScriptViewer component */}
        <DynamicScriptViewer script={script} event={eventForProcessing} />
      </div>
    </div>
  )
}
