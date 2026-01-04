import { getCurrentParish } from '@/lib/auth/parish'
import { getAuditLogs, getAuditedTableNames } from '@/lib/actions/audit-logs'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ActivityLogClient } from './activity-log-client'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    table_name?: string
    operation?: string
    source?: string
    date_from?: string
    date_to?: string
    page?: string
  }>
}

export default async function ActivityLogPage({ searchParams }: PageProps) {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()
  const params = await searchParams

  // Get current parish
  const parish = await getCurrentParish()
  if (!parish) {
    redirect('/dashboard')
  }

  // Parse page number
  const page = parseInt(params.page || '1', 10)
  const limit = 50
  const offset = (page - 1) * limit

  // Build filters from search params
  const filters = {
    table_name: params.table_name,
    operation: params.operation as 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE' | undefined,
    source: params.source,
    date_from: params.date_from,
    date_to: params.date_to,
    offset,
    limit,
  }

  // Load audit logs and table names in parallel
  const [auditLogsResult, tableNames] = await Promise.all([
    getAuditLogs(filters),
    getAuditedTableNames(),
  ])

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.parishSettings'), href: '/settings/parish/general' },
    { label: 'Activity Log' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ActivityLogClient
        initialLogs={auditLogsResult}
        tableNames={tableNames}
        currentFilters={filters}
        currentPage={page}
      />
    </>
  )
}
