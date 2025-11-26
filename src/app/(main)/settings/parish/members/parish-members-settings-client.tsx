'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { ListCard } from '@/components/list-card'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FormInput } from '@/components/form-input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DialogButton } from "@/components/dialog-button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreVertical, Trash2, Edit, Plus, Send } from "lucide-react"
import { getParishMembers, removeParishMember, updateMemberRole } from '@/lib/actions/setup'
import { createParishInvitation, revokeParishInvitation, resendParishInvitation, getParishInvitations, type ParishInvitation } from '@/lib/actions/invitations'
import { Parish } from '@/lib/types'
import { USER_PARISH_ROLE_LABELS, USER_PARISH_ROLE_VALUES, type UserParishRoleType } from '@/lib/constants'
import { toast } from 'sonner'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'

interface ParishMember {
  user_id: string
  roles: string[]
  enabled_modules: string[]
  users: {
    id: string
    email: string | null
    created_at: string | null
  } | null
}

interface ParishMembersSettingsClientProps {
  parish: Parish
  initialMembers: ParishMember[]
  initialInvitations: ParishInvitation[]
  currentUserId: string
}

export function ParishMembersSettingsClient({
  parish,
  initialMembers,
  initialInvitations,
  currentUserId
}: ParishMembersSettingsClientProps) {
  const router = useRouter()
  const [members, setMembers] = useState<ParishMember[]>(initialMembers)
  const [invitations, setInvitations] = useState<ParishInvitation[]>(initialInvitations)
  const [saving, setSaving] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; email: string } | null>(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [memberToEdit, setMemberToEdit] = useState<{ userId: string; email: string; roles: string[]; enabled_modules: string[] } | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editRole, setEditRole] = useState<UserParishRoleType>('parishioner')
  const [editModules, setEditModules] = useState<string[]>([])
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserParishRoleType>('staff')
  const [inviteModules, setInviteModules] = useState<string[]>([])

  async function loadMembers() {
    try {
      setLoadingMembers(true)
      const membersResult = await getParishMembers(parish.id)
      setMembers(membersResult.members || [])
    } catch (error) {
      console.error('Error loading members:', error)
      toast.error('Failed to load parish members')
    } finally {
      setLoadingMembers(false)
    }
  }

  async function loadInvitations() {
    try {
      const invitationsResult = await getParishInvitations()
      setInvitations(invitationsResult)
    } catch (error) {
      console.error('Error loading invitations:', error)
      toast.error('Failed to load invitations')
    }
  }

  const handleOpenRemoveDialog = (userId: string, email: string) => {
    setMemberToRemove({ userId, email })
    setRemoveDialogOpen(true)
  }

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return

    try {
      await removeParishMember(parish.id, memberToRemove.userId)
      toast.success('Member removed successfully')
      setMemberToRemove(null)
      await loadMembers()
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('Failed to remove member')
      throw error
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail || !inviteRole) {
      toast.error('Please enter an email and select a role')
      return
    }

    try {
      setSaving(true)
      await createParishInvitation({
        email: inviteEmail,
        roles: [inviteRole],
        enabled_modules: inviteRole === 'ministry-leader' ? inviteModules : undefined
      })
      toast.success('Invitation sent successfully!')
      setInviteDialogOpen(false)
      setInviteEmail('')
      setInviteRole('staff')
      setInviteModules([])
      await loadInvitations()
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error('Failed to send invitation')
    } finally {
      setSaving(false)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await resendParishInvitation(invitationId)
      toast.success('Invitation resent successfully!')
      await loadInvitations()
    } catch (error) {
      console.error('Error resending invitation:', error)
      toast.error('Failed to resend invitation')
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await revokeParishInvitation(invitationId)
      toast.success('Invitation revoked successfully')
      await loadInvitations()
    } catch (error) {
      console.error('Error revoking invitation:', error)
      toast.error('Failed to revoke invitation')
    }
  }

  const handleModuleToggle = (module: string) => {
    setInviteModules(prev =>
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    )
  }

  const handleEditModuleToggle = (module: string) => {
    setEditModules(prev =>
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    )
  }

  const handleOpenEditDialog = (userId: string, email: string, roles: string[], enabled_modules: string[]) => {
    setMemberToEdit({ userId, email, roles, enabled_modules })
    setEditRole(roles[0] as UserParishRoleType || 'parishioner')
    setEditModules(enabled_modules || [])
    setEditDialogOpen(true)
  }

  const handleConfirmEdit = async () => {
    if (!memberToEdit) return

    try {
      setSaving(true)
      await updateMemberRole(
        parish.id,
        memberToEdit.userId,
        [editRole],
        editRole === 'ministry-leader' ? editModules : undefined
      )
      toast.success('Member role updated successfully')
      setEditDialogOpen(false)
      setMemberToEdit(null)
      await loadMembers()
    } catch (error) {
      console.error('Error updating member role:', error)
      toast.error('Failed to update member role')
    } finally {
      setSaving(false)
    }
  }

  const getRoleLabel = (role: string) => {
    return USER_PARISH_ROLE_LABELS[role as UserParishRoleType]?.en || role
  }

  const handleInviteClick = () => {
    setInviteDialogOpen(true)
  }

  const renderMemberItem = (member: ParishMember) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="font-medium">
          {member.users?.email || 'Parish Member'}
        </div>
        <div className="text-sm text-muted-foreground">
          {member.users?.created_at
            ? `Member since ${new Date(member.users.created_at).toLocaleDateString()}`
            : 'Parish team member'
          }
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          {member.roles.map(role => getRoleLabel(role)).join(', ')}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleOpenEditDialog(
              member.user_id,
              member.users?.email || 'Unknown',
              member.roles,
              member.enabled_modules || []
            )}
            disabled={member.user_id === currentUserId}
          >
            <Edit className="h-4 w-4 mr-2" />
            {member.user_id === currentUserId ? 'Edit Role (You)' : 'Edit Role'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOpenRemoveDialog(member.user_id, member.users?.email || 'Unknown')}
            className="text-destructive"
            disabled={member.user_id === currentUserId}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {member.user_id === currentUserId ? 'Cannot Remove Yourself' : 'Remove from Parish'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <>
      <PageContainer
        title="Parish Members"
        description="Manage team members and invitations for your parish"
      >
        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <ContentCard>
            <div>
              <h3 className="font-semibold mb-4">Pending Invitations ({invitations.length})</h3>
              <div className="space-y-4">
              {invitations.map((invitation) => {
                const expiresAt = new Date(invitation.expires_at)
                const isExpired = expiresAt < new Date()

                return (
                  <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                    <div className="flex-1">
                      <div className="font-medium">{invitation.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Invited {new Date(invitation.created_at).toLocaleDateString()} • Expires {expiresAt.toLocaleDateString()}
                        {isExpired && <span className="text-destructive font-medium"> (Expired)</span>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {invitation.roles.map(role => getRoleLabel(role)).join(', ')}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleResendInvitation(invitation.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Resend Invitation
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRevokeInvitation(invitation.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Revoke Invitation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
              </div>
            </div>
          </ContentCard>
        )}

        {/* Active Members */}
        <ListCard
          title={`Parish Members (${members.length})`}
          description="Manage team members and their roles"
          items={members}
          renderItem={renderMemberItem}
          getItemId={(member) => member.user_id}
          onAdd={handleInviteClick}
          addButtonLabel="Invite Member"
          emptyMessage="No members found"
        />
      </PageContainer>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Parish Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join this parish. They will receive an email with a link to create their account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <FormInput
                    id="invite-email"
                    label="Email Address"
                    inputType="email"
                    value={inviteEmail}
                    onChange={setInviteEmail}
                    placeholder="member@example.com"
                    required
                  />
                  <FormInput
                    id="invite-role"
                    label="Role"
                    inputType="select"
                    value={inviteRole}
                    onChange={(value) => setInviteRole(value as UserParishRoleType)}
                    options={USER_PARISH_ROLE_VALUES.filter(role => role !== 'parishioner').map((role) => ({
                      value: role,
                      label: USER_PARISH_ROLE_LABELS[role].en
                    }))}
                    description={
                      inviteRole === 'admin' ? 'Full access to parish settings, templates, and all modules' :
                      inviteRole === 'staff' ? 'Can create and manage all sacrament modules' :
                      inviteRole === 'ministry-leader' ? 'Access to specific modules (select below)' : ''
                    }
                  />
                  {inviteRole === 'ministry-leader' && (
                    <div className="space-y-2">
                      <Label>Enabled Modules</Label>
                      <div className="space-y-2">
                        {['masses', 'weddings', 'funerals', 'baptisms', 'presentations', 'quinceaneras', 'groups'].map((module) => (
                          <div key={module} className="flex items-center space-x-2">
                            <Checkbox
                              id={`module-${module}`}
                              checked={inviteModules.includes(module)}
                              onCheckedChange={() => handleModuleToggle(module)}
                            />
                            <label
                              htmlFor={`module-${module}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                            >
                              {module}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember} disabled={saving}>
              {saving ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Member Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member Role</DialogTitle>
            <DialogDescription>
              Update the role and permissions for <strong>{memberToEdit?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormInput
              id="edit-role"
              label="Role"
              inputType="select"
              value={editRole}
              onChange={(value) => setEditRole(value as UserParishRoleType)}
              options={USER_PARISH_ROLE_VALUES.filter(role => role !== 'parishioner').map((role) => ({
                value: role,
                label: USER_PARISH_ROLE_LABELS[role].en
              }))}
              description={
                editRole === 'admin' ? 'Full access to parish settings, templates, and all modules' :
                editRole === 'staff' ? 'Can create and manage all sacrament modules' :
                editRole === 'ministry-leader' ? 'Access to specific modules (select below)' : ''
              }
            />
            {editRole === 'ministry-leader' && (
              <div className="space-y-2">
                <Label>Enabled Modules</Label>
                <div className="space-y-2">
                  {['masses', 'weddings', 'funerals', 'baptisms', 'presentations', 'quinceaneras', 'groups'].map((module) => (
                    <div key={module} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-module-${module}`}
                        checked={editModules.includes(module)}
                        onCheckedChange={() => handleEditModuleToggle(module)}
                      />
                      <label
                        htmlFor={`edit-module-${module}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        {module}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        title="Remove Parish Member"
        itemName={memberToRemove?.email}
        actionLabel="Remove"
        onConfirm={handleConfirmRemove}
      />
    </>
  )
}
