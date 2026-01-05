'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { ListCard } from '@/components/list-card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { FormDialog } from '@/components/form-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Settings,
  Key,
  MoreVertical,
  AlertTriangle,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
} from 'lucide-react'
import Link from 'next/link'
import {
  updateParishOAuthSettings,
  updateUserOAuthPermissions,
  deleteUserOAuthPermissions,
  adminRevokeToken,
  adminRevokeUserTokens,
  getParishOAuthSettings,
  getParishUserOAuthPermissions,
  getParishActiveTokens,
  getParishOAuthClient,
  generateParishOAuthClient,
  regenerateParishClientSecret,
  deleteParishOAuthClient,
  getParishUsersForOAuthPermissions,
} from '@/lib/actions/oauth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { formatDatePretty, formatDateRelative } from '@/lib/utils/formatters'
import type { OAuthScope, OAuthUserPermissions } from '@/lib/oauth/types'
import { OAUTH_SCOPES, SCOPE_DESCRIPTIONS } from '@/lib/oauth/types'

interface OAuthSettingsClientProps {
  initialSettings: {
    oauth_enabled: boolean
    oauth_default_user_scopes: OAuthScope[]
  }
  initialUserPermissions: Array<OAuthUserPermissions & { user_email: string | null }>
  initialActiveTokens: Array<{
    id: string
    type: 'access' | 'refresh'
    client_id: string
    client_name: string
    user_id: string
    user_email: string | null
    scopes: string[]
    created_at: string
    expires_at: string
    last_used_at: string | null
  }>
  initialClient: {
    client_id: string
    name: string
    description: string | null
    created_at: string
    client_secret_prefix: string
  } | null
  siteUrl: string
}

export function OAuthSettingsClient({
  initialSettings,
  initialUserPermissions,
  initialActiveTokens,
  initialClient,
  siteUrl,
}: OAuthSettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [userPermissions, setUserPermissions] = useState(initialUserPermissions)
  const [activeTokens, setActiveTokens] = useState(initialActiveTokens)
  const [client, setClient] = useState(initialClient)
  const [saving, setSaving] = useState(false)

  // Client credentials state
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [generatingClient, setGeneratingClient] = useState(false)

  // Regenerate secret dialog
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)

  // Delete client dialog
  const [deleteClientDialogOpen, setDeleteClientDialogOpen] = useState(false)

  // Edit user permissions dialog
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<(OAuthUserPermissions & { user_email: string | null }) | null>(null)
  const [editUserEnabled, setEditUserEnabled] = useState(true)
  const [editUserScopes, setEditUserScopes] = useState<OAuthScope[]>([])

  // Delete user permissions dialog
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<(OAuthUserPermissions & { user_email: string | null }) | null>(null)

  // Add user permissions dialog
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<Array<{ user_id: string; email: string; roles: string[] }>>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [addUserEnabled, setAddUserEnabled] = useState(true)
  const [addUserScopes, setAddUserScopes] = useState<OAuthScope[]>(['read', 'profile'])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Revoke token dialog
  const [revokeTokenDialogOpen, setRevokeTokenDialogOpen] = useState(false)
  const [tokenToRevoke, setTokenToRevoke] = useState<{ id: string; type: 'access' | 'refresh'; user_email: string | null } | null>(null)

  async function loadData() {
    try {
      const [newSettings, newPermissions, newTokens, newClient] = await Promise.all([
        getParishOAuthSettings(),
        getParishUserOAuthPermissions(),
        getParishActiveTokens(),
        getParishOAuthClient(),
      ])
      setSettings(newSettings)
      setUserPermissions(newPermissions)
      setActiveTokens(newTokens)
      setClient(newClient)
    } catch (error) {
      console.error('Error loading OAuth data:', error)
      toast.error('Failed to load OAuth settings')
    }
  }

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  // Client management handlers
  const handleGenerateClient = async () => {
    try {
      setGeneratingClient(true)
      const result = await generateParishOAuthClient()
      setGeneratedSecret(result.client_secret)
      await loadData()
      toast.success('OAuth client created successfully')
    } catch (error) {
      console.error('Error generating OAuth client:', error)
      toast.error('Failed to create OAuth client')
    } finally {
      setGeneratingClient(false)
    }
  }

  const handleRegenerateSecret = async () => {
    try {
      const result = await regenerateParishClientSecret()
      setGeneratedSecret(result.client_secret)
      setRegenerateDialogOpen(false)
      toast.success('Client secret regenerated')
    } catch (error) {
      console.error('Error regenerating secret:', error)
      toast.error('Failed to regenerate secret')
      throw error
    }
  }

  const handleDeleteClient = async () => {
    try {
      await deleteParishOAuthClient()
      setClient(null)
      setGeneratedSecret(null)
      setDeleteClientDialogOpen(false)
      toast.success('OAuth client deleted')
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Failed to delete OAuth client')
      throw error
    }
  }

  // Settings handlers
  const handleToggleOAuth = async (enabled: boolean) => {
    try {
      setSaving(true)
      await updateParishOAuthSettings({ oauth_enabled: enabled })
      setSettings((prev) => ({ ...prev, oauth_enabled: enabled }))
      toast.success(enabled ? 'OAuth enabled' : 'OAuth disabled')
    } catch (error) {
      console.error('Error updating OAuth settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateDefaultScopes = async (scopes: OAuthScope[]) => {
    try {
      setSaving(true)
      await updateParishOAuthSettings({ oauth_default_user_scopes: scopes })
      setSettings((prev) => ({ ...prev, oauth_default_user_scopes: scopes }))
      toast.success('Default scopes updated')
    } catch (error) {
      console.error('Error updating default scopes:', error)
      toast.error('Failed to update default scopes')
    } finally {
      setSaving(false)
    }
  }

  const handleDefaultScopeToggle = (scope: OAuthScope) => {
    const newScopes = settings.oauth_default_user_scopes.includes(scope)
      ? settings.oauth_default_user_scopes.filter((s) => s !== scope)
      : [...settings.oauth_default_user_scopes, scope]
    handleUpdateDefaultScopes(newScopes)
  }

  // User permissions handlers
  const handleOpenEditUser = (user: OAuthUserPermissions & { user_email: string | null }) => {
    setEditingUser(user)
    setEditUserEnabled(user.oauth_enabled)
    setEditUserScopes(user.allowed_scopes as OAuthScope[])
    setEditUserDialogOpen(true)
  }

  const handleSaveUserPermissions = async () => {
    if (!editingUser) return

    try {
      setSaving(true)
      await updateUserOAuthPermissions(editingUser.user_id, {
        oauth_enabled: editUserEnabled,
        allowed_scopes: editUserScopes,
      })
      toast.success('User permissions updated')
      setEditUserDialogOpen(false)
      setEditingUser(null)
      await loadData()
    } catch (error) {
      console.error('Error updating user permissions:', error)
      toast.error('Failed to update permissions')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteUser = (user: OAuthUserPermissions & { user_email: string | null }) => {
    setUserToDelete(user)
    setDeleteUserDialogOpen(true)
  }

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await deleteUserOAuthPermissions(userToDelete.user_id)
      toast.success('User permissions reset to defaults')
      setUserToDelete(null)
      await loadData()
    } catch (error) {
      console.error('Error deleting user permissions:', error)
      toast.error('Failed to reset permissions')
      throw error
    }
  }

  const handleOpenAddUser = async () => {
    try {
      setLoadingUsers(true)
      const users = await getParishUsersForOAuthPermissions()
      setAvailableUsers(users)
      setSelectedUserId('')
      setAddUserEnabled(true)
      setAddUserScopes(['read', 'profile'])
      setAddUserDialogOpen(true)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSaveAddUser = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user')
      return
    }

    try {
      setSaving(true)
      await updateUserOAuthPermissions(selectedUserId, {
        oauth_enabled: addUserEnabled,
        allowed_scopes: addUserScopes,
      })
      toast.success('User permissions added')
      setAddUserDialogOpen(false)
      setSelectedUserId('')
      await loadData()
    } catch (error) {
      console.error('Error adding user permissions:', error)
      toast.error('Failed to add user permissions')
    } finally {
      setSaving(false)
    }
  }

  // Token handlers
  const handleOpenRevokeToken = (token: { id: string; type: 'access' | 'refresh'; user_email: string | null }) => {
    setTokenToRevoke(token)
    setRevokeTokenDialogOpen(true)
  }

  const handleConfirmRevokeToken = async () => {
    if (!tokenToRevoke) return

    try {
      await adminRevokeToken(tokenToRevoke.id, tokenToRevoke.type)
      toast.success('Token revoked')
      setTokenToRevoke(null)
      await loadData()
    } catch (error) {
      console.error('Error revoking token:', error)
      toast.error('Failed to revoke token')
      throw error
    }
  }

  const handleRevokeAllUserTokens = async (userId: string, userEmail: string | null) => {
    try {
      await adminRevokeUserTokens(userId)
      toast.success(`All tokens revoked for ${userEmail || 'user'}`)
      await loadData()
    } catch (error) {
      console.error('Error revoking user tokens:', error)
      toast.error('Failed to revoke tokens')
    }
  }

  const getScopeVariant = (scope: string): 'default' | 'secondary' | 'destructive' => {
    switch (scope) {
      case 'read':
      case 'profile':
        return 'secondary'
      case 'write':
        return 'default'
      case 'delete':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const renderUserPermissionItem = (perm: OAuthUserPermissions & { user_email: string | null }) => {
    return (
      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{perm.user_email || 'Unknown User'}</span>
            {!perm.oauth_enabled && (
              <Badge variant="outline" className="text-xs">
                Disabled
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {(perm.allowed_scopes as string[]).map((scope) => (
              <Badge key={scope} variant={getScopeVariant(scope)} className="text-xs">
                {scope}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Updated {formatDateRelative(perm.updated_at)}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenEditUser(perm)}>
              Edit Permissions
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRevokeAllUserTokens(perm.user_id, perm.user_email)}
            >
              Revoke All Tokens
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleOpenDeleteUser(perm)}
              className="text-destructive"
            >
              Reset to Defaults
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  const renderTokenItem = (token: typeof activeTokens[0]) => {
    return (
      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{token.client_name}</span>
            <Badge variant={token.type === 'access' ? 'secondary' : 'default'} className="text-xs">
              {token.type}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {token.user_email || 'Unknown User'}
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {token.scopes.map((scope) => (
              <Badge key={scope} variant={getScopeVariant(scope)} className="text-xs">
                {scope}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Created {formatDatePretty(token.created_at)}
            {' • '}
            Expires {formatDateRelative(token.expires_at)}
            {token.last_used_at && ` • Last used ${formatDateRelative(token.last_used_at)}`}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenRevokeToken(token)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <PageContainer
        title="OAuth Settings"
        description={
          <span>
            Manage OAuth access for third-party applications like Claude.ai. Control which users can authorize apps and what data they can access.{' '}
            <Link href="/docs/mcp-setup" className="text-primary hover:underline inline-flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> View setup guide
            </Link>
          </span>
        }
      >
        {/* Enable/Disable OAuth */}
        <ContentCard>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Enable OAuth</h3>
              <p className="text-sm text-muted-foreground">
                Allow third-party applications like Claude.ai to access parish data on behalf of users
              </p>
            </div>
            <Switch
              id="oauth-enabled"
              checked={settings.oauth_enabled}
              onCheckedChange={handleToggleOAuth}
              disabled={saving}
            />
          </div>
        </ContentCard>

        {settings.oauth_enabled && (
          <>
            {/* Claude.ai Integration */}
            <ContentCard>
              <div className="flex items-center gap-3 mb-6">
                <Key className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Claude.ai Integration</h3>
              </div>

              {!client ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Generate client credentials to connect your parish with Claude.ai.
                    These credentials will be used to configure the MCP server connection.
                  </p>
                  <Button
                    onClick={handleGenerateClient}
                    disabled={generatingClient}
                  >
                    {generatingClient ? 'Generating...' : 'Generate Client Credentials'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Credentials Display */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Client ID</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm">
                          {client.client_id}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(client.client_id, 'client_id')}
                        >
                          {copiedField === 'client_id' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Client Secret</Label>
                      {generatedSecret ? (
                        <div className="space-y-2 mt-1">
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm break-all">
                              {generatedSecret}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(generatedSecret, 'client_secret')}
                            >
                              {copiedField === 'client_secret' ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="p-3 bg-warning/10 border border-warning rounded-lg">
                            <div className="flex items-start gap-2 text-warning">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">
                                Copy this secret now. It cannot be shown again.
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm text-muted-foreground">
                            {client.client_secret_prefix}••••••••••••••••
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRegenerateDialogOpen(true)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Configuration Instructions */}
                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-medium mb-3">Configure in Claude.ai</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use these settings when adding a custom connector in Claude.ai:
                    </p>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Remote MCP Server URL</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm">
                            {siteUrl}/mcp
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(`${siteUrl}/mcp`, 'mcp_url')}
                          >
                            {copiedField === 'mcp_url' ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter this URL in the main connector configuration field
                        </p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs font-medium mb-2">Advanced Settings</p>
                        <p className="text-xs text-muted-foreground">
                          In Claude.ai&apos;s advanced settings, enter the Client ID and Client Secret shown above.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="text-xs text-muted-foreground">
                      Created {formatDatePretty(client.created_at)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteClientDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Client
                    </Button>
                  </div>
                </div>
              )}
            </ContentCard>

            {/* Default Scopes */}
            <ContentCard>
              <div className="flex items-center gap-3 mb-6">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Default User Scopes</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Default permissions for users without custom settings
              </p>
              <div className="space-y-2">
                {OAUTH_SCOPES.map((scope) => (
                  <div key={scope} className="flex items-center space-x-2">
                    <Checkbox
                      id={`default-scope-${scope}`}
                      checked={settings.oauth_default_user_scopes.includes(scope)}
                      onCheckedChange={() => handleDefaultScopeToggle(scope)}
                      disabled={saving}
                    />
                    <label
                      htmlFor={`default-scope-${scope}`}
                      className="text-sm font-medium capitalize"
                    >
                      {scope}
                    </label>
                    <span className="text-xs text-muted-foreground">
                      - {SCOPE_DESCRIPTIONS[scope]}
                    </span>
                  </div>
                ))}
              </div>
            </ContentCard>

            {/* User Permissions */}
            <ListCard
              title="User Permissions"
              description="Custom OAuth permissions for specific users. Users not listed use the default settings."
              items={userPermissions}
              renderItem={renderUserPermissionItem}
              getItemId={(perm) => perm.id}
              emptyMessage="No custom user permissions. All users use the default settings above."
              onAdd={handleOpenAddUser}
              addButtonLabel="Add User"
            />

            {/* Active Tokens */}
            <ListCard
              title="Active Tokens"
              description="Currently active OAuth tokens. Revoke tokens to immediately terminate access."
              items={activeTokens}
              renderItem={renderTokenItem}
              getItemId={(token) => token.id}
              emptyMessage="No active OAuth tokens."
            />
          </>
        )}
      </PageContainer>

      {/* Edit User Permissions Dialog */}
      <FormDialog
        open={editUserDialogOpen}
        onOpenChange={setEditUserDialogOpen}
        title="Edit User Permissions"
        description={`Configure OAuth permissions for ${editingUser?.user_email || 'this user'}`}
        onSubmit={handleSaveUserPermissions}
        isLoading={saving}
        submitLabel="Save"
        loadingLabel="Saving..."
      >
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="user-oauth-enabled" className="font-medium">
                OAuth Enabled
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow this user to authorize applications
              </p>
            </div>
            <Switch
              id="user-oauth-enabled"
              checked={editUserEnabled}
              onCheckedChange={setEditUserEnabled}
            />
          </div>

          <div>
            <Label className="font-medium">Allowed Scopes</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Maximum scopes this user can grant to applications
            </p>
            <div className="space-y-2">
              {OAUTH_SCOPES.map((scope) => (
                <div key={scope} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-scope-${scope}`}
                    checked={editUserScopes.includes(scope)}
                    onCheckedChange={() => {
                      setEditUserScopes((prev) =>
                        prev.includes(scope)
                          ? prev.filter((s) => s !== scope)
                          : [...prev, scope]
                      )
                    }}
                  />
                  <label
                    htmlFor={`user-scope-${scope}`}
                    className="text-sm font-medium capitalize"
                  >
                    {scope}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    - {SCOPE_DESCRIPTIONS[scope]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {editUserScopes.includes('delete') && (
            <div className="p-3 bg-warning/10 border border-warning rounded-lg">
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Delete scope allows removing parish data
                </span>
              </div>
            </div>
          )}
        </div>
      </FormDialog>

      {/* Delete User Permissions Dialog */}
      <ConfirmationDialog
        open={deleteUserDialogOpen}
        onOpenChange={setDeleteUserDialogOpen}
        title="Reset User Permissions"
        itemName={userToDelete?.user_email || 'this user'}
        confirmLabel="Reset"
        onConfirm={handleConfirmDeleteUser}
      >
        <p className="text-sm text-muted-foreground">
          This will remove custom permissions for this user and they will use the default
          parish settings instead.
        </p>
      </ConfirmationDialog>

      {/* Revoke Token Dialog */}
      <ConfirmationDialog
        open={revokeTokenDialogOpen}
        onOpenChange={setRevokeTokenDialogOpen}
        title="Revoke Token"
        itemName={`${tokenToRevoke?.type} token`}
        confirmLabel="Revoke"
        onConfirm={handleConfirmRevokeToken}
      >
        <p className="text-sm text-muted-foreground">
          This will immediately revoke this token. The application will lose access until the
          user re-authorizes.
        </p>
      </ConfirmationDialog>

      {/* Regenerate Client Secret Dialog */}
      <ConfirmationDialog
        open={regenerateDialogOpen}
        onOpenChange={setRegenerateDialogOpen}
        title="Regenerate Client Secret"
        itemName="client secret"
        confirmLabel="Regenerate"
        onConfirm={handleRegenerateSecret}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This will generate a new client secret. The old secret will immediately stop working.
          </p>
          <div className="p-3 bg-warning/10 border border-warning rounded-lg">
            <div className="flex items-start gap-2 text-warning">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                You will need to update the secret in Claude.ai after regenerating.
              </span>
            </div>
          </div>
        </div>
      </ConfirmationDialog>

      {/* Delete Client Dialog */}
      <ConfirmationDialog
        open={deleteClientDialogOpen}
        onOpenChange={setDeleteClientDialogOpen}
        title="Delete OAuth Client"
        itemName="OAuth client"
        confirmLabel="Delete"
        onConfirm={handleDeleteClient}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This will permanently delete the OAuth client and revoke all associated tokens and consents.
          </p>
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <div className="flex items-start gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                All users will lose access to Claude.ai integration until a new client is created.
              </span>
            </div>
          </div>
        </div>
      </ConfirmationDialog>

      {/* Add User Permissions Dialog */}
      <FormDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        title="Add User Permissions"
        description="Configure custom OAuth permissions for a specific user"
        onSubmit={handleSaveAddUser}
        isLoading={saving}
        submitLabel="Add"
        loadingLabel="Adding..."
      >
        <div className="space-y-4 py-4">
          <div>
            <Label className="font-medium">Select User</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Choose a user to configure custom OAuth permissions
            </p>
            {loadingUsers ? (
              <div className="text-sm text-muted-foreground">Loading users...</div>
            ) : availableUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                All users already have custom permissions configured.
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      <div className="flex items-center gap-2">
                        <span>{user.email}</span>
                        <span className="text-xs text-muted-foreground">
                          ({user.roles.join(', ')})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="add-user-oauth-enabled" className="font-medium">
                OAuth Enabled
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow this user to authorize applications
              </p>
            </div>
            <Switch
              id="add-user-oauth-enabled"
              checked={addUserEnabled}
              onCheckedChange={setAddUserEnabled}
            />
          </div>

          <div>
            <Label className="font-medium">Allowed Scopes</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Maximum scopes this user can grant to applications
            </p>
            <div className="space-y-2">
              {OAUTH_SCOPES.map((scope) => (
                <div key={scope} className="flex items-center space-x-2">
                  <Checkbox
                    id={`add-user-scope-${scope}`}
                    checked={addUserScopes.includes(scope)}
                    onCheckedChange={() => {
                      setAddUserScopes((prev) =>
                        prev.includes(scope)
                          ? prev.filter((s) => s !== scope)
                          : [...prev, scope]
                      )
                    }}
                  />
                  <label
                    htmlFor={`add-user-scope-${scope}`}
                    className="text-sm font-medium capitalize"
                  >
                    {scope}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    - {SCOPE_DESCRIPTIONS[scope]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {addUserScopes.includes('delete') && (
            <div className="p-3 bg-warning/10 border border-warning rounded-lg">
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Delete scope allows removing parish data
                </span>
              </div>
            </div>
          )}
        </div>
      </FormDialog>
    </>
  )
}
