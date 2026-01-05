import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { PermissionsEditorClient } from './permissions-editor-client'
import { PageContainer } from '@/components/page-container'
import { getTranslations } from 'next-intl/server'
import { checkIsDeveloper } from '@/lib/auth/developer'
import { getToolPermissions } from '@/lib/actions/ai-tools-permissions'

export const dynamic = 'force-dynamic'

export default async function PermissionsEditorPage() {
  const t = await getTranslations()

  // Only available in local development
  if (process.env.NODE_ENV !== 'development') {
    redirect('/settings')
  }

  // Check developer access - redirects if not a developer
  const { isDeveloper } = await checkIsDeveloper()
  if (!isDeveloper) {
    redirect('/settings')
  }

  // Get current permissions
  const result = await getToolPermissions()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.developerTools.title'), href: '/settings/developer-tools' },
    { label: 'Tool Permissions' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PageContainer
        title="AI Tool Permissions"
        description="Configure which consumers can access each tool and what scope is required. Changes are saved locally and must be committed and pushed to take effect in production."
      >
        {result.success && result.data ? (
          <PermissionsEditorClient
            initialPermissions={result.data}
            lastUpdated={result.lastUpdated}
          />
        ) : (
          <div className="text-destructive">
            Failed to load permissions: {result.error}
          </div>
        )}
      </PageContainer>
    </>
  )
}
