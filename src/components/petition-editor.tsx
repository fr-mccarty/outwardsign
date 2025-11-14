"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  className?: string
}

export function PetitionEditor({
  value,
  onChange,
  onInsertTemplate,
  templates = [],
  readOnly = false,
  className,
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
    <Card className={className}>
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Petitions</CardTitle>
              <CardDescription>
                Universal prayers - one petition per line
              </CardDescription>
            </div>
          </div>

          {!readOnly && templates.length > 0 && onInsertTemplate && (
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="sm" onClick={insertTemplate} className="w-full sm:w-auto">
                <FileText className="h-4 w-4 mr-2" />
                Insert Template
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format Info Modal */}
        <Dialog open={showFormatInfo} onOpenChange={setShowFormatInfo}>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              <Info className="h-4 w-4 mr-2" />
              Format Information
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Petition Format</DialogTitle>
              <DialogDescription>
                How petitions will appear when displayed or printed
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md space-y-3">
                <p className="text-sm font-medium">Example Format:</p>
                <div className="bg-background p-3 rounded border space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">Reader:</span> The response is "Lord, hear our prayer." <span className="text-destructive font-semibold">[Pause]</span>
                  </p>
                  <div className="border-t pt-2 space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">You enter:</span> <span className="italic">For the bride and groom, that their love may grow stronger each day.</span>
                    </p>
                  </div>
                  <div className="border-t pt-2 space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">It displays as:</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Reader:</span> <span className="italic">For the bride and groom, that their love may grow stronger each day</span>, let us pray to the Lord.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">People:</span> <span className="italic">Lord, hear our prayer.</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-sm space-y-2">
                <p className="font-medium">Instructions:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Enter each petition on a new line</li>
                  <li>Do NOT include "Reader:" prefix</li>
                  <li>Do NOT include "let us pray to the Lord"</li>
                  <li>Do NOT include the response</li>
                  <li>These will be added automatically when printed</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simple Text Area */}
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Enter petitions, one per line...&#10;&#10;Example:&#10;For the bride and groom, that their love may grow stronger each day.&#10;For all married couples, that they may find joy in their commitment.&#10;For those who are sick or suffering, that they may know God's healing presence."
            className="min-h-[300px]"
            disabled={readOnly}
          />
          <p className="text-xs text-muted-foreground">
            {value.split('\n').filter(line => line.trim()).length} petition(s)
          </p>
          <p className="text-xs text-muted-foreground">
            Each petition can be concluded with or without a period.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
