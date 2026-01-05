import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DescriptionWithDocLink } from '@/components/description-with-doc-link'
import { getCategoryTagsWithUsageCount } from '@/lib/actions/category-tags'
import { CategoryTagsList } from './category-tags-list'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'

export default async function CategoryTagsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  // Fetch tags with usage count
  const tags = await getCategoryTagsWithUsageCount()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.categoryTags') },
  ]

  return (
    <PageContainer
      title={t('settings.categoryTags')}
      description={
        <DescriptionWithDocLink
          description={t('settings.categoryTagsDescription')}
          href="/docs/settings#content"
        />
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <CategoryTagsList initialTags={tags} />
    </PageContainer>
  )
}
