import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassRoleTemplateFormWrapper } from '../mass-role-template-form-wrapper'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'

export default async function CreateMassRoleTemplatePage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Masses", href: "/masses" },
    { label: "Role Templates", href: "/mass-role-templates" },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassRoleTemplateFormWrapper
        title="Create Mass Role Template"
        description="Define a new template for Mass role assignments"
        breadcrumbs={breadcrumbs}
      />
    </>
  )
}
