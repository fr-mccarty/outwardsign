import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DescriptionWithDocLink } from '@/components/description-with-doc-link'
import { TemplateBrowserClient } from './template-browser-client'
import { PageContainer } from '@/components/page-container'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function TemplateBrowserPage() {
  const t = await getTranslations()
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: 'Template Browser' }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PageContainer
        title="Template Structure Browser"
        description={
          <DescriptionWithDocLink
            description="Browse event types, scripts, and sections to understand template structure and troubleshoot placeholder issues."
            href="/docs/template-browser"
          />
        }
      >
        <TemplateBrowserClient />
      </PageContainer>
    </>
  )
}
