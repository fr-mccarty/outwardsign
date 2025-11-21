'use client'

import { useEffect, useState } from 'react'
import { PageContainer } from "@/components/page-container"
import { Loading } from '@/components/loading'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ActiveInactiveBadge } from "@/components/active-inactive-badge"
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { UserPlus, User, Trash2, Users, Edit } from "lucide-react"
import { getGroup, removeGroupMember, type GroupWithMembers, type GroupMember } from '@/lib/actions/groups'
import { getMassRoles } from '@/lib/actions/mass-roles'
import type { MassRole } from '@/lib/types'
import { GroupFormDialog } from '@/components/groups/group-form-dialog'
import { AddMembershipModal } from '@/components/groups/add-membership-modal'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/language-context'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function GroupDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { language } = useLanguage()
  const [group, setGroup] = useState<GroupWithMembers | null>(null)
  const [massRoles, setMassRoles] = useState<MassRole[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false)
  const [memberBeingEdited, setMemberBeingEdited] = useState<GroupMember | null>(null)
  const [groupId, setGroupId] = useState<string>('')
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const { setBreadcrumbs} = useBreadcrumbs()

  // Helper function to get role label
  const getRoleLabel = (roleName: string) => {
    // Check if it's a mass role
    const massRole = massRoles.find(r => r.name === roleName)
    if (massRole) {
      return massRole.name
    }
    // Otherwise it's a group role, return as-is
    return roleName
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params
        setGroupId(id)

        const [groupData, massRolesData] = await Promise.all([
          getGroup(id),
          getMassRoles()
        ])

        if (!groupData) {
          toast.error('Group not found')
          router.push('/groups')
          return
        }

        setGroup(groupData)
        setMassRoles(massRolesData)

        setBreadcrumbs([
          { label: "Dashboard", href: "/dashboard" },
          { label: "Groups", href: "/groups" },
          { label: groupData.name }
        ])
      } catch (error) {
        console.error('Failed to load group:', error)
        toast.error('Failed to load group')
        router.push('/groups')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params, setBreadcrumbs, router])

  const handleAddMemberSuccess = async () => {
    // Reload group data
    const updatedGroup = await getGroup(groupId)
    if (updatedGroup) {
      setGroup(updatedGroup)
    }
  }

  const handleOpenRemoveDialog = (member: GroupMember) => {
    setMemberToRemove(member)
    setRemoveDialogOpen(true)
  }

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return

    try {
      await removeGroupMember(groupId, memberToRemove.person_id)
      toast.success('Member removed successfully')
      setMemberToRemove(null)

      // Reload group data
      const updatedGroup = await getGroup(groupId)
      if (updatedGroup) {
        setGroup(updatedGroup)
      }
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error('Failed to remove member')
      throw error
    }
  }

  const handleOpenEditMember = (member: GroupMember) => {
    setMemberBeingEdited(member)
    setEditMemberDialogOpen(true)
  }

  const handleEditMemberSuccess = async () => {
    // Reload group data
    const updatedGroup = await getGroup(groupId)
    if (updatedGroup) {
      setGroup(updatedGroup)
    }
    setMemberBeingEdited(null)
  }

  const handleEditSuccess = async (updatedGroupId: string) => {
    // Reload group data after edit
    const updatedGroup = await getGroup(updatedGroupId)
    if (updatedGroup) {
      setGroup(updatedGroup)
      setBreadcrumbs([
        { label: "Dashboard", href: "/dashboard" },
        { label: "Groups", href: "/groups" },
        { label: updatedGroup.name }
      ])
    }
  }

  if (loading) {
    return (
      <PageContainer 
        title="Group Details"
        description="Loading group information..."
      >
        <Loading />
      </PageContainer>
    )
  }

  if (!group) {
    return (
      <PageContainer 
        title="Group Not Found"
        description="The requested group could not be found."
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground">Group not found</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={group.name}
      description={group.description || "Manage group members and their roles"}
    >
      {/* Group Details Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle>{group.name}</CardTitle>
                {!group.is_active && (
                  <ActiveInactiveBadge isActive={group.is_active} language={language} />
                )}
              </div>
              {group.description && (
                <CardDescription>{group.description}</CardDescription>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Group
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Member Management */}
      <div className="flex items-center justify-between mb-4">
        <div></div>
        <Button onClick={() => setAddMemberDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Members ({group.members.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage the people who are part of this group and their specific group roles.
          </p>
        </CardHeader>
        <CardContent>
          {group.members.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No members in this group</p>
              <Button onClick={() => setAddMemberDialogOpen(true)} variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Member
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  data-testid={`member-card-${member.id}`}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">
                          {member.person ?
                            `${member.person.first_name} ${member.person.last_name}` :
                            'Unknown Person'
                          }
                        </h3>
                        {member.group_role ? (
                          <Badge variant="secondary" className="text-xs">
                            {getRoleLabel(member.group_role.name)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No role</span>
                        )}
                      </div>
                      {member.person?.email && (
                        <p className="text-sm text-muted-foreground">
                          {member.person.email}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`edit-role-button-${member.id}`}
                        onClick={() => handleOpenEditMember(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`delete-member-button-${member.id}`}
                        onClick={() => handleOpenRemoveDialog(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Group Dialog */}
      <GroupFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        group={group}
        onSuccess={handleEditSuccess}
      />

      {/* Add Membership Modal */}
      <AddMembershipModal
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        groupId={groupId}
        groupName={group.name}
        onSuccess={handleAddMemberSuccess}
      />

      {/* Edit Membership Modal */}
      <AddMembershipModal
        open={editMemberDialogOpen}
        onOpenChange={setEditMemberDialogOpen}
        groupId={groupId}
        groupName={group.name}
        onSuccess={handleEditMemberSuccess}
        editMode={true}
        memberToEdit={memberBeingEdited}
      />

      {/* Remove Member Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        title="Remove Member"
        itemName={memberToRemove?.person ? `${memberToRemove.person.first_name} ${memberToRemove.person.last_name}` : undefined}
        description={`Are you sure you want to remove ${memberToRemove?.person ? `${memberToRemove.person.first_name} ${memberToRemove.person.last_name}` : 'this person'} from this group? This action cannot be undone.`}
        actionLabel="Remove"
        onConfirm={handleConfirmRemove}
      />
    </PageContainer>
  )
}