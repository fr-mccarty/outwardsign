import { notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEventTypeWithRelationsBySlug } from '@/lib/actions/event-types'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { FieldsListClient } from './fields-list-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CustomFieldsPage({ params }: PageProps) {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const { slug } = await params
  const t = await getTranslations()

  // Fetch event type with input field definitions
  const eventType = await getEventTypeWithRelationsBySlug(slug)

  if (!eventType) {
    notFound()
  }

  // Determine parent settings page based on system_type
  const parentPath =
    eventType.system_type === 'mass'
      ? '/settings/masses'
      : eventType.system_type === 'special-liturgy'
        ? '/settings/special-liturgies'
        : '/settings/events'

  const parentLabel =
    eventType.system_type === 'mass'
      ? t('nav.masses')
      : eventType.system_type === 'special-liturgy'
        ? t('nav.specialLiturgies')
        : t('nav.events')

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: parentLabel, href: parentPath },
    { label: eventType.name, href: `/settings/event-types/${slug}` },
    { label: t('eventType.fields.title') },
  ]

  return (
    <PageContainer
      title={`${eventType.name} - ${t('eventType.fields.title')}`}
      description={t('eventType.fields.description')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <FieldsListClient
        eventType={eventType}
        initialFields={eventType.input_field_definitions || []}
      />
    </PageContainer>
  )
}
