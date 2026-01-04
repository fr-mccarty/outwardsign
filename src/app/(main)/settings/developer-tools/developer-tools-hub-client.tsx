'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/content-card'
import { LinkButton } from '@/components/link-button'
import { Layers, ChevronRight } from 'lucide-react'

export function DeveloperToolsHubClient() {
  return (
    <div className="space-y-6">
      {/* Template Structure Browser Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Template Structure Browser
          </CardTitle>
          <CardDescription>
            Explore and debug the template system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              The Template Structure Browser helps you understand how scripts and content work together
              to generate printed documents like funeral programs, wedding booklets, and mass scripts.
            </p>
            <p>
              <strong>Use this tool to:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Browse event types (Wedding, Funeral, Baptism, etc.) and their associated scripts</li>
              <li>View the sections within each script and the placeholders they use</li>
              <li>See which placeholders reference content from the Content Library</li>
              <li>Inspect the template structure of content items to see nested placeholders</li>
              <li>Troubleshoot placeholder issues when scripts aren&apos;t rendering correctly</li>
            </ul>
            <p>
              <strong>Key concepts:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Sections</strong> are slots in a script that define WHERE content appears and HOW it&apos;s formatted (the structure)</li>
              <li><strong>Content Library</strong> provides reusable content blocks (prayers, readings, blessings) that get inserted into sections (the substance)</li>
              <li><strong>Placeholders</strong> like <code className="bg-muted px-1 rounded">{`{{bride.full_name}}`}</code> can appear in both sections and content library items</li>
              <li><strong>Two-pass rendering</strong> first fills section placeholders, then fills any placeholders inside the inserted content</li>
            </ul>
          </div>
          <LinkButton href="/settings/developer-tools/template-browser">
            Open Template Browser
            <ChevronRight className="h-4 w-4 ml-2" />
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  )
}
