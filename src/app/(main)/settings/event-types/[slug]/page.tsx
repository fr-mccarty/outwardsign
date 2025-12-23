import { notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ContentCard } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { getEventTypeBySlug } from '@/lib/actions/event-types'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft, Settings, FileText } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function EventTypeHubPage({ params }: PageProps) {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const { slug } = await params
  const t = await getTranslations()

  // Fetch event type
  const eventType = await getEventTypeBySlug(slug)

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
    { label: eventType.name },
  ]

  // Show Scripts card only for special-liturgy
  const showScriptsCard = eventType.system_type === 'special-liturgy'

  return (
    <PageContainer
      title={eventType.name}
      description={eventType.description || t('eventType.hub.defaultDescription')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />

      <div className="space-y-6">
        {/* Back button */}
        <div>
          <Button variant="outline" asChild>
            <Link href={parentPath}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
        </div>

        {/* Navigation cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Custom Fields Card */}
          <ContentCard>
            <Link href={`/settings/event-types/${slug}/fields`} className="block group">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Settings className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {t('eventType.hub.customFields.title')}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('eventType.hub.customFields.description')}
                </p>
              </div>
            </Link>
          </ContentCard>

          {/* Scripts Card (only for special liturgies) */}
          {showScriptsCard && (
            <ContentCard>
              <Link href={`/settings/event-types/${slug}/scripts`} className="block group">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {t('eventType.hub.scripts.title')}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('eventType.hub.scripts.description')}
                  </p>
                </div>
              </Link>
            </ContentCard>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
