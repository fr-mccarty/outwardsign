'use client'

import { useEffect, useState } from 'react'
import { PageContainer } from "@/components/page-container"
import { Loading } from '@/components/loading'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { UserPlus, User, Trash2, Users, Edit, X, Save } from "lucide-react"
import { getGroup, removeGroupMember, updateGroupMemberRoles, type GroupWithMembers, type GroupMember } from '@/lib/actions/groups'
import { GroupFormDialog } from '@/components/groups/group-form-dialog'
import { AddMembershipModal } from '@/components/groups/add-membership-modal'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ROLE_VALUES, ROLE_LABELS, type LiturgicalRole } from '@/lib/constants'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function GroupDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [group, setGroup] = useState<GroupWithMembers | null>(null)
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editingRoles, setEditingRoles] = useState<LiturgicalRole[]>([])
  const [groupId, setGroupId] = useState<string>('')
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params
        setGroupId(id)

        const groupData = await getGroup(id)

        if (!groupData) {
          toast.error('Group not found')
          router.push('/groups')
          return
        }

        setGroup(groupData)

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

      // Reload group data
      const updatedGroup = await getGroup(groupId)
      if (updatedGroup) {
        setGroup(updatedGroup)
      }
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error('Failed to remove member')
    } finally {
      setRemoveDialogOpen(false)
      setMemberToRemove(null)
    }
  }

  const handleStartEditRoles = (member: GroupMember) => {
    setEditingMemberId(member.id)
    setEditingRoles((member.roles || []) as LiturgicalRole[])
  }

  const handleCancelEditRoles = () => {
    setEditingMemberId(null)
    setEditingRoles([])
  }

  const handleRoleToggle = (role: LiturgicalRole) => {
    setEditingRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role)
      } else {
        return [...prev, role]
      }
    })
  }

  const handleSaveRoles = async (member: GroupMember) => {
    try {
      await updateGroupMemberRoles(groupId, member.person_id, editingRoles.length > 0 ? editingRoles : undefined)
      toast.success('Roles updated successfully')

      // Reload group data
      const updatedGroup = await getGroup(groupId)
      if (updatedGroup) {
        setGroup(updatedGroup)
      }

      setEditingMemberId(null)
      setEditingRoles([])
    } catch (error) {
      console.error('Failed to update roles:', error)
      toast.error('Failed to update roles')
    }
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
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle>{group.name}</CardTitle>
                {!group.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
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
      <div className="flex items-center justify-between mb-6">
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
            Manage the people who are part of this group and their specific roles.
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
            <div className="space-y-4">
              {group.members.map((member) => {
                const isEditing = editingMemberId === member.id

                return (
                  <div
                    key={member.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {member.person ?
                              `${member.person.first_name} ${member.person.last_name}` :
                              'Unknown Person'
                            }
                          </h3>
                          {member.person?.email && (
                            <p className="text-sm text-muted-foreground">
                              {member.person.email}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(member.joined_at).toLocaleDateString()}
                          </p>

                          {/* Roles Display */}
                          {!isEditing && (
                            <div className="mt-3">
                              {member.roles && member.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {member.roles.map((role) => (
                                    <Badge key={role} variant="secondary">
                                      {ROLE_LABELS[role as LiturgicalRole]?.en || role}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No roles assigned</p>
                              )}
                            </div>
                          )}

                          {/* Roles Editor */}
                          {isEditing && (
                            <div className="mt-3 space-y-3 border rounded-lg p-3 bg-muted/50">
                              <Label className="text-sm font-medium">Select Roles</Label>
                              {ROLE_VALUES.map((role) => (
                                <div key={role} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${member.id}-${role}`}
                                    checked={editingRoles.includes(role)}
                                    onCheckedChange={() => handleRoleToggle(role)}
                                  />
                                  <label
                                    htmlFor={`${member.id}-${role}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {ROLE_LABELS[role].en}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartEditRoles(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenRemoveDialog(member)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEditRoles}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveRoles(member)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
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

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-semibold">
                {memberToRemove?.person
                  ? `${memberToRemove.person.first_name} ${memberToRemove.person.last_name}`
                  : 'this person'}
              </span>{' '}
              from this group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}