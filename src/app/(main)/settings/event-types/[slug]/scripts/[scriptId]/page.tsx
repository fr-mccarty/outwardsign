import { notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEventTypeWithRelationsBySlug } from '@/lib/actions/event-types'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { ScriptBuilderClient } from './script-builder-client'

interface PageProps {
  params: Promise<{
    slug: string
    scriptId: string
  }>
}

export default async function ScriptBuilderPage({ params }: PageProps) {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const { slug, scriptId } = await params
  const t = await getTranslations()

  // Fetch event type
  const eventType = await getEventTypeWithRelationsBySlug(slug)

  if (!eventType) {
    notFound()
  }

  // Fetch script with sections
  const script = await getScriptWithSections(scriptId)

  if (!script) {
    notFound()
  }

  // Determine parent settings page based on system_type
  const parentPath =
    eventType.system_type === 'mass-liturgy'
      ? '/settings/mass-liturgies'
      : eventType.system_type === 'special-liturgy'
        ? '/settings/special-liturgies'
        : '/settings/events'

  const parentLabel =
    eventType.system_type === 'mass-liturgy'
      ? t('nav.masses')
      : eventType.system_type === 'special-liturgy'
        ? t('nav.specialLiturgies')
        : t('nav.events')

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: parentLabel, href: parentPath },
    { label: eventType.name, href: `/settings/event-types/${slug}` },
    { label: t('eventType.scripts.title'), href: `/settings/event-types/${slug}/scripts` },
    { label: script.name },
  ]

  return (
    <PageContainer
      title={script.name}
      description={script.description || undefined}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ScriptBuilderClient
        script={script}
        eventType={eventType}
        inputFields={eventType.input_field_definitions || []}
      />
    </PageContainer>
  )
}
