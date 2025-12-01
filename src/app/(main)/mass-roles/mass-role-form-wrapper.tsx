"use client"

import { useState } from "react"
import { PageContainer } from "@/components/page-container"
import { ModuleSaveButton } from "@/components/module-save-button"
import { MassRoleForm } from "./mass-role-form"
import { BreadcrumbSetter } from "@/components/breadcrumb-setter"
import { MassRoleWithRelations } from "@/lib/actions/mass-roles"

interface MassRoleFormWrapperProps {
  massRole?: MassRoleWithRelations
  breadcrumbs: { href?: string; label: string }[]
}

export function MassRoleFormWrapper({ massRole, breadcrumbs }: MassRoleFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!massRole
  const formId = "mass-role-form"

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
        primaryAction={<ModuleSaveButton moduleName="Mass Role" isLoading={isLoading} isEditing={isEditing} form={formId} />}
        additionalActions={isEditing ? [
          {
            type: 'action',
            label: 'View Mass Role',
            href: `/mass-roles/${massRole.id}`
          }
        ] : undefined}
      >
        <MassRoleForm
          massRole={massRole}
          formId={formId}
          onLoadingChange={setIsLoading}
        />
      </PageContainer>
    </>
  )
}
