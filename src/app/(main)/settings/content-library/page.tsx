import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ContentLibraryList } from './content-library-list'
import { getContents } from '@/lib/actions/contents'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  searchParams: Promise<{
    search?: string
    language?: string
    page?: string
  }>
}

export default async function ContentLibraryPage({ searchParams }: PageProps) {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()
  const params = await searchParams

  // Parse search params
  const search = params.search || ''
  const language = params.language as 'en' | 'es' | undefined
  const page = parseInt(params.page || '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  // Fetch contents with filters
  const result = await getContents({
    search: search || undefined,
    language,
    limit,
    offset,
  })

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.contentLibrary') },
  ]

  return (
    <PageContainer
      title={t('settings.contentLibrary')}
      description={t('settings.contentLibraryDescription')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ContentLibraryList
        initialContents={result.items}
        initialTotalCount={result.totalCount}
        initialPage={page}
      />
    </PageContainer>
  )
}
