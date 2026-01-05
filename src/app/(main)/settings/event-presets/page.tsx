import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DescriptionWithDocLink } from '@/components/description-with-doc-link'
import { EventPresetsList } from './event-presets-list'
import { NewPresetButton } from './new-preset-button'
import { getAllPresets } from '@/lib/actions/event-presets'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  searchParams: Promise<{
    search?: string
    event_type?: string
  }>
}

export default async function EventPresetsPage({ searchParams }: PageProps) {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()
  const params = await searchParams

  // Fetch all presets
  const allPresets = await getAllPresets()

  // Apply filters
  const search = params.search?.toLowerCase() || ''
  const eventTypeFilter = params.event_type || ''

  let filteredPresets = allPresets

  // Filter by search
  if (search) {
    filteredPresets = filteredPresets.filter(
      (preset) =>
        preset.name.toLowerCase().includes(search) ||
        preset.description?.toLowerCase().includes(search) ||
        preset.event_type.name.toLowerCase().includes(search)
    )
  }

  // Filter by event type
  if (eventTypeFilter) {
    filteredPresets = filteredPresets.filter(
      (preset) => preset.event_type_id === eventTypeFilter
    )
  }

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.eventPresets') },
  ]

  return (
    <PageContainer
      title={t('settings.eventPresets')}
      description={
        <DescriptionWithDocLink
          description={t('settings.eventPresetsDescription')}
          href="/docs/settings"
        />
      }
      primaryAction={<NewPresetButton />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventPresetsList
        presets={filteredPresets}
        allPresets={allPresets}
      />
    </PageContainer>
  )
}
