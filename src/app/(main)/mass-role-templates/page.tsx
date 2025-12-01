import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getMassRoleTemplates } from "@/lib/actions/mass-role-templates"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassRoleTemplatesListClient } from './mass-role-templates-list-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function MassRoleTemplatesPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Fetch templates server-side
  const templates = await getMassRoleTemplates()

  // Apply search filter on server
  const searchQuery = params.search?.toLowerCase() || ''
  const filteredTemplates = searchQuery
    ? templates.filter(template =>
        template.name.toLowerCase().includes(searchQuery) ||
        template.description?.toLowerCase().includes(searchQuery)
      )
    : templates

  const stats = {
    total: templates.length,
    filtered: filteredTemplates.length,
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Masses", href: "/masses" },
    { label: "Role Templates" }
  ]

  return (
    <PageContainer
      title="Mass Role Templates"
      description="Manage role assignment templates for different Mass types."
      primaryAction={<ModuleCreateButton moduleName="Template" href="/mass-role-templates/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassRoleTemplatesListClient initialData={filteredTemplates} stats={stats} />
    </PageContainer>
  )
}
