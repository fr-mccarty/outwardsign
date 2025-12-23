import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassWithRelations } from '@/lib/actions/mass-liturgies'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { MassLiturgyScriptViewClient } from './mass-liturgy-script-view-client'
import { getMassPageTitle } from '@/lib/utils/formatters'

interface PageProps {
  params: Promise<{
    id: string
    script_id: string
  }>
}

export default async function ViewMassScriptPage({ params }: PageProps) {
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

  // Build dynamic title
  const massTitle = getMassPageTitle(mass)
  const title = `${script.name} - ${massTitle}`

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Masses", href: "/mass-liturgies" },
    { label: massTitle, href: `/mass-liturgies/${massId}` },
    { label: script.name }
  ]

  return (
    <PageContainer
      title={title}
      description={`View and export ${script.name.toLowerCase()} for this Mass.`}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassLiturgyScriptViewClient mass={mass} script={script} />
    </PageContainer>
  )
}
