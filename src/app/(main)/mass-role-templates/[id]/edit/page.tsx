import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassRoleTemplate } from '@/lib/actions/mass-role-templates'
import { MassRoleTemplateFormWrapper } from '../../mass-role-template-form-wrapper'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMassRoleTemplatePage({ params }: PageProps) {
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
    { label: template.name, href: `/mass-role-templates/${template.id}` },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassRoleTemplateFormWrapper
        template={template}
        title={`Edit: ${template.name}`}
        description="Update the Mass role template details and configuration"
        breadcrumbs={breadcrumbs}
      />
    </>
  )
}
