import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { PageContainer } from '@/components/page-container'
import { getTranslations } from 'next-intl/server'
import { ScriptStructureClient } from './script-structure-client'
import {
  getScriptWithSectionsForDebug,
  getFieldDefinitionsForEventType,
  getContentItemsForEventTypeSerializable
} from '@/lib/actions/developer-tools'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ScriptStructurePage({ params }: PageProps) {
  const t = await getTranslations()
  const supabase = await createClient()
  const { id } = await params

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get script with sections
  const script = await getScriptWithSectionsForDebug(id)

  if (!script) {
    notFound()
  }

  // Get field definitions and content items for this event type
  const [fieldDefinitions, contentItems] = await Promise.all([
    getFieldDefinitionsForEventType(script.event_type_id),
    getContentItemsForEventTypeSerializable(script.event_type_id)
  ])

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.developerTools.title'), href: '/settings/developer-tools' },
    { label: script.name }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PageContainer
        title={`Script: ${script.name}`}
        description={`Structure view for ${script.event_type.name} - ${script.name}`}
      >
        <ScriptStructureClient
          script={script}
          fieldDefinitions={fieldDefinitions}
          contentItems={contentItems}
        />
      </PageContainer>
    </>
  )
}
