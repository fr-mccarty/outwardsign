import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DescriptionWithDocLink } from '@/components/description-with-doc-link'
import { getPetitionTemplates, ensureDefaultContexts } from '@/lib/actions/petition-templates'
import PetitionTemplateList from './petition-template-list'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function PetitionSettingsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  // Ensure initial contexts are created
  await ensureDefaultContexts()
  const templates = await getPetitionTemplates()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.petitionSettings') },
  ]

  return (
    <PageContainer
      title={t('settings.petitionSettings')}
      description={
        <DescriptionWithDocLink
          description={t('settings.petitionSettingsDescription')}
          href="/docs/settings#mass"
        />
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PetitionTemplateList templates={templates} />
    </PageContainer>
  )
}
