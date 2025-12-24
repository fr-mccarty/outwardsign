import { notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEventTypeWithRelationsBySlug } from '@/lib/actions/event-types'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { FieldsListClient } from './fields-list-client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import Link from 'next/link'

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
    { label: t('eventType.fields.title') },
  ]

  return (
    <PageContainer
      title={`${eventType.name} - ${t('eventType.fields.title')}`}
      description={t('eventType.fields.description')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />

      {/* Fields to Scripts explanation */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium mb-1">{t('eventType.fields.howFieldsWork')}</p>
          <p className="text-sm">
            {t('eventType.fields.fieldsToPlaceholders')}
          </p>
          {eventType.system_type === 'special-liturgy' && (
            <p className="mt-2 text-sm">
              <Link href={`/settings/event-types/${slug}/scripts`} className="text-primary underline">
                {t('eventType.fields.configureScripts')} →
              </Link>
            </p>
          )}
        </AlertDescription>
      </Alert>

      <FieldsListClient
        eventType={eventType}
        initialFields={eventType.input_field_definitions || []}
      />
    </PageContainer>
  )
}
