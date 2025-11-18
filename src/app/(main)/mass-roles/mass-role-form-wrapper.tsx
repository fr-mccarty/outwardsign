"use client"

import { useState } from "react"
import { MassRole } from "@/lib/types"
import { PageContainer } from "@/components/page-container"
import { MassRoleForm } from "./mass-role-form"
import { BreadcrumbSetter } from "@/components/breadcrumb-setter"

interface MassRoleFormWrapperProps {
  massRole?: MassRole
  breadcrumbs: { href?: string; label: string }[]
}

export function MassRoleFormWrapper({ massRole, breadcrumbs }: MassRoleFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!massRole

  const title = isEditing ? `Edit ${massRole.name}` : "Create New Mass Role"
  const description = isEditing
    ? "Update this mass role definition"
    : "Define a new liturgical role for Mass celebrations"

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PageContainer
        title={title}
        description={description}
      >
        <MassRoleForm
          massRole={massRole}
          formId="mass-role-form"
          onLoadingChange={setIsLoading}
        />
      </PageContainer>
    </>
  )
}
