"use client"

import { MassRoleWithRelations } from "@/lib/actions/mass-roles"
import { ModuleViewContainer } from "@/components/module-view-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/content-card"
import { Edit, Users, Printer, FileText, Download } from "lucide-react"
import { ActiveInactiveBadge } from "@/components/active-inactive-badge"
import { canAccessModule, type UserParishRole } from "@/lib/auth/permissions-client"
import { deleteMassRole } from "@/lib/actions/mass-roles"
import Link from "next/link"

interface MassRoleViewClientProps {
  massRole: MassRoleWithRelations
  userParish: UserParishRole
}

export function MassRoleViewClient({ massRole, userParish }: MassRoleViewClientProps) {
  const canManage = canAccessModule(userParish, "masses")

  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    return `${massRole.name.replace(/\s+/g, '-')}-Members.${extension}`
  }

  // Generate action buttons for the side panel
  const actionButtons = canManage ? (
    <>
      <Button asChild className="w-full">
        <Link href={`/settings/mass-configuration/role-definitions/${massRole.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Mass Role
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/mass-roles/${massRole.id}`} target="_blank">
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </Link>
      </Button>
    </>
  ) : undefined

  // Generate export buttons
  const exportButtons = (
    <>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/mass-roles/${massRole.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/mass-roles/${massRole.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate details section content
  const details = (
    <>
      <div>
        <span className="font-medium">Status:</span>
        <div className="mt-1">
          <ActiveInactiveBadge isActive={massRole.is_active} showLabel />
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
    </>
  )

  // Separate active and inactive members
  const activeMembers = massRole.mass_role_members.filter(m => m.active)
  const inactiveMembers = massRole.mass_role_members.filter(m => !m.active)

  return (
    <ModuleViewContainer
      entity={massRole}
      entityType="Mass Role"
      modulePath="mass-roles"
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      details={details}
      onDelete={canManage ? deleteMassRole : undefined}
    >
      <div className="space-y-6">
        {/* Role Information */}
        <Card>
          <CardHeader>
            <CardTitle>Mass Role Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Role Name</div>
              <div className="mt-1 text-lg font-semibold">{massRole.name}</div>
            </div>
            {massRole.description && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Description</div>
                <div className="mt-1">{massRole.description}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members List - Cover Page Style */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({activeMembers.length} active)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {massRole.mass_role_members.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No members assigned to this role yet</p>
                {canManage && (
                  <p className="text-sm mt-2">
                    Edit this role to add members
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Members */}
                {activeMembers.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Active Members
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {member.person.full_name}
                            </div>
                            {member.person.email && (
                              <div className="text-sm text-muted-foreground">
                                {member.person.email}
                              </div>
                            )}
                            {member.person.phone_number && (
                              <div className="text-sm text-muted-foreground">
                                {member.person.phone_number}
                              </div>
                            )}
                          </div>
                          <Badge variant={member.membership_type === 'LEADER' ? 'default' : 'secondary'}>
                            {member.membership_type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inactive Members */}
                {inactiveMembers.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Inactive Members
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {inactiveMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 opacity-60"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {member.person.full_name}
                            </div>
                            {member.person.email && (
                              <div className="text-sm text-muted-foreground">
                                {member.person.email}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline">
                            {member.membership_type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleViewContainer>
  )
}
