"use client"

import { useState } from "react"
import { MassRole } from "@/lib/types"
import { PageContainer } from "@/components/page-container"
import { ModuleSaveButton } from "@/components/module-save-button"
import { ModuleViewButton } from "@/components/module-view-button"
import { MassRoleForm } from "./mass-role-form"
import { BreadcrumbSetter } from "@/components/breadcrumb-setter"

interface MassRoleFormWrapperProps {
  massRole?: MassRole
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

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Mass Role" href={`/mass-roles/${massRole.id}`} />
      )}
      <ModuleSaveButton moduleName="Mass Role" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PageContainer
        title={title}
        description={description}
        actions={actions}
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
