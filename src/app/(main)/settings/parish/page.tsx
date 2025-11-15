'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { PageContainer } from '@/components/page-container'
import { Save, Church, RefreshCw, Users, MoreVertical, Trash2, Settings, Plus, DollarSign, Mail, Send } from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getCurrentParish } from '@/lib/auth/parish'
import { updateParish, getParishMembers, removeParishMember, getParishSettings, updateParishSettings } from '@/lib/actions/setup'
import { getParishInvitations, createParishInvitation, revokeParishInvitation, resendParishInvitation, type ParishInvitation } from '@/lib/actions/invitations'
import { Parish, ParishSettings } from '@/lib/types'
import { PARISH_ROLE_LABELS, PARISH_ROLE_VALUES, type ParishRole } from '@/lib/constants'
import { toast } from 'sonner'

interface ParishMember {
  user_id: string
  roles: string[]
  users: {
    id: string
    email: string | null
    full_name: string | null
    created_at: string | null
  } | null
}

export default function ParishSettingsPage() {
  const [currentParish, setCurrentParish] = useState<Parish | null>(null)
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
  const [donationsQuickAmountsData, setDonationsQuickAmountsData] = useState([
    { amount: 500, label: '$5' },
    { amount: 1000, label: '$10' },
    { amount: 2500, label: '$25' },
    { amount: 5000, label: '$50' }
  ])
  const [members, setMembers] = useState<ParishMember[]>([])
  const [invitations, setInvitations] = useState<ParishInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; email: string } | null>(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<ParishRole>('parishioner')
  const [inviteModules, setInviteModules] = useState<string[]>([])
  const { setBreadcrumbs } = useBreadcrumbs()

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
          setQuickAmountsData(settingsResult.settings.mass_intention_offering_quick_amount || [
            { amount: 100, label: '$1' },
            { amount: 200, label: '$2' },
            { amount: 500, label: '$5' }
          ])
          setDonationsQuickAmountsData(settingsResult.settings.donations_quick_amount || [
            { amount: 500, label: '$5' },
            { amount: 1000, label: '$10' },
            { amount: 2500, label: '$25' },
            { amount: 5000, label: '$50' }
          ])
          setLiturgicalLocale(settingsResult.settings.liturgical_locale || 'en_US')
        } else {
          // If settings don't exist, ensure we still have default values
          console.warn('Parish settings not found, using defaults')
        }
        
        await loadMembers(parish.id)
      }
    } catch (error) {
      console.error('Error loading parish data:', error)
      toast.error('Failed to load parish data')
    } finally {
      setLoading(false)
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

  const handleDonationsQuickAmountChange = (index: number, field: 'amount' | 'label', value: string | number) => {
    setDonationsQuickAmountsData(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: field === 'amount' ? Number(value) : value } : item
    ))
  }

  const addDonationsQuickAmount = () => {
    setDonationsQuickAmountsData(prev => [
      ...prev,
      { amount: 1000, label: '$10' }
    ])
  }

  const removeDonationsQuickAmount = (index: number) => {
    setDonationsQuickAmountsData(prev => prev.filter((_, i) => i !== index))
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

  const handleSaveDonationsQuickAmounts = async () => {
    if (!currentParish) {
      toast.error('No parish selected')
      return
    }

    setSaving(true)
    try {
      await updateParishSettings(currentParish.id, {
        donations_quick_amount: donationsQuickAmountsData
      })
      toast.success('Donations quick amounts saved successfully!')
    } catch (error) {
      console.error('Error saving donations quick amounts:', error)
      toast.error('Failed to save donations quick amounts')
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'staff': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'ministry-leader': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'parishioner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getRoleLabel = (role: string) => {
    // Use English labels for now - TODO: Add language selection
    return PARISH_ROLE_LABELS[role as ParishRole]?.en || role
  }

  if (loading) {
    return (
      <PageContainer
        title="Parish Settings"
        description="Manage your parish information and administrative settings"
        maxWidth="4xl"
      >
        <div className="space-y-6">Loading parish settings...</div>
      </PageContainer>
    )
  }

  if (!currentParish) {
    return (
      <PageContainer
        title="Parish Settings"
        description="Manage your parish information and administrative settings"
        maxWidth="4xl"
      >
        <Card>
          <CardContent className="text-center py-12">
            <Church className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Parish Selected</h3>
            <p className="text-muted-foreground">
              Please select a parish to manage its settings.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Parish Settings"
      description="Manage your parish information, members, and administrative settings"
      maxWidth="6xl"
    >
      <div className="flex justify-end mb-6 gap-3">
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Parish Settings
          </TabsTrigger>
          <TabsTrigger value="mass-intentions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Mass Intentions
          </TabsTrigger>
          <TabsTrigger value="donations" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Donations
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members ({members.length + invitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Church className="h-5 w-5" />
                Parish Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liturgical Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="liturgical-locale">Liturgical Calendar Locale</Label>
                <Select value={liturgicalLocale} onValueChange={setLiturgicalLocale}>
                  <SelectTrigger id="liturgical-locale">
                    <SelectValue placeholder="Select locale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_US">English (United States)</SelectItem>
                    <SelectItem value="es_MX">Spanish (Mexico)</SelectItem>
                    <SelectItem value="es_ES">Spanish (Spain)</SelectItem>
                    <SelectItem value="fr_FR">French (France)</SelectItem>
                    <SelectItem value="pt_BR">Portuguese (Brazil)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  This determines which liturgical calendar events are imported from the API
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveLiturgicalLocale} disabled={saving} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Locale'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parish Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="mt-1 text-sm">{new Date(currentParish.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mass-intentions" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button onClick={handleSaveQuickAmounts} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Quick Amounts'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <DollarSign className="h-5 w-5" />
                Mass Intention Offering Quick Amounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Configure the quick amount buttons that appear when entering Mass intention offerings.
                Amounts are stored in cents for precise calculations.
              </p>

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
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="donations" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button onClick={handleSaveDonationsQuickAmounts} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Quick Amounts'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <DollarSign className="h-5 w-5" />
                Donation Quick Amounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Configure the quick amount buttons that appear when entering donations.
                Amounts are stored in cents for precise calculations.
              </p>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading quick amounts...</div>
                </div>
              ) : (
                <>
              <div className="space-y-4">
                {donationsQuickAmountsData.map((quickAmount, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`donations-amount-${index}`}>
                          Amount (cents)
                        </Label>
                        <Input
                          id={`donations-amount-${index}`}
                          type="number"
                          min="1"
                          step="1"
                          value={quickAmount.amount}
                          onChange={(e) => handleDonationsQuickAmountChange(index, 'amount', parseInt(e.target.value) || 0)}
                          placeholder="100"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          ${(quickAmount.amount / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor={`donations-label-${index}`}>
                          Display Label
                        </Label>
                        <Input
                          id={`donations-label-${index}`}
                          type="text"
                          value={quickAmount.label}
                          onChange={(e) => handleDonationsQuickAmountChange(index, 'label', e.target.value)}
                          placeholder="$1"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDonationsQuickAmount(index)}
                      disabled={donationsQuickAmountsData.length <= 1}
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
                  onClick={addDonationsQuickAmount}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Quick Amount
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Preview:</h4>
                <div className="flex gap-2 flex-wrap">
                  {donationsQuickAmountsData.map((quickAmount, index) => (
                    <Badge key={index} variant="outline">
                      {quickAmount.label}
                    </Badge>
                  ))}
                </div>
              </div>
                </>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="h-5 w-5" />
                  Pending Invitations ({invitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                      <div className="flex-1">
                        <div className="font-medium">{invitation.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Invited {new Date(invitation.created_at).toLocaleDateString()} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {invitation.roles.map((role) => (
                            <Badge key={role} className={getRoleColor(role)} variant="outline">
                              {getRoleLabel(role)}
                            </Badge>
                          ))}
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
              </CardContent>
            </Card>
          )}

          {/* Active Members */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                Parish Members ({members.length})
              </CardTitle>
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
                      <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as ParishRole)}>
                        <SelectTrigger id="invite-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PARISH_ROLE_VALUES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {PARISH_ROLE_LABELS[role].en}
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
            </CardHeader>
            <CardContent>
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
                          {member.users?.full_name || member.users?.email || 'Parish Member'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.users?.email && member.users?.full_name && member.users.email !== member.users.full_name
                            ? member.users.email
                            : member.users?.created_at
                              ? `Member since ${new Date(member.users.created_at).toLocaleDateString()}`
                              : 'Parish team member'
                          }
                        </div>
                        <div className="flex gap-1 mt-2">
                          {member.roles.map((role) => (
                            <Badge key={role} className={getRoleColor(role)}>
                              {getRoleLabel(role)}
                            </Badge>
                          ))}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </PageContainer>
  )
}