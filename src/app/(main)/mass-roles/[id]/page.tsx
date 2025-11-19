import { getMassRole } from "@/lib/actions/mass-roles"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { MassRoleViewClient } from "./mass-role-view-client"
import { getUserParishRole } from "@/lib/auth/permissions"
import { getSelectedParishId } from "@/lib/auth/parish"
import { PageContainer } from "@/components/page-container"
import { BreadcrumbSetter } from "@/components/breadcrumb-setter"

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

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Masses", href: "/masses" },
    { label: "Mass Roles", href: "/mass-roles" },
    { label: massRole.name }
  ]

  return (
    <PageContainer
      title={massRole.name}
      description="View and manage Mass role details."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassRoleViewClient
        massRole={massRole}
        userParish={userParish}
      />
    </PageContainer>
  )
}
