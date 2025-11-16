'use client'

import { useState, useEffect } from 'react'
import { MassRoleTemplate } from '@/lib/actions/mass-role-templates'
import { getTemplateItems, type MassRoleTemplateItemWithRole } from '@/lib/actions/mass-role-template-items'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MassRoleTemplateFormActions } from './mass-role-template-form-actions'
import { toast } from 'sonner'

interface MassRoleTemplateViewClientProps {
  template: MassRoleTemplate
}

export function MassRoleTemplateViewClient({ template }: MassRoleTemplateViewClientProps) {
  const [items, setItems] = useState<MassRoleTemplateItemWithRole[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [template.id])

  const loadItems = async () => {
    try {
      setIsLoading(true)
      const data = await getTemplateItems(template.id)
      setItems(data)
    } catch (error) {
      console.error('Failed to load template items:', error)
      toast.error('Failed to load template roles')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <MassRoleTemplateFormActions template={template} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
            <CardDescription>Basic details about this template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Template Name</dt>
              <dd className="text-base">{template.name}</dd>
            </div>
            {template.description && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Description</dt>
                <dd className="text-base">{template.description}</dd>
              </div>
            )}
            {template.note && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Internal Note</dt>
                <dd className="text-base">{template.note}</dd>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Mass Roles */}
        <Card>
          <CardHeader>
            <CardTitle>Template Mass Roles</CardTitle>
            <CardDescription>Mass roles required for this Mass type</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading mass roles...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No mass roles defined yet. Edit this template to add mass role requirements.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.mass_role.name}</p>
                      {item.mass_role.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.mass_role.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {item.count} {item.count === 1 ? 'needed' : 'needed'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">Created</dt>
            <dd className="text-base">
              {new Date(template.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">Last Updated</dt>
            <dd className="text-base">
              {new Date(template.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </dd>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
