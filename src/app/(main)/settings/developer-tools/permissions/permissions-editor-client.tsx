'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Save, RotateCcw, Search } from 'lucide-react'
import { saveToolPermissions, type ToolPermissionData } from '@/lib/actions/ai-tools-permissions'
import type { ToolScope, ToolConsumer, ToolCategory } from '@/lib/ai-tools/unified/types'

interface PermissionsEditorClientProps {
  initialPermissions: ToolPermissionData[]
  lastUpdated?: string
}

const SCOPES: ToolScope[] = ['read', 'write', 'write_self', 'delete', 'admin']
const CONSUMERS: ToolConsumer[] = ['admin', 'staff', 'parishioner', 'mcp']

export function PermissionsEditorClient({
  initialPermissions,
  lastUpdated,
}: PermissionsEditorClientProps) {
  const [permissions, setPermissions] = useState<ToolPermissionData[]>(initialPermissions)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(permissions.map((p) => p.category))
    return Array.from(cats).sort()
  }, [permissions])

  // Filter permissions
  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [permissions, searchTerm, categoryFilter])

  // Update a permission
  const updatePermission = (
    name: string,
    field: 'requiredScope' | 'allowedConsumers',
    value: ToolScope | ToolConsumer[]
  ) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.name === name) {
          return { ...p, [field]: value }
        }
        return p
      })
    )
    setHasChanges(true)
  }

  // Toggle a consumer
  const toggleConsumer = (name: string, consumer: ToolConsumer) => {
    const permission = permissions.find((p) => p.name === name)
    if (!permission) return

    const newConsumers = permission.allowedConsumers.includes(consumer)
      ? permission.allowedConsumers.filter((c) => c !== consumer)
      : [...permission.allowedConsumers, consumer]

    updatePermission(name, 'allowedConsumers', newConsumers)
  }

  // Save changes
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Convert to the format expected by the server action
      const toolsConfig: Record<
        string,
        { category: ToolCategory; requiredScope: ToolScope; allowedConsumers: ToolConsumer[] }
      > = {}

      for (const p of permissions) {
        toolsConfig[p.name] = {
          category: p.category,
          requiredScope: p.requiredScope,
          allowedConsumers: p.allowedConsumers,
        }
      }

      const result = await saveToolPermissions(toolsConfig)

      if (result.success) {
        toast.success('Permissions saved successfully. Restart the server to apply changes.')
        setHasChanges(false)
      } else {
        toast.error(result.error || 'Failed to save permissions')
      }
    } catch (error) {
      toast.error('Failed to save permissions')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  // Reset to initial
  const handleReset = () => {
    setPermissions(initialPermissions)
    setHasChanges(false)
    toast.info('Permissions reset to last saved state')
  }

  return (
    <div className="space-y-4">
      {/* Explanation of Required Scope and Consumers */}
      <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground space-y-3">
        <div className="space-y-2">
          <p>
            <strong className="text-foreground">Required Scope</strong> defines the minimum permission level a user must have to execute a tool.
            Scopes are hierarchical—higher scopes include all lower permissions:
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 ml-4 md:grid-cols-5">
            <li><code className="bg-muted px-1 rounded">read</code> — View data</li>
            <li><code className="bg-muted px-1 rounded">write</code> — Create/update</li>
            <li><code className="bg-muted px-1 rounded">write_self</code> — Edit own records</li>
            <li><code className="bg-muted px-1 rounded">delete</code> — Remove records</li>
            <li><code className="bg-muted px-1 rounded">admin</code> — Full access</li>
          </ul>
        </div>
        <div className="space-y-2">
          <p>
            <strong className="text-foreground">Consumers</strong> are the different contexts from which AI tools can be invoked.
            Check the boxes to allow each consumer type to access a tool:
          </p>
          <ul className="grid grid-cols-1 gap-x-4 gap-y-1 ml-4 md:grid-cols-2">
            <li><strong>Admin</strong> — Parish administrators using the /chat page with full system access</li>
            <li><strong>Staff</strong> — Parish staff members using the /chat page with operational permissions</li>
            <li><strong>Parishioner</strong> — Parishioner Portal users with limited, self-service access</li>
            <li><strong>MCP</strong> — External integrations via the Model Context Protocol (API access)</li>
          </ul>
        </div>
        <div className="space-y-2 border-t pt-3">
          <p>
            <strong className="text-foreground">Save Changes</strong> writes your modifications to <code className="bg-muted px-1 rounded">tool-permissions.json</code> in your local codebase.
            To apply changes in production, you must <strong>commit and push</strong> this file to your repository.
          </p>
        </div>
      </div>

      {/* Header with last updated and actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {lastUpdated && (
            <span>Last updated: {new Date(lastUpdated).toLocaleString()}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredPermissions.length} of {permissions.length} tools
        </div>
      </div>

      {/* Permissions table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Tool Name</TableHead>
              <TableHead className="w-[100px]">Category</TableHead>
              <TableHead className="w-[120px]">Required Scope</TableHead>
              <TableHead className="w-[80px] text-center">Admin</TableHead>
              <TableHead className="w-[80px] text-center">Staff</TableHead>
              <TableHead className="w-[80px] text-center">Parishioner</TableHead>
              <TableHead className="w-[80px] text-center">MCP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermissions.map((permission) => (
              <TableRow key={permission.name}>
                <TableCell>
                  <div className="font-mono text-sm">{permission.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {permission.description}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {permission.category}
                  </span>
                </TableCell>
                <TableCell>
                  <Select
                    value={permission.requiredScope}
                    onValueChange={(value: ToolScope) =>
                      updatePermission(permission.name, 'requiredScope', value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCOPES.map((scope) => (
                        <SelectItem key={scope} value={scope}>
                          {scope}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                {CONSUMERS.map((consumer) => (
                  <TableCell key={consumer} className="text-center">
                    <Checkbox
                      checked={permission.allowedConsumers.includes(consumer)}
                      onCheckedChange={() => toggleConsumer(permission.name, consumer)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasChanges && (
        <div className="text-sm text-amber-600 dark:text-amber-400">
          You have unsaved changes. Click &quot;Save Changes&quot; to persist them.
        </div>
      )}
    </div>
  )
}
