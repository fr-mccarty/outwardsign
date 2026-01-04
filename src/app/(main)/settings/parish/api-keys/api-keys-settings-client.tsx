'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { ListCard } from '@/components/list-card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FormInput } from '@/components/form-input'
import { FormDialog } from '@/components/form-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Trash2, Copy, Key, AlertTriangle } from 'lucide-react'
import {
  createMCPApiKey,
  getUserApiKeys,
  revokeApiKey,
  deleteApiKey,
  type MCPApiKey,
  type CreateApiKeyResult,
} from '@/lib/actions/mcp-api-keys'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { formatDatePretty, formatDateRelative } from '@/lib/utils/formatters'

interface ApiKeysSettingsClientProps {
  initialApiKeys: MCPApiKey[]
}

export function ApiKeysSettingsClient({ initialApiKeys }: ApiKeysSettingsClientProps) {
  const [apiKeys, setApiKeys] = useState<MCPApiKey[]>(initialApiKeys)
  const [saving, setSaving] = useState(false)

  // Create key dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [keyScopes, setKeyScopes] = useState<('read' | 'write' | 'delete')[]>(['read'])
  const [keyExpires, setKeyExpires] = useState<string>('')

  // New key display dialog
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false)
  const [newKeyResult, setNewKeyResult] = useState<CreateApiKeyResult | null>(null)

  // Revoke confirmation dialog
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [keyToRevoke, setKeyToRevoke] = useState<MCPApiKey | null>(null)

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState<MCPApiKey | null>(null)

  async function loadApiKeys() {
    try {
      const keys = await getUserApiKeys()
      setApiKeys(keys)
    } catch (error) {
      console.error('Error loading API keys:', error)
      toast.error('Failed to load API keys')
    }
  }

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      toast.error('Please enter a name for the API key')
      return
    }

    if (keyScopes.length === 0) {
      toast.error('Please select at least one scope')
      return
    }

    try {
      setSaving(true)
      const result = await createMCPApiKey({
        name: keyName.trim(),
        scopes: keyScopes,
        expires_at: keyExpires || null,
      })

      setNewKeyResult(result)
      setCreateDialogOpen(false)
      setNewKeyDialogOpen(true)
      setKeyName('')
      setKeyScopes(['read'])
      setKeyExpires('')
      await loadApiKeys()
    } catch (error) {
      console.error('Error creating API key:', error)
      toast.error('Failed to create API key')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyKey = () => {
    if (newKeyResult?.key) {
      navigator.clipboard.writeText(newKeyResult.key)
      toast.success('API key copied to clipboard')
    }
  }

  const handleOpenRevokeDialog = (key: MCPApiKey) => {
    setKeyToRevoke(key)
    setRevokeDialogOpen(true)
  }

  const handleConfirmRevoke = async () => {
    if (!keyToRevoke) return

    try {
      await revokeApiKey(keyToRevoke.id)
      toast.success('API key revoked')
      setKeyToRevoke(null)
      await loadApiKeys()
    } catch (error) {
      console.error('Error revoking API key:', error)
      toast.error('Failed to revoke API key')
      throw error
    }
  }

  const handleOpenDeleteDialog = (key: MCPApiKey) => {
    setKeyToDelete(key)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!keyToDelete) return

    try {
      await deleteApiKey(keyToDelete.id)
      toast.success('API key deleted')
      setKeyToDelete(null)
      await loadApiKeys()
    } catch (error) {
      console.error('Error deleting API key:', error)
      toast.error('Failed to delete API key')
      throw error
    }
  }

  const handleScopeToggle = (scope: 'read' | 'write' | 'delete') => {
    setKeyScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    )
  }

  const getScopeVariant = (scope: string): 'default' | 'secondary' | 'destructive' => {
    switch (scope) {
      case 'read':
        return 'secondary'
      case 'write':
        return 'default'
      case 'delete':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const renderApiKeyItem = (key: MCPApiKey) => {
    const isExpired = key.expires_at && new Date(key.expires_at) < new Date()
    const isRevoked = !!key.revoked_at

    return (
      <div
        className={`flex items-center justify-between p-4 border rounded-lg ${
          isRevoked ? 'opacity-50' : ''
        }`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{key.name}</span>
            {isRevoked && (
              <Badge variant="destructive" className="text-xs">
                Revoked
              </Badge>
            )}
            {isExpired && !isRevoked && (
              <Badge variant="outline" className="text-xs text-warning">
                Expired
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            <code className="bg-muted px-1 rounded">{key.key_prefix}...</code>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {key.scopes.map((scope) => (
              <Badge key={scope} variant={getScopeVariant(scope)} className="text-xs">
                {scope}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Created {formatDatePretty(key.created_at)}
            {key.last_used_at && ` • Last used ${formatDateRelative(key.last_used_at)}`}
            {key.use_count > 0 && ` • Used ${key.use_count} times`}
            {key.expires_at && ` • Expires ${formatDatePretty(key.expires_at)}`}
          </div>
        </div>
        {!isRevoked && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenRevokeDialog(key)}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Revoke Key
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleOpenDeleteDialog(key)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Key
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {isRevoked && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDeleteDialog(key)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  const activeKeys = apiKeys.filter((k) => !k.revoked_at)
  const revokedKeys = apiKeys.filter((k) => !!k.revoked_at)

  return (
    <>
      <PageContainer
        title="API Keys"
        description="Manage API keys for MCP (Model Context Protocol) access to your parish data. Use these keys with Claude Desktop or other AI assistants."
      >
        {/* Setup Instructions */}
        <ContentCard>
          <h3 className="font-semibold mb-2">Claude Desktop Setup</h3>
          <p className="text-sm text-muted-foreground mb-4">
            To use Outward Sign with Claude Desktop, add the following to your Claude Desktop
            configuration file:
          </p>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            {`{
  "mcpServers": {
    "outward-sign": {
      "command": "npx",
      "args": ["-y", "@outwardsign/mcp"],
      "env": {
        "OUTWARD_SIGN_API_KEY": "your-api-key-here"
      }
    }
  }
}`}
          </pre>
          <p className="text-sm text-muted-foreground mt-4">
            Replace <code className="bg-muted px-1 rounded">your-api-key-here</code> with an API
            key generated below.
          </p>
        </ContentCard>

        {/* Active API Keys */}
        <ListCard
          title={`Active API Keys (${activeKeys.length})`}
          description="API keys with active access to your parish data"
          items={activeKeys}
          renderItem={renderApiKeyItem}
          getItemId={(key) => key.id}
          onAdd={() => setCreateDialogOpen(true)}
          addButtonLabel="Create API Key"
          emptyMessage="No active API keys. Create one to get started with MCP access."
        />

        {/* Revoked Keys */}
        {revokedKeys.length > 0 && (
          <ListCard
            title={`Revoked Keys (${revokedKeys.length})`}
            description="Previously revoked API keys"
            items={revokedKeys}
            renderItem={renderApiKeyItem}
            getItemId={(key) => key.id}
            emptyMessage=""
          />
        )}
      </PageContainer>

      {/* Create API Key Dialog */}
      <FormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Create API Key"
        description="Create a new API key for MCP access. The key will only be shown once after creation."
        onSubmit={handleCreateKey}
        isLoading={saving}
        submitLabel="Create Key"
        loadingLabel="Creating..."
      >
        <div className="space-y-4 py-4">
          <FormInput
            id="key-name"
            label="Key Name"
            inputType="text"
            value={keyName}
            onChange={setKeyName}
            placeholder="Claude Desktop - Work Laptop"
            description="A descriptive name to identify this key"
            required
          />
          <div className="space-y-2">
            <Label>Scopes</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scope-read"
                  checked={keyScopes.includes('read')}
                  onCheckedChange={() => handleScopeToggle('read')}
                />
                <label htmlFor="scope-read" className="text-sm font-medium">
                  Read
                </label>
                <span className="text-xs text-muted-foreground">- Query and list data</span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scope-write"
                  checked={keyScopes.includes('write')}
                  onCheckedChange={() => handleScopeToggle('write')}
                />
                <label htmlFor="scope-write" className="text-sm font-medium">
                  Write
                </label>
                <span className="text-xs text-muted-foreground">- Create and update records</span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scope-delete"
                  checked={keyScopes.includes('delete')}
                  onCheckedChange={() => handleScopeToggle('delete')}
                />
                <label htmlFor="scope-delete" className="text-sm font-medium">
                  Delete
                </label>
                <span className="text-xs text-muted-foreground">- Remove records</span>
              </div>
            </div>
          </div>
          <FormInput
            id="key-expires"
            label="Expiration Date (Optional)"
            inputType="date"
            value={keyExpires}
            onChange={setKeyExpires}
            description="Leave empty for no expiration"
          />
        </div>
      </FormDialog>

      {/* New Key Display Dialog */}
      <FormDialog
        open={newKeyDialogOpen}
        onOpenChange={setNewKeyDialogOpen}
        title="API Key Created"
        description="Make sure to copy your API key now. You won't be able to see it again!"
        onSubmit={() => setNewKeyDialogOpen(false)}
        submitLabel="Done"
        loadingLabel="Done"
      >
        <div className="space-y-4 py-4">
          <div className="p-4 bg-warning/10 border border-warning rounded-lg">
            <div className="flex items-center gap-2 text-warning mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Save this key now!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This is the only time you will see the full API key. Copy it now and store it
              securely.
            </p>
          </div>
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <code className="flex-1 bg-muted p-3 rounded-lg text-sm break-all">
                {newKeyResult?.key}
              </code>
              <Button variant="outline" size="icon" onClick={handleCopyKey}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Name:</strong> {newKeyResult?.name}
            <br />
            <strong>Scopes:</strong> {newKeyResult?.scopes.join(', ')}
            <br />
            {newKeyResult?.expires_at && (
              <>
                <strong>Expires:</strong> {formatDatePretty(newKeyResult.expires_at)}
              </>
            )}
          </div>
        </div>
      </FormDialog>

      {/* Revoke Confirmation Dialog */}
      <ConfirmationDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        title="Revoke API Key"
        itemName={keyToRevoke?.name}
        confirmLabel="Revoke"
        onConfirm={handleConfirmRevoke}
      >
        <p className="text-sm text-muted-foreground">
          Revoking this key will immediately disable access. Any applications using this key will
          no longer be able to access your parish data.
        </p>
      </ConfirmationDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete API Key"
        itemName={keyToDelete?.name}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      >
        <p className="text-sm text-muted-foreground">
          This will permanently delete the API key record. This action cannot be undone.
        </p>
      </ConfirmationDialog>
    </>
  )
}
