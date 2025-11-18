"use client"

import { MassRole } from "@/lib/types"
import { PageContainer } from "@/components/page-container"
import { MassRoleFormActions } from "./mass-role-form-actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { canAccessModule, type UserParishRole } from "@/lib/auth/permissions-client"

interface MassRoleViewClientProps {
  massRole: MassRole
  userParish: UserParishRole
}

export function MassRoleViewClient({ massRole, userParish }: MassRoleViewClientProps) {
  const canManage = canAccessModule(userParish, "masses")

  return (
    <PageContainer
      title={massRole.name}
      description="Mass role details"
      actions={canManage ? <MassRoleFormActions massRole={massRole} /> : undefined}
    >
      <Card>
        <CardHeader>
          <CardTitle>Mass Role Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Role Name</div>
              <div className="mt-1">{massRole.name}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
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

            <div>
              <div className="text-sm font-medium text-muted-foreground">Display Order</div>
              <div className="mt-1">
                {massRole.display_order !== null && massRole.display_order !== undefined ? massRole.display_order : "—"}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground">Description</div>
            <div className="mt-1">{massRole.description || "—"}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground">Notes</div>
            <div className="mt-1">{massRole.note || "—"}</div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
