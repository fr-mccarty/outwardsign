'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormSectionCard } from '@/components/form-section-card'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormField } from '@/components/form-field'
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { SettingsPage } from '@/components/settings-page'
import { Save, Church, RefreshCw, Users, MoreVertical, Trash2, Settings, Plus, DollarSign, Mail, Send, FileText, BookOpen, Download, Database, AlertCircle, CheckCircle, Edit } from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getCurrentParish } from '@/lib/auth/parish'
import { updateParish, getParishMembers, removeParishMember, updateMemberRole, getParishSettings, updateParishSettings } from '@/lib/actions/setup'
import { getParishInvitations, createParishInvitation, revokeParishInvitation, resendParishInvitation, type ParishInvitation } from '@/lib/actions/invitations'
import { getPetitionTemplates, deletePetitionTemplate, ensureDefaultContexts, type PetitionContextTemplate } from '@/lib/actions/petition-templates'
import { importReadings, getReadingsStats } from '@/lib/actions/import-readings'
import { Parish, ParishSettings } from '@/lib/types'
import { USER_PARISH_ROLE_LABELS, USER_PARISH_ROLE_VALUES, type UserParishRoleType } from '@/lib/constants'
import { toast } from 'sonner'
import {
  DataTable,
  DataTableHeader,
  DataTableRowActions,
} from '@/components/data-table'
import { DeleteRowDialog } from '@/components/delete-row-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

export default function ParishSettingsPage() {
  const [currentParish, setCurrentParish] = useState<Parish | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [parishSettings, setParishSettings] = useState<ParishSettings | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: ''
  })
  const [liturgicalLocale, setLiturgicalLocale] = useState('en_US')
  const [quickAmountsData, setQuickAmountsData] = useState([
    { amount: 100, label: '$1' },
    { amount: 200, label: '$2' },
    { amount: 500, label: '$5' }
  ])
  const [members, setMembers] = useState<ParishMember[]>([])
  const [invitations, setInvitations] = useState<ParishInvitation[]>([])
  const [loading, setLoading] = useState(true)
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
  const [inviteRole, setInviteRole] = useState<UserParishRoleType>('parishioner')
  const [inviteModules, setInviteModules] = useState<string[]>([])
  const [petitionTemplates, setPetitionTemplates] = useState<PetitionContextTemplate[]>([])
  const [petitionSearchTerm, setPetitionSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [isImportingReadings, setIsImportingReadings] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importMessage, setImportMessage] = useState('')
  const [importStats, setImportStats] = useState<{ totalReadings: number; categories: string[]; translations: string[] } | null>(null)
  const { setBreadcrumbs } = useBreadcrumbs()
  const router = useRouter()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/settings" },
      { label: "Parish Settings" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadParishData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadParishData() {
    try {
      setLoading(true)
      const parish = await getCurrentParish()
      if (parish) {
        setCurrentParish(parish)
        setFormData({
          name: parish.name,
          city: parish.city,
          state: parish.state
        })

        // Load parish settings
        const settingsResult = await getParishSettings(parish.id)
        if (settingsResult.success) {
          setParishSettings(settingsResult.settings)

          // Check for quick amounts - use defaults if null, undefined, or empty array
          const quickAmounts = settingsResult.settings.mass_intention_offering_quick_amount
          setQuickAmountsData(
            quickAmounts && quickAmounts.length > 0
              ? quickAmounts
              : [
                { amount: 100, label: '$1' },
                { amount: 200, label: '$2' },
                { amount: 500, label: '$5' }
              ]
          )

          setLiturgicalLocale(settingsResult.settings.liturgical_locale || 'en_US')
        } else {
          // If settings don't exist, ensure we still have default values
          console.warn('Parish settings not found, using defaults')
        }

        await loadMembers(parish.id)
        await loadPetitionTemplates()
        await loadReadingsStats()
      }
    } catch (error) {
      console.error('Error loading parish data:', error)
      toast.error('Failed to load parish data')
    } finally {
      setLoading(false)
    }
  }

  async function loadPetitionTemplates() {
    try {
      await ensureDefaultContexts()
      const templates = await getPetitionTemplates()
      setPetitionTemplates(templates)
    } catch (error) {
      console.error('Error loading petition templates:', error)
      toast.error('Failed to load petition templates')
    }
  }

  async function loadReadingsStats() {
    try {
      const stats = await getReadingsStats()
      setImportStats(stats)
    } catch (error) {
      console.error('Failed to load reading stats:', error)
    }
  }

  async function loadMembers(parishId: string) {
    try {
      setLoadingMembers(true)
      const [membersResult, invitationsResult] = await Promise.all([
        getParishMembers(parishId),
        getParishInvitations().catch(err => {
          console.error('Error loading invitations:', err)
          return []
        })
      ])
      setMembers(membersResult.members || [])
      setInvitations(invitationsResult)
    } catch (error) {
      console.error('Error loading members:', error)
      toast.error('Failed to load parish members')
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleSave = async () => {
    if (!currentParish) {
      toast.error('No parish selected')
      return
    }

    if (!formData.name.trim() || !formData.city.trim() || !formData.state.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSaving(true)
    try {
      await updateParish(currentParish.id, formData)
      toast.success('Parish settings saved successfully!')
      
      // Refresh parish data
      await loadParishData()
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
    if (!currentParish) {
      toast.error('No parish selected')
      return
    }

    setSaving(true)
    try {
      await updateParishSettings(currentParish.id, {
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
    if (!currentParish) {
      toast.error('No parish selected')
      return
    }

    setSaving(true)
    try {
      await updateParishSettings(currentParish.id, {
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
    loadParishData()
  }

  const handleOpenRemoveDialog = (userId: string, email: string) => {
    setMemberToRemove({ userId, email })
    setRemoveDialogOpen(true)
  }

  const handleConfirmRemove = async () => {
    if (!currentParish || !memberToRemove) return

    try {
      await removeParishMember(currentParish.id, memberToRemove.userId)
      toast.success('Member removed successfully')
      await loadMembers(currentParish.id)
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('Failed to remove member')
    } finally {
      setRemoveDialogOpen(false)
      setMemberToRemove(null)
    }
  }

  const handleInviteMember = async () => {
    if (!currentParish) return

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
      setInviteRole('parishioner')
      setInviteModules([])
      await loadMembers(currentParish.id)
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error('Failed to send invitation')
    } finally {
      setSaving(false)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    if (!currentParish) return

    try {
      await resendParishInvitation(invitationId)
      toast.success('Invitation resent successfully!')
      await loadMembers(currentParish.id)
    } catch (error) {
      console.error('Error resending invitation:', error)
      toast.error('Failed to resend invitation')
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!currentParish) return

    try {
      await revokeParishInvitation(invitationId)
      toast.success('Invitation revoked successfully')
      await loadMembers(currentParish.id)
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
    if (!currentParish || !memberToEdit) return

    try {
      setSaving(true)
      await updateMemberRole(
        currentParish.id,
        memberToEdit.userId,
        [editRole],
        editRole === 'ministry-leader' ? editModules : undefined
      )
      toast.success('Member role updated successfully')
      setEditDialogOpen(false)
      setMemberToEdit(null)
      await loadMembers(currentParish.id)
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

  const handleImportReadings = async () => {
    setIsImportingReadings(true)
    setImportStatus('idle')
    setImportMessage('')

    try {
      const loadingToast = toast.loading('Importing readings...')
      const result = await importReadings()

      toast.dismiss(loadingToast)

      const message = `Successfully imported ${result.imported} readings (${result.skipped} already existed)`
      setImportStatus('success')
      setImportMessage(message)

      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} new readings!`)
      } else if (result.skipped > 0) {
        toast.info(`All ${result.skipped} readings already exist in your collection`)
      } else {
        toast.info('No readings were imported')
      }

      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error))
      }

      await loadReadingsStats()
    } catch (error) {
      toast.dismiss()

      setImportStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Failed to import readings'
      setImportMessage(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsImportingReadings(false)
    }
  }


  const getRoleLabel = (role: string) => {
    // Use English labels for now - TODO: Add language selection
    return USER_PARISH_ROLE_LABELS[role as UserParishRoleType]?.en || role
  }

  if (loading) {
    return (
      <SettingsPage
        title="Parish Settings"
        description="Manage your parish information and administrative settings"
        tabs={[]}
      />
    )
  }

  if (!currentParish) {
    return (
      <SettingsPage
        title="Parish Settings"
        description="Manage your parish information and administrative settings"
        tabs={[
          {
            value: 'settings',
            label: 'Parish Settings',
            icon: <Settings className="h-4 w-4" />,
            content: (
              <FormSectionCard title="No Parish Selected">
                <div className="text-center py-8">
                  <Church className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Please select a parish to manage its settings.
                  </p>
                </div>
              </FormSectionCard>
            )
          }
        ]}
      />
    )
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
                  <FormField
                    id="name"
                    label="Parish Name"
                    value={formData.name}
                    onChange={(value) => handleChange('name', value)}
                    placeholder="St. Mary's Catholic Church"
                    required
                  />
                </div>

                <div>
                  <FormField
                    id="city"
                    label="City"
                    value={formData.city}
                    onChange={(value) => handleChange('city', value)}
                    placeholder="New York"
                    required
                  />
                </div>

                <div>
                  <FormField
                    id="state"
                    label="State"
                    value={formData.state}
                    onChange={(value) => handleChange('state', value)}
                    placeholder="NY"
                    required
                  />
                </div>
              </div>
          </FormSectionCard>

          <FormSectionCard
            title="Liturgical Settings"
            description="This determines which liturgical calendar events are imported from the API"
          >
              <FormField
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
                <p className="mt-1 text-sm">{new Date(currentParish.created_at).toLocaleDateString()}</p>
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
        {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading quick amounts...</div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {quickAmountsData.map((quickAmount, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`amount-${index}`}>
                          Amount (cents)
                        </Label>
                        <Input
                          id={`amount-${index}`}
                          type="number"
                          min="1"
                          step="1"
                          value={quickAmount.amount}
                          onChange={(e) => handleQuickAmountChange(index, 'amount', parseInt(e.target.value) || 0)}
                          placeholder="100"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          ${(quickAmount.amount / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor={`label-${index}`}>
                          Display Label
                        </Label>
                        <Input
                          id={`label-${index}`}
                          type="text"
                          value={quickAmount.label}
                          onChange={(e) => handleQuickAmountChange(index, 'label', e.target.value)}
                          placeholder="$1"
                        />
                      </div>
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
            </>
          )}
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
                    icon: <FileText className="h-12 w-12 text-gray-400" />,
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

                <DeleteRowDialog
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

  // Readings Tab Content
  const readingsContent = (
    <>
          {importStatus !== 'idle' && (
            <Alert className={importStatus === 'success' ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20'}>
              {importStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <AlertDescription className={importStatus === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                {importMessage}
              </AlertDescription>
            </Alert>
          )}

          {importStats && (
            <FormSectionCard title="Current Reading Collection">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{importStats.totalReadings}</div>
                    <div className="text-sm text-muted-foreground">Total Readings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{importStats.categories.length}</div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{importStats.translations.length}</div>
                    <div className="text-sm text-muted-foreground">Translations</div>
                  </div>
                </div>

                {importStats.categories.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Available Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {importStats.categories.map(category => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </FormSectionCard>
          )}

          <FormSectionCard
            title="Import Readings"
            description="Import a comprehensive collection of readings from our curated database. This includes readings for weddings, funerals, and other liturgical celebrations with proper introductions and conclusions."
          >
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-950/20 dark:border-blue-900/50">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">What will be imported:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Wedding readings (Old Testament, Psalms, New Testament, Gospel)</li>
                  <li>• Funeral readings (Old Testament, Psalms, New Testament, Gospel)</li>
                  <li>• Complete biblical texts with proper liturgical introductions</li>
                  <li>• Categorized by liturgical context and biblical book</li>
                  <li>• Formatted for liturgical proclamation</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 dark:bg-amber-950/20 dark:border-amber-900/50">
                <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-2">Important Notes:</h4>
                <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                  <li>• This will add readings to your parish collection</li>
                  <li>• Duplicate readings will be skipped automatically</li>
                  <li>• You can edit or delete imported readings after import</li>
                  <li>• Import may take a few moments to complete</li>
                </ul>
              </div>

              <Button
                onClick={handleImportReadings}
                disabled={isImportingReadings}
                className="w-full"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                {isImportingReadings ? 'Importing Readings...' : 'Import Readings'}
              </Button>
          </FormSectionCard>

          <FormSectionCard
            title="Reading Management"
            description="Manage your reading collection and organize readings for different liturgical occasions."
          >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" asChild className="justify-between h-auto p-4">
                  <Link href="/readings">
                    <div className="text-left">
                      <div className="font-medium">View All Readings</div>
                      <div className="text-sm text-muted-foreground">Browse and search your complete reading collection</div>
                    </div>
                    <BookOpen className="h-4 w-4" />
                  </Link>
                </Button>

                <Button variant="outline" asChild className="justify-between h-auto p-4">
                  <Link href="/readings/create">
                    <div className="text-left">
                      <div className="font-medium">Add New Reading</div>
                      <div className="text-sm text-muted-foreground">Create custom readings for special occasions</div>
                    </div>
                    <BookOpen className="h-4 w-4" />
                  </Link>
                </Button>
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
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                      <div className="flex-1">
                        <div className="font-medium">{invitation.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Invited {new Date(invitation.created_at).toLocaleDateString()} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
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
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Revoke Invitation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
            </FormSectionCard>
          )}

          {/* Active Members */}
          <FormSectionCard title={`Parish Members (${members.length})`}>
            <div className="flex justify-end mb-4">
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Parish Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join this parish. They will receive an email with a link to create their account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <FormField
                      id="invite-email"
                      label="Email Address"
                      inputType="email"
                      value={inviteEmail}
                      onChange={setInviteEmail}
                      placeholder="member@example.com"
                      required
                    />
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as UserParishRoleType)}>
                        <SelectTrigger id="invite-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {USER_PARISH_ROLE_VALUES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {USER_PARISH_ROLE_LABELS[role].en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {inviteRole === 'admin' && 'Full access to parish settings, templates, and all modules'}
                        {inviteRole === 'staff' && 'Can create and manage all sacrament modules'}
                        {inviteRole === 'ministry-leader' && 'Access to specific modules (select below)'}
                        {inviteRole === 'parishioner' && 'Read-only access to shared modules'}
                      </p>
                    </div>
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
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenRemoveDialog(member.user_id, member.users?.email || 'Unknown')}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from Parish
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
      value: 'readings',
      label: 'Readings',
      icon: <BookOpen className="h-4 w-4" />,
      content: readingsContent
    },
    {
      value: 'members',
      label: 'Members',
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
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
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
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editRole} onValueChange={(value) => setEditRole(value as UserParishRoleType)}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_PARISH_ROLE_VALUES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {USER_PARISH_ROLE_LABELS[role].en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {editRole === 'admin' && 'Full access to parish settings, templates, and all modules'}
                {editRole === 'staff' && 'Can create and manage all sacrament modules'}
                {editRole === 'ministry-leader' && 'Access to specific modules (select below)'}
                {editRole === 'parishioner' && 'Read-only access to shared modules'}
              </p>
            </div>
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
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Parish Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-semibold">{memberToRemove?.email}</span>{' '}
              from the parish? This action cannot be undone.
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
    </>
  )
}