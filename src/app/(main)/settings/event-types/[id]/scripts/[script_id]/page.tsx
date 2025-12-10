import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEventType } from '@/lib/actions/event-types'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'
import { ScriptBuilderClient } from './script-builder-client'

interface ScriptBuilderPageProps {
  params: Promise<{ id: string; script_id: string }>
}

export default async function ScriptBuilderPage({
  params,
}: ScriptBuilderPageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Await params (Next.js 15 requirement)
  const { id, script_id } = await params

  // Fetch event type, script with sections, and input field definitions
  const eventType = await getEventType(id)
  if (!eventType) {
    notFound()
  }

  const script = await getScriptWithSections(script_id)
  if (!script) {
    notFound()
  }

  // Verify script belongs to this event type
  if (script.event_type_id !== id) {
    notFound()
  }

  const inputFields = await getInputFieldDefinitions(id)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Event Types', href: '/settings/event-types' },
    { label: eventType.name, href: `/settings/event-types/${id}` },
    { label: 'Scripts', href: `/settings/event-types/${id}/scripts` },
    {
      label: script.name,
      href: `/settings/event-types/${id}/scripts/${script_id}`,
    },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ScriptBuilderClient
        eventType={eventType}
        script={script}
        inputFields={inputFields}
      />
    </>
  )
}
