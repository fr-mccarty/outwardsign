"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Wand2, FileText, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface PetitionEditorProps {
  value: string
  onChange: (value: string) => void
  onOpenWizard?: () => void
  onInsertDefault?: () => string[] // Returns array of petition texts to insert
  readOnly?: boolean
  className?: string
  showInsertDefault?: boolean
}

export function PetitionEditor({
  value,
  onChange,
  onOpenWizard,
  onInsertDefault,
  readOnly = false,
  className,
  showInsertDefault = true,
}: PetitionEditorProps) {
  const [showFormatInfo, setShowFormatInfo] = useState(false)

  const insertDefaultPetitions = () => {
    if (!onInsertDefault) return

    // Get default petition texts from parent
    const defaultTexts = onInsertDefault()

    // Add to existing petitions (one per line)
    const currentPetitions = value ? value.split('\n').filter(line => line.trim()) : []
    const allPetitions = [...currentPetitions, ...defaultTexts]

    onChange(allPetitions.join('\n'))
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Petitions</CardTitle>
            <CardDescription>
              Universal prayers - one petition per line
            </CardDescription>
          </div>
          {!readOnly && (
            <div className="flex gap-2">
              {showInsertDefault && onInsertDefault && (
                <Button type="button" variant="outline" size="sm" onClick={insertDefaultPetitions}>
                  <FileText className="h-4 w-4 mr-2" />
                  Insert Default
                </Button>
              )}
              {onOpenWizard && (
                <Button type="button" variant="outline" size="sm" onClick={onOpenWizard}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Wizard
                </Button>
              )}
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
                      <span className="font-semibold">Reader:</span> <span className="italic">For the bride and groom, that their love may grow stronger each day</span>, let us pray to the Lord.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">People:</span> <span className="italic">Lord, hear our prayer.</span>
                    </p>
                  </div>
                  <div className="border-t pt-2 space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">Reader:</span> <span className="italic">For all married couples, that they may find joy in their commitment</span>, let us pray to the Lord.
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
            placeholder="Enter petitions, one per line...&#10;&#10;Example:&#10;For the bride and groom, that their love may grow stronger each day&#10;For all married couples, that they may find joy in their commitment&#10;For those who are sick or suffering, that they may know God's healing presence"
            className="min-h-[300px] font-mono text-sm"
            disabled={readOnly}
          />
          <p className="text-xs text-muted-foreground">
            {value.split('\n').filter(line => line.trim()).length} petition(s)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
