"use client"

import { MassRole } from "@/lib/types"
import { ModuleViewContainer } from "@/components/module-view-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Edit } from "lucide-react"
import { canAccessModule, type UserParishRole } from "@/lib/auth/permissions-client"
import { deleteMassRole } from "@/lib/actions/mass-roles"
import Link from "next/link"

interface MassRoleViewClientProps {
  massRole: MassRole
  userParish: UserParishRole
}

export function MassRoleViewClient({ massRole, userParish }: MassRoleViewClientProps) {
  const canManage = canAccessModule(userParish, "masses")

  // Generate action buttons for the side panel
  const actionButtons = canManage ? (
    <Button asChild className="w-full">
      <Link href={`/mass-roles/${massRole.id}/edit`}>
        <Edit className="h-4 w-4 mr-2" />
        Edit Mass Role
      </Link>
    </Button>
  ) : undefined

  // Generate details section content
  const details = (
    <>
      <div>
        <span className="font-medium">Status:</span>
        <div className="mt-1">
          <Badge variant={massRole.is_active ? "default" : "secondary"}>
            {massRole.is_active ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
        </div>
      </div>
      {massRole.description && (
        <div className="pt-2 border-t">
          <span className="font-medium">Description:</span>
          <p className="text-sm text-muted-foreground mt-1">{massRole.description}</p>
        </div>
      )}
      {massRole.note && (
        <div className={massRole.description ? "pt-2 border-t" : ""}>
          <span className="font-medium">Notes:</span>
          <p className="text-sm text-muted-foreground mt-1">{massRole.note}</p>
        </div>
      )}
      {(massRole.display_order !== null && massRole.display_order !== undefined) && (
        <div className={(massRole.description || massRole.note) ? "pt-2 border-t" : ""}>
          <span className="font-medium">Display Order:</span>
          <p className="text-sm text-muted-foreground mt-1">{massRole.display_order}</p>
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={massRole}
      entityType="Mass Role"
      modulePath="mass-roles"
      actionButtons={actionButtons}
      details={details}
      onDelete={canManage ? deleteMassRole : undefined}
    >
      <Card>
        <CardHeader>
          <CardTitle>Mass Role Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Role Name</div>
            <div className="mt-1 text-lg font-semibold">{massRole.name}</div>
          </div>
        </CardContent>
      </Card>
    </ModuleViewContainer>
  )
}
