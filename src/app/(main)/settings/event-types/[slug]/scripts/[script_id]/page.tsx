import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEventTypeBySlug } from '@/lib/actions/event-types'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'
import { ScriptBuilderClient } from './script-builder-client'

interface ScriptBuilderPageProps {
  params: Promise<{ slug: string; script_id: string }>
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
  const { slug, script_id } = await params

  // Fetch event type by slug
  const eventType = await getEventTypeBySlug(slug)
  if (!eventType) {
    notFound()
  }

  const script = await getScriptWithSections(script_id)
  if (!script) {
    notFound()
  }

  // Verify script belongs to this event type
  if (script.event_type_id !== eventType.id) {
    notFound()
  }

  const inputFields = await getInputFieldDefinitions(eventType.id)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Event Types', href: '/settings/event-types' },
    { label: eventType.name, href: `/settings/event-types/${eventType.slug}` },
    { label: 'Scripts', href: `/settings/event-types/${eventType.slug}/scripts` },
    {
      label: script.name,
      href: `/settings/event-types/${eventType.slug}/scripts/${script_id}`,
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
