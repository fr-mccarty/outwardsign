'use client'

import { useState, useEffect } from 'react'
import { MassRoleTemplate, deleteMassRoleTemplate } from '@/lib/actions/mass-role-templates'
import { getTemplateItems, type MassRoleTemplateItemWithRole } from '@/lib/actions/mass-role-template-items'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ModuleViewContainer } from '@/components/module-view-container'
import { Edit, Copy } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface MassRoleTemplateViewClientProps {
  template: MassRoleTemplate
}

export function MassRoleTemplateViewClient({ template }: MassRoleTemplateViewClientProps) {
  const [items, setItems] = useState<MassRoleTemplateItemWithRole[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleCopyInfo = () => {
    const info = `Mass Role Template
Name: ${template.name}
${template.description ? `Description: ${template.description}\n` : ''}${template.note ? `Note: ${template.note}\n` : ''}`
    navigator.clipboard.writeText(info)
    toast.success('Template information copied to clipboard')
  }

  // Generate action buttons for the side panel
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/mass-role-templates/${template.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Template
        </Link>
      </Button>
      <Button variant="outline" onClick={handleCopyInfo} className="w-full">
        <Copy className="h-4 w-4 mr-2" />
        Copy Info
      </Button>
    </>
  )

  // Generate details section content
  const details = (
    <>
      {template.description && (
        <div>
          <span className="font-medium">Description:</span>
          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
        </div>
      )}
      {template.note && (
        <div className={template.description ? "pt-2 border-t" : ""}>
          <span className="font-medium">Note:</span>
          <p className="text-sm text-muted-foreground mt-1">{template.note}</p>
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={template}
      entityType="Mass Role Template"
      modulePath="mass-role-templates"
      actionButtons={actionButtons}
      details={details}
      onDelete={deleteMassRoleTemplate}
    >
      {/* Template Mass Roles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Template Mass Roles</CardTitle>
              <CardDescription>Mass roles required for this Mass type</CardDescription>
            </div>
            <Button asChild>
              <Link href={`/mass-role-templates/${template.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Add Roles
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading mass roles...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No mass roles defined yet. Click &quot;Add Roles&quot; to add mass role requirements.
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
    </ModuleViewContainer>
  )
}
