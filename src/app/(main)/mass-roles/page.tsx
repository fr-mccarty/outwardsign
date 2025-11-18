import { getMassRoles } from "@/lib/actions/mass-roles"
import { MassRolesListClient } from "./mass-roles-list-client"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserParishRole } from "@/lib/auth/permissions"
import { getSelectedParishId } from "@/lib/auth/parish"

interface PageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function MassRolesPage({ searchParams }: PageProps) {
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

  // Get search params
  const params = await searchParams
  const search = params.search || ""

  // Fetch mass roles
  const massRoles = await getMassRoles()

  // Filter mass roles by search (client-side for simplicity since we load all)
  const filteredRoles = search
    ? massRoles.filter(role =>
        role.name.toLowerCase().includes(search.toLowerCase()) ||
        role.description?.toLowerCase().includes(search.toLowerCase())
      )
    : massRoles

  return <MassRolesListClient massRoles={filteredRoles} userParish={userParish} />
}
