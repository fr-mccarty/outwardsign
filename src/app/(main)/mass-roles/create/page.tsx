import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MassRoleFormWrapper } from "../mass-role-form-wrapper"

export default async function CreateMassRolePage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <MassRoleFormWrapper
      breadcrumbs={[
        { href: "/dashboard", label: "Dashboard" },
        { href: "/mass-roles", label: "Mass Roles" },
        { label: "Create" }
      ]}
    />
  )
}
