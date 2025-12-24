import { notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEventTypeWithRelationsBySlug } from '@/lib/actions/event-types'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { SectionForm } from '../section-form'

interface PageProps {
  params: Promise<{
    slug: string
    scriptId: string
  }>
}

export default async function CreateSectionPage({ params }: PageProps) {
  await checkSettingsAccess()

  const { slug, scriptId } = await params
  const t = await getTranslations()

  const eventType = await getEventTypeWithRelationsBySlug(slug)
  if (!eventType) {
    notFound()
  }

  const script = await getScriptWithSections(scriptId)
  if (!script) {
    notFound()
  }

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
    { label: script.name, href: `/settings/event-types/${slug}/scripts/${scriptId}` },
    { label: t('eventType.scripts.sections.addSection') },
  ]

  const backUrl = `/settings/event-types/${slug}/scripts/${scriptId}`

  return (
    <PageContainer
      title={t('eventType.scripts.sections.addSection')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <SectionForm
        scriptId={scriptId}
        inputFields={eventType.input_field_definitions || []}
        backUrl={backUrl}
      />
    </PageContainer>
  )
}
