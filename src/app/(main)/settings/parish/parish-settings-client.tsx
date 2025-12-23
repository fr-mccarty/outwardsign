'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormSectionCard } from '@/components/form-section-card'
import { Button } from "@/components/ui/button"
// Input available for future inline editing
import { Label } from "@/components/ui/label"
import { FormInput } from '@/components/form-input'
import { Badge } from "@/components/ui/badge"
// Select available for dropdown menus
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
import { SettingsPage } from '@/components/settings-page'
import { Save, RefreshCw, Users, MoreVertical, Trash2, Settings, Plus, DollarSign, Send, FileText, Edit } from "lucide-react"
import { updateParish, getParishMembers, removeParishMember, updateMemberRole, updateParishSettings } from '@/lib/actions/setup'
import { createParishInvitation, revokeParishInvitation, resendParishInvitation, getParishInvitations, type ParishInvitation } from '@/lib/actions/invitations'
import { getPetitionTemplates, deletePetitionTemplate, type PetitionContextTemplate } from '@/lib/actions/petition-templates'
import { Parish, ParishSettings } from '@/lib/types'
import { USER_PARISH_ROLE_LABELS, USER_PARISH_ROLE_VALUES, type UserParishRoleType } from '@/lib/constants'
import { toast } from 'sonner'
import {
  DataTable,
  DataTableHeader,
  DataTableRowActions,
} from '@/components/data-table'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
// Alert available for error displays

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

interface ParishSettingsClientProps {
  parish: Parish
  parishSettings: ParishSettings | null
  initialMembers: ParishMember[]
  initialInvitations: ParishInvitation[]
  initialPetitionTemplates: PetitionContextTemplate[]
  currentUserId: string
}

export function ParishSettingsClient({
  parish,
  parishSettings,
  initialMembers,
  initialInvitations,
  initialPetitionTemplates,
  currentUserId
}: ParishSettingsClientProps) {
  const [formData, setFormData] = useState({
    name: parish.name,
    city: parish.city,
    state: parish.state ?? '',
    country: parish.country ?? ''
  })
  const [liturgicalLocale, setLiturgicalLocale] = useState(parishSettings?.liturgical_locale || 'en_US')
  const [quickAmountsData, setQuickAmountsData] = useState(
    parishSettings?.mass_intention_offering_quick_amount && parishSettings.mass_intention_offering_quick_amount.length > 0
      ? parishSettings.mass_intention_offering_quick_amount
      : [
        { amount: 100, label: '$1' },
        { amount: 200, label: '$2' },
        { amount: 500, label: '$5' }
      ]
  )
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
  const [petitionTemplates, setPetitionTemplates] = useState<PetitionContextTemplate[]>(initialPetitionTemplates)
  const [petitionSearchTerm, setPetitionSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const router = useRouter()

  async function loadPetitionTemplates() {
    try {
      const templates = await getPetitionTemplates()
      setPetitionTemplates(templates)
    } catch (error) {
      console.error('Error loading petition templates:', error)
      toast.error('Failed to load petition templates')
    }
  }

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

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.city.trim() || !formData.state.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSaving(true)
    try {
      await updateParish(parish.id, formData)
      toast.success('Parish settings saved successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error saving parish settings:', error)
      toast.error('Failed to save parish settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleQuickAmountChange = (index: number, field: 'amount' | 'label', value: string | number) => {
    setQuickAmountsData(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: field === 'amount' ? Number(value) : value } : item
    ))
  }

  const addQuickAmount = () => {
    setQuickAmountsData(prev => [
      ...prev,
      { amount: 1000, label: '$10' }
    ])
  }

  const removeQuickAmount = (index: number) => {
    setQuickAmountsData(prev => prev.filter((_, i) => i !== index))
  }

  const handleSaveQuickAmounts = async () => {
    setSaving(true)
    try {
      await updateParishSettings(parish.id, {
        mass_intention_offering_quick_amount: quickAmountsData
      })
      toast.success('Mass intention quick amounts saved successfully!')
    } catch (error) {
      console.error('Error saving quick amounts:', error)
      toast.error('Failed to save quick amounts')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveLiturgicalLocale = async () => {
    setSaving(true)
    try {
      await updateParishSettings(parish.id, {
        liturgical_locale: liturgicalLocale
      })
      toast.success('Liturgical locale saved successfully!')
    } catch (error) {
      console.error('Error saving liturgical locale:', error)
      toast.error('Failed to save liturgical locale')
    } finally {
      setSaving(false)
    }
  }

  const handleRefresh = () => {
    router.refresh()
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

  const openDeleteDialog = (templateId: string) => {
    setTemplateToDelete(templateId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return

    try {
      await deletePetitionTemplate(templateToDelete)
      toast.success('Template deleted successfully')
      setTemplateToDelete(null)
      await loadPetitionTemplates()
    } catch (error) {
      toast.error('Failed to delete template. Please try again.')
      throw error
    }
  }

  const getRoleLabel = (role: string) => {
    return USER_PARISH_ROLE_LABELS[role as UserParishRoleType]?.en || role
  }

  // Parish Settings Tab Content
  const parishSettingsContent = (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <FormSectionCard title="Parish Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormInput
              id="name"
              label="Parish Name"
              value={formData.name}
              onChange={(value) => handleChange('name', value)}
              placeholder="St. Mary's Catholic Church"
              required
            />
          </div>

          <div>
            <FormInput
              id="city"
              label="City"
              value={formData.city}
              onChange={(value) => handleChange('city', value)}
              placeholder="New York"
              required
            />
          </div>

          <div>
            <FormInput
              id="state"
              label="State"
              value={formData.state}
              onChange={(value) => handleChange('state', value)}
              placeholder="NY"
              required
            />
          </div>

          <div>
            <FormInput
              id="country"
              label="Country"
              value={formData.country}
              onChange={(value) => handleChange('country', value)}
              placeholder="United States"
            />
          </div>
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Liturgical Settings"
        description="This determines which liturgical calendar events are imported from the API"
      >
        <FormInput
          id="liturgical-locale"
          label="Liturgical Calendar Locale"
          inputType="select"
          value={liturgicalLocale}
          onChange={setLiturgicalLocale}
          options={[
            { value: 'en_US', label: 'English (United States)' },
            { value: 'es_MX', label: 'Spanish (Mexico)' },
            { value: 'es_ES', label: 'Spanish (Spain)' },
            { value: 'fr_FR', label: 'French (France)' },
            { value: 'pt_BR', label: 'Portuguese (Brazil)' }
          ]}
        />
        <div className="flex justify-end">
          <Button onClick={handleSaveLiturgicalLocale} disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Locale'}
          </Button>
        </div>
      </FormSectionCard>

      <FormSectionCard title="Parish Details">
        <div>
          <Label className="text-muted-foreground">Created</Label>
          <p className="mt-1 text-sm">{new Date(parish.created_at).toLocaleDateString()}</p>
        </div>
      </FormSectionCard>
    </>
  )

  // Mass Intentions Tab Content
  const massIntentionsContent = (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleSaveQuickAmounts} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Quick Amounts'}
        </Button>
      </div>

      <FormSectionCard
        title="Mass Intention Offering Quick Amounts"
        description="Configure the quick amount buttons that appear when entering Mass intention offerings. Amounts are stored in cents for precise calculations."
      >
        <div className="space-y-4">
          {quickAmountsData.map((quickAmount, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <FormInput
                  id={`amount-${index}`}
                  label="Amount (cents)"
                  inputType="number"
                  value={quickAmount.amount.toString()}
                  onChange={(value) => handleQuickAmountChange(index, 'amount', parseInt(value) || 0)}
                  placeholder="100"
                  description={`$${(quickAmount.amount / 100).toFixed(2)}`}
                  min="1"
                  step="1"
                />
                <FormInput
                  id={`label-${index}`}
                  label="Display Label"
                  value={quickAmount.label}
                  onChange={(value) => handleQuickAmountChange(index, 'label', value)}
                  placeholder="$1"
                  description="Text shown on button"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeQuickAmount(index)}
                disabled={quickAmountsData.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={addQuickAmount}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Quick Amount
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Preview:</h4>
          <div className="flex gap-2 flex-wrap">
            {quickAmountsData.map((quickAmount, index) => (
              <Badge key={index} variant="outline">
                {quickAmount.label}
              </Badge>
            ))}
          </div>
        </div>
      </FormSectionCard>
    </>
  )

  // Petitions Tab Content
  const petitionsContent = (
    <>
      <FormSectionCard
        title="Petition Templates"
        description="Manage petition templates for your liturgical celebrations. Create custom contexts as needed."
      >
        <div className="space-y-4">
          <DataTableHeader
            searchValue={petitionSearchTerm}
            onSearchChange={setPetitionSearchTerm}
            searchPlaceholder="Search templates..."
            actions={
              <Button asChild size="sm">
                <Link href="/settings/petitions/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Link>
              </Button>
            }
          />

          <DataTable
            data={petitionTemplates.filter(template =>
              !petitionSearchTerm ||
              template.title.toLowerCase().includes(petitionSearchTerm.toLowerCase()) ||
              (template.description || '').toLowerCase().includes(petitionSearchTerm.toLowerCase())
            )}
            columns={[
              {
                key: 'title',
                header: 'Title',
                sortable: true,
                accessorFn: (template) => template.title,
                cell: (template) => <span className="font-medium">{template.title}</span>,
              },
              {
                key: 'description',
                header: 'Description',
                hiddenOn: 'md',
                cell: (template) => (
                  <span className="text-sm text-muted-foreground">
                    {template.description || 'No description'}
                  </span>
                ),
              },
              {
                key: 'created_at',
                header: 'Created',
                hiddenOn: 'xl',
                sortable: true,
                accessorFn: (template) => new Date(template.created_at),
                cell: (template) => {
                  const date = new Date(template.created_at)
                  const now = new Date()
                  const diffTime = Math.abs(now.getTime() - date.getTime())
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  const displayDate = diffDays < 1 ? 'Today' : diffDays === 1 ? 'Yesterday' : diffDays < 7 ? `${diffDays} days ago` : date.toLocaleDateString()
                  return <span className="text-sm text-muted-foreground">{displayDate}</span>
                },
              },
              {
                key: 'actions',
                header: 'Actions',
                headerClassName: 'text-center',
                className: 'text-center',
                cell: (template) => (
                  <DataTableRowActions
                    row={template}
                    variant="hybrid"
                    customActions={[
                      {
                        label: "Edit",
                        icon: <Edit className="h-4 w-4" />,
                        onClick: (row) => router.push(`/settings/petitions/${row.id}`)
                      }
                    ]}
                    onDelete={(row) => openDeleteDialog(row.id)}
                  />
                ),
              },
            ]}
            keyExtractor={(template) => template.id}
            emptyState={{
              icon: <FileText className="h-12 w-12 text-muted-foreground" />,
              title: petitionSearchTerm ? 'No templates found' : 'No templates yet',
              description: petitionSearchTerm
                ? 'No templates found matching your search.'
                : 'No templates yet. Create your first template!',
              action: !petitionSearchTerm && (
                <Button asChild>
                  <Link href="/settings/petitions/create">Create Template</Link>
                </Button>
              ),
            }}
          />

          <ConfirmationDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDeleteTemplate}
            title="Delete Template"
            itemName={petitionTemplates.find(t => t.id === templateToDelete)?.title}
          />
        </div>
      </FormSectionCard>
    </>
  )

  // Members Tab Content
  const membersContent = (
    <>
      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <FormSectionCard title={`Pending Invitations (${invitations.length})`}>
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
        </FormSectionCard>
      )}

      {/* Active Members */}
      <FormSectionCard title={`Parish Members (${members.length})`}>
        <div className="flex justify-end mb-4">
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogButton>
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </DialogButton>
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
        </div>

        {loadingMembers ? (
          <div className="text-center py-8">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No members found
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg">
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
            ))}
          </div>
        )}
      </FormSectionCard>
    </>
  )

  const tabs = [
    {
      value: 'settings',
      label: 'Parish Settings',
      icon: <Settings className="h-4 w-4" />,
      content: parishSettingsContent
    },
    {
      value: 'mass-intentions',
      label: 'Mass Intentions',
      icon: <DollarSign className="h-4 w-4" />,
      content: massIntentionsContent
    },
    {
      value: 'petitions',
      label: 'Petitions',
      icon: <FileText className="h-4 w-4" />,
      content: petitionsContent
    },
    {
      value: 'users',
      label: 'Users',
      icon: <Users className="h-4 w-4" />,
      badge: members.length + invitations.length,
      content: membersContent
    }
  ]

  return (
    <>
      <SettingsPage
        title="Parish Settings"
        description="Manage your parish information, members, and administrative settings"
        tabs={tabs}
        defaultTab="settings"
        actions={
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

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
      <ConfirmationDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        title="Remove Parish Member"
        itemName={memberToRemove?.email}
        confirmLabel="Remove"
        onConfirm={handleConfirmRemove}
      />
    </>
  )
}
