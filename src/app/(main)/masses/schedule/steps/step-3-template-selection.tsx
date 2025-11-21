'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { BookTemplate, AlertCircle, Eye, CheckSquare } from "lucide-react"
import { WizardStepHeader } from "@/components/wizard/WizardStepHeader"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MassRoleTemplate } from "@/lib/actions/mass-role-templates"
import { LITURGICAL_CONTEXT_LABELS, type LiturgicalContext } from "@/lib/constants"

interface Step3TemplateSelectionProps {
  templates: MassRoleTemplate[]
  selectedTemplateIds: string[]
  onChange: (templateIds: string[]) => void
}

export function Step3TemplateSelection({
  templates,
  selectedTemplateIds,
  onChange
}: Step3TemplateSelectionProps) {
  const [viewingTemplate, setViewingTemplate] = useState<MassRoleTemplate | null>(null)
  // Track if auto-selection has already happened
  const hasAutoSelectedRef = useRef(false)

  // Auto-select all templates on first load if none are selected
  useEffect(() => {
    if (
      !hasAutoSelectedRef.current &&
      templates.length > 0 &&
      selectedTemplateIds.length === 0
    ) {
      const allTemplateIds = templates.map(t => t.id)
      onChange(allTemplateIds)
      hasAutoSelectedRef.current = true
    }
  }, [templates, selectedTemplateIds, onChange])

  const handleSelectAll = () => {
    const allTemplateIds = templates.map(t => t.id)
    onChange(allTemplateIds)
  }

  const allSelected = templates.length > 0 && selectedTemplateIds.length === templates.length

  const handleTemplateToggle = (templateId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedTemplateIds, templateId])
    } else {
      onChange(selectedTemplateIds.filter(id => id !== templateId))
    }
  }

  return (
    <div className="space-y-6">
      <WizardStepHeader
        icon={BookTemplate}
        title="Select Role Templates"
        description="Choose which role templates to apply for these Masses"
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Mass Role Templates</CardTitle>
            <CardDescription>
              Select one or more templates to define which roles need assignments
            </CardDescription>
          </div>
          {templates.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={allSelected}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Select All
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No Mass Role Templates found. Please create a template first in the{' '}
                <a href="/mass-role-templates" className="underline">
                  Mass Role Templates
                </a>{' '}
                module.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => {
                const isSelected = selectedTemplateIds.includes(template.id)

                return (
                  <div
                    key={template.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => {
                      const isCurrentlySelected = selectedTemplateIds.includes(template.id)
                      handleTemplateToggle(template.id, !isCurrentlySelected)
                    }}
                  >
                    <Checkbox
                      id={`role-template-${template.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleTemplateToggle(template.id, checked === true)
                      }
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`role-template-${template.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {template.name}
                      </Label>
                      {template.liturgical_contexts && template.liturgical_contexts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.liturgical_contexts.map((context) => (
                            <Badge key={context} variant="secondary" className="text-xs">
                              {LITURGICAL_CONTEXT_LABELS[context as LiturgicalContext]?.en || context}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setViewingTemplate(template)
                      }}
                      className="cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTemplateIds.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">Templates Selected:</span>
              <span className="text-xl font-bold text-primary">{selectedTemplateIds.length}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTemplateIds.length === 0 && templates.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select at least one template to continue
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">About Role Templates:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Templates define which roles are needed (Lectors, EMHCs, Servers, etc.)</li>
              <li>Each role can have multiple positions (e.g., 2 Lectors, 4 EMHCs)</li>
              <li>Selected templates will be applied to all Masses in this schedule</li>
              <li>You can manually adjust assignments after scheduling</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* View Template Dialog */}
      <Dialog open={!!viewingTemplate} onOpenChange={() => setViewingTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewingTemplate?.name}</DialogTitle>
            <DialogDescription>
              Template details and role assignments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewingTemplate?.liturgical_contexts && viewingTemplate.liturgical_contexts.length > 0 && (
              <div>
                <span className="font-medium">Applies to:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {viewingTemplate.liturgical_contexts.map((context) => (
                    <Badge key={context} variant="secondary">
                      {LITURGICAL_CONTEXT_LABELS[context as LiturgicalContext]?.en || context}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {viewingTemplate?.description && (
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-muted-foreground">{viewingTemplate.description}</p>
              </div>
            )}
            {viewingTemplate?.note && (
              <div>
                <span className="font-medium">Note:</span>
                <p className="text-muted-foreground italic">{viewingTemplate.note}</p>
              </div>
            )}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                To see the full list of roles in this template, visit the{' '}
                <a href={`/mass-role-templates/${viewingTemplate?.id}`} className="underline" target="_blank">
                  template detail page
                </a>.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
