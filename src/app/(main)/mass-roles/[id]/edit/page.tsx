import { getMassRole } from "@/lib/actions/mass-roles"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { MassRoleFormWrapper } from "../../mass-role-form-wrapper"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMassRolePage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get params
  const { id } = await params

  // Fetch mass role
  const massRole = await getMassRole(id)
  if (!massRole) notFound()

  return (
    <MassRoleFormWrapper
      massRole={massRole}
      breadcrumbs={[
        { href: "/dashboard", label: "Dashboard" },
        { href: "/mass-roles", label: "Mass Roles" },
        { href: `/mass-roles/${id}`, label: massRole.name },
        { label: "Edit" }
      ]}
    />
  )
}
