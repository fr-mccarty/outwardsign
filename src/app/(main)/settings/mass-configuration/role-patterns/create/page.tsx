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
    { label: "Settings", href: "/settings" },
    { label: "Mass Configuration", href: "/settings/mass-configuration" },
    { label: "Role Patterns", href: "/settings/mass-configuration/role-patterns" },
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
