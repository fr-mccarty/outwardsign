'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, BookTemplate, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MassRoleTemplate } from "@/lib/actions/mass-role-templates"

interface Step3TemplateSelectionProps {
  templates: MassRoleTemplate[]
  selectedTemplateId: string | null
  onChange: (templateId: string) => void
}

export function Step3TemplateSelection({
  templates,
  selectedTemplateId,
  onChange
}: Step3TemplateSelectionProps) {
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <BookTemplate className="h-6 w-6 text-primary mt-1" />
        <div>
          <h2 className="text-2xl font-semibold">Select Role Template</h2>
          <p className="text-muted-foreground mt-1">
            Choose which roles need to be assigned for these Masses
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mass Role Template</CardTitle>
          <CardDescription>
            The same template will be used for all scheduled Masses
          </CardDescription>
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
            <div className="grid grid-cols-1 gap-3">
              {templates.map((template) => {
                const isSelected = template.id === selectedTemplateId

                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => onChange(template.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {isSelected ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{template.name}</h4>
                            {isSelected && (
                              <Badge variant="default">Selected</Badge>
                            )}
                          </div>

                          {template.description && (
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          )}

                          {template.note && (
                            <p className="text-xs text-muted-foreground italic">
                              Note: {template.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Selected Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Template Name:</span>
              <p className="text-muted-foreground">{selectedTemplate.name}</p>
            </div>

            {selectedTemplate.description && (
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-muted-foreground">{selectedTemplate.description}</p>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This template will be used to create role assignments for all scheduled Masses.
                The automatic scheduling algorithm will attempt to assign ministers to each role.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {!selectedTemplateId && templates.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a template to continue
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
              <li>The same template will be applied to all Masses in this schedule</li>
              <li>You can manually adjust assignments after scheduling</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
