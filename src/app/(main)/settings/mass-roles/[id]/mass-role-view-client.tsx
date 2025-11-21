'use client'

import { ModuleViewContainer } from '@/components/module-view-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Pencil } from 'lucide-react'
import { deleteMassRole, MassRoleWithRelations } from '@/lib/actions/mass-roles'
import { formatPersonName } from '@/lib/utils/formatters'
import Link from 'next/link'

interface MassRoleViewClientProps {
  massRole: MassRoleWithRelations
}

export function MassRoleViewClient({ massRole }: MassRoleViewClientProps) {
  const activeMembers = massRole.mass_role_members?.filter(m => m.active) || []
  const inactiveMembers = massRole.mass_role_members?.filter(m => !m.active) || []

  const actionButtons = (
    <Button asChild className="w-full">
      <Link href={`/settings/mass-roles/${massRole.id}/edit`}>
        <Pencil className="h-4 w-4 mr-2" />
        Edit Mass Role
      </Link>
    </Button>
  )

  return (
    <>
      <ModuleViewContainer
        entity={massRole}
        entityType="Mass Role"
        modulePath="settings/mass-roles"
        actionButtons={actionButtons}
        onDelete={deleteMassRole}
      >
        {/* Mass Role Details */}
        <Card>
          <CardHeader>
            <CardTitle>Mass Role Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Name</div>
              <div>{massRole.name}</div>
            </div>

            {massRole.description && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
                <div>{massRole.description}</div>
              </div>
            )}

            {massRole.note && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Note</div>
                <div className="text-sm">{massRole.note}</div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                <ActiveInactiveBadge isActive={massRole.is_active} />
              </div>

              {massRole.display_order !== null && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Display Order</div>
                  <div>{massRole.display_order}</div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/print/mass-roles/${massRole.id}`, '_blank')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Print Member List
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/api/mass-roles/${massRole.id}/report`, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Members ({activeMembers.length})
            </CardTitle>
            <Button
              size="sm"
              onClick={() => router.push(`/settings/mass-roles/${massRole.id}/edit`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Manage Members
            </Button>
          </CardHeader>
          <CardContent>
            {activeMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active members assigned to this role yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push(`/settings/mass-roles/${massRole.id}/edit`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Members
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-start justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/people/${member.person_id}`}
                          className="font-medium hover:underline"
                        >
                          {formatPersonName(member.person)}
                        </Link>
                        <Badge variant={member.membership_type === 'LEADER' ? 'default' : 'secondary'}>
                          {member.membership_type}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        {member.person.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {member.person.email}
                          </div>
                        )}
                        {member.person.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {member.person.phone_number}
                          </div>
                        )}
                        {member.notes && (
                          <div className="text-xs italic mt-1">
                            Note: {member.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inactive Members */}
        {inactiveMembers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground">
                Inactive Members ({inactiveMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inactiveMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-start justify-between p-3 rounded-lg border bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/people/${member.person_id}`}
                          className="font-medium hover:underline opacity-60"
                        >
                          {formatPersonName(member.person)}
                        </Link>
                        <Badge variant="outline">
                          {member.membership_type}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground opacity-60">
                        {member.person.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {member.person.email}
                          </div>
                        )}
                        {member.person.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {member.person.phone_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </ModuleViewContainer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Mass Role"
        itemName={massRole.name}
        description="Are you sure you want to delete this mass role? This action cannot be undone. This role cannot be deleted if it is being used in templates or assigned to masses."
        onConfirm={handleDelete}
      />
    </>
  )
}
