import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassRoleTemplate } from '@/lib/actions/mass-role-templates'
import { MassRoleTemplateViewClient } from './mass-role-template-view-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewMassRoleTemplatePage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const template = await getMassRoleTemplate(id)

  if (!template) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Masses", href: "/masses" },
    { label: "Role Templates", href: "/mass-role-templates" },
    { label: template.name }
  ]

  return (
    <PageContainer
      title={`${template.name}-Template`}
      description="View and manage Mass role template details."
      maxWidth="7xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassRoleTemplateViewClient template={template} />
    </PageContainer>
  )
}
