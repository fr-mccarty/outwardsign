'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/content-card'
import { LinkButton } from '@/components/link-button'
import { ChevronRight, Shield } from 'lucide-react'

export function DeveloperToolsHubClient() {
  return (
    <div className="space-y-6">
      {/* AI Tool Permissions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AI Tool Permissions
          </CardTitle>
          <CardDescription>
            Configure access control for AI assistant tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              Manage which user types (admin, staff, parishioner, MCP) can access each AI tool
              and what permission scope is required.
            </p>
            <p>
              <strong>Key concepts:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Scopes</strong>: read, write, write_self, delete, admin (hierarchical)</li>
              <li><strong>Consumers</strong>: admin, staff, parishioner, mcp</li>
              <li>Changes are saved locally to <code className="bg-muted px-1 rounded">tool-permissions.json</code></li>
              <li>Commit and push to apply changes in production</li>
            </ul>
          </div>
          <LinkButton href="/settings/developer-tools/permissions">
            Open Permissions Editor
            <ChevronRight className="h-4 w-4 ml-2" />
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  )
}
