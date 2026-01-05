import { Plus } from 'lucide-react'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DescriptionWithDocLink } from '@/components/description-with-doc-link'
import { ContentLibraryList } from './content-library-list'
import { getContents } from '@/lib/actions/contents'
import { getContentTags } from '@/lib/actions/content-tags'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/link-button'

interface PageProps {
  searchParams: Promise<{
    search?: string
    language?: string
    tags?: string
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
  const tagSlugs = params.tags ? params.tags.split(',') : []
  const page = parseInt(params.page || '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  // Fetch contents and tags in parallel
  const [result, allTags] = await Promise.all([
    getContents({
      search: search || undefined,
      language,
      tag_slugs: tagSlugs.length > 0 ? tagSlugs : undefined,
      limit,
      offset,
    }),
    getContentTags('sort_order')
  ])

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.contentLibrary') },
  ]

  return (
    <PageContainer
      title={t('settings.contentLibrary')}
      description={
        <DescriptionWithDocLink
          description={t('settings.contentLibraryDescription')}
          href="/docs/settings#content"
        />
      }
      primaryAction={
        <LinkButton href="/settings/content-library/create">
          <Plus className="h-4 w-4 mr-2" />
          {t('settings.createContent')}
        </LinkButton>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ContentLibraryList
        initialContents={result.items}
        initialTotalCount={result.totalCount}
        initialPage={page}
        allTags={allTags}
      />
    </PageContainer>
  )
}
