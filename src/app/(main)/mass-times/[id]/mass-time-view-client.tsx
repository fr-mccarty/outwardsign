'use client'

import { MassTimeWithRelations, deleteMassTime } from '@/lib/actions/mass-times'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { ModuleViewPanel } from '@/components/module-view-panel'

interface MassTimeViewClientProps {
  massTime: MassTimeWithRelations
}

export function MassTimeViewClient({ massTime }: MassTimeViewClientProps) {
  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/mass-times/${massTime.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Template
        </Link>
      </Button>
    </>
  )

  // Generate details section content
  const details = (
    <>
      <div className="flex items-center gap-2">
        <span className="font-medium">Status:</span>
        <Badge variant={massTime.is_active ? 'default' : 'secondary'}>
          {massTime.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    </>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Template Information */}
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Template Name</div>
              <div className="font-medium text-lg">{massTime.name}</div>
            </div>

            {massTime.description && (
              <div>
                <div className="text-sm text-muted-foreground">Description</div>
                <p className="whitespace-pre-wrap mt-1">{massTime.description}</p>
              </div>
            )}

            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge variant={massTime.is_active ? 'default' : 'secondary'} className="mt-1">
                {massTime.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Template Items Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Mass Times</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Mass time items can be managed separately for this template.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Side Panel */}
      <ModuleViewPanel
        entity={massTime}
        entityType="Mass Times Template"
        modulePath="mass-times"
        actionButtons={actionButtons}
        details={details}
        onDelete={deleteMassTime}
      />
    </div>
  )
}
