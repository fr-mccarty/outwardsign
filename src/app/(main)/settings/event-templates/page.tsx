import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { EventTemplatesList } from './event-templates-list'
import { getAllTemplates } from '@/lib/actions/master-event-templates'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  searchParams: Promise<{
    search?: string
    event_type?: string
  }>
}

export default async function EventTemplatesPage({ searchParams }: PageProps) {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()
  const params = await searchParams

  // Fetch all templates
  const allTemplates = await getAllTemplates()

  // Apply filters
  const search = params.search?.toLowerCase() || ''
  const eventTypeFilter = params.event_type || ''

  let filteredTemplates = allTemplates

  // Filter by search
  if (search) {
    filteredTemplates = filteredTemplates.filter(
      (template) =>
        template.name.toLowerCase().includes(search) ||
        template.description?.toLowerCase().includes(search) ||
        template.event_type.name.toLowerCase().includes(search)
    )
  }

  // Filter by event type
  if (eventTypeFilter) {
    filteredTemplates = filteredTemplates.filter(
      (template) => template.event_type_id === eventTypeFilter
    )
  }

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.eventTemplates') },
  ]

  return (
    <PageContainer
      title={t('settings.eventTemplates')}
      description={t('settings.eventTemplatesDescription')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventTemplatesList
        templates={filteredTemplates}
        allTemplates={allTemplates}
      />
    </PageContainer>
  )
}
