"use client"

import { useState } from 'react'
import { FormSectionCard } from '@/components/form-section-card'
import { Button } from '@/components/ui/button'
import { FileText, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DialogButton } from '@/components/dialog-button'
import { FormInput } from '@/components/form-input'

export interface PetitionTemplate {
  id: string
  name: string
  description?: string
}

interface PetitionEditorProps {
  value: string
  onChange: (value: string) => void
  onInsertTemplate?: (templateId: string) => string[] // Returns array of petition texts from selected template
  templates?: PetitionTemplate[]
  readOnly?: boolean
}

export function PetitionEditor({
  value,
  onChange,
  onInsertTemplate,
  templates = [],
  readOnly = false,
}: PetitionEditorProps) {
  const [showFormatInfo, setShowFormatInfo] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates.length > 0 ? templates[0].id : ''
  )

  const insertTemplate = () => {
    if (!onInsertTemplate || !selectedTemplateId) return

    // Get petition texts from selected template
    const templateTexts = onInsertTemplate(selectedTemplateId)

    // Add to existing petitions (one per line)
    const currentPetitions = value ? value.split('\n').filter(line => line.trim()) : []
    const allPetitions = [...currentPetitions, ...templateTexts]

    onChange(allPetitions.join('\n'))
  }

  return (
    <FormSectionCard
      title="Petitions"
      description="Universal prayers - one petition per line"
    >
      {/* Template Selector (if available) */}
      {!readOnly && templates.length > 0 && onInsertTemplate && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-[250px]">
            <FormInput
              id="petition-template-select"
              label="Template"
              inputType="select"
              value={selectedTemplateId}
              onChange={setSelectedTemplateId}
              options={templates.map((template) => ({
                value: template.id,
                label: template.name,
              }))}
              placeholder="Select template..."
              hideLabel
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={insertTemplate} className="w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            Insert Template
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {/* Format Info Modal */}
        <Dialog open={showFormatInfo} onOpenChange={setShowFormatInfo}>
          <DialogButton type="button" variant="ghost" size="sm">
            <Info className="h-4 w-4 mr-2" />
            Format Information
          </DialogButton>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Petition Format</DialogTitle>
              <DialogDescription>
                Petitions display exactly as you enter them
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md space-y-3">
                <p className="text-sm font-medium">Example:</p>
                <div className="bg-background p-3 rounded border space-y-2">
                  <p className="text-sm italic">
                    For the bride and groom, that their love may grow stronger each day, we pray to the Lord.
                  </p>
                  <p className="text-sm italic">
                    For all married couples, that they may find joy in their commitment, we pray to the Lord.
                  </p>
                </div>
              </div>
              <div className="text-sm space-y-2">
                <p className="font-medium">Instructions:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Enter each petition on a new line</li>
                  <li>Include the full text as you want it to appear</li>
                  <li>Include the response ending (e.g., &quot;we pray to the Lord&quot;)</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simple Text Area */}
        <div className="space-y-2">
          <FormInput
            id="petitions-text"
            label="Petitions"
            inputType="textarea"
            value={value}
            onChange={onChange}
            placeholder="Enter petitions, one per line...&#10;&#10;Example:&#10;For the bride and groom, that their love may grow stronger each day, we pray to the Lord.&#10;For all married couples, that they may find joy in their commitment, we pray to the Lord.&#10;For those who are sick or suffering, that they may know God's healing presence, we pray to the Lord."
            className="min-h-[300px]"
            disabled={readOnly}
            hideLabel
          />
          <p className="text-xs text-muted-foreground">
            {value.split('\n').filter(line => line.trim()).length} petition(s)
          </p>
          <p className="text-xs text-muted-foreground">
            Each petition can be concluded with or without a period.
          </p>
        </div>
      </div>
    </FormSectionCard>
  )
}
