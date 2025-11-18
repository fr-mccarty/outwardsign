import { getMassRole } from "@/lib/actions/mass-roles"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { MassRoleViewClient } from "./mass-role-view-client"
import { getUserParishRole } from "@/lib/auth/permissions"
import { getSelectedParishId } from "@/lib/auth/parish"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MassRoleViewPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get selected parish
  const parishId = await getSelectedParishId()
  if (!parishId) {
    redirect('/select-parish')
  }

  // Get user's parish role for permissions
  const userParish = await getUserParishRole(user.id, parishId)
  if (!userParish) {
    redirect('/select-parish')
  }

  // Get params
  const { id } = await params

  // Fetch mass role
  const massRole = await getMassRole(id)
  if (!massRole) notFound()

  return (
    <MassRoleViewClient
      massRole={massRole}
      userParish={userParish}
    />
  )
}
