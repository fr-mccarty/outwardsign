"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { FileText } from 'lucide-react'
import { toast } from 'sonner'
import type { LiturgyTemplate } from '@/lib/types/liturgy-content'

interface TemplateSelectorDialogProps {
  /**
   * Current template ID selected for this entity
   */
  currentTemplateId?: string | null

  /**
   * Available templates for this module
   */
  templates: Record<string, LiturgyTemplate<any>>

  /**
   * Module display name (e.g., "Wedding", "Funeral")
   */
  moduleName: string

  /**
   * Callback to save the new template selection
   * Should handle the update and return a promise
   */
  onSave: (templateId: string) => Promise<void>

  /**
   * Default template ID to use if none is selected
   */
  defaultTemplateId: string
}

/**
 * Reusable template selector dialog for module view pages
 * Allows users to change the liturgy template for a module entity
 */
export function TemplateSelectorDialog({
  currentTemplateId,
  templates,
  moduleName,
  onSave,
  defaultTemplateId,
}: TemplateSelectorDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    currentTemplateId || defaultTemplateId
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a template')
      return
    }

    setIsSaving(true)
    try {
      await onSave(selectedTemplateId)
      toast.success('Template updated successfully')
      setOpen(false)
      // Reload the page to show updated content with new template
      window.location.reload()
    } catch (error) {
      console.error('Error updating template:', error)
      toast.error('Failed to update template')
    } finally {
      setIsSaving(false)
    }
  }

  const currentTemplate = templates[currentTemplateId || defaultTemplateId]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-col gap-1">
          {/*<span className="text-xs text-muted-foreground">Template:</span>*/}
          <Button
            variant="outline"
            size="sm"
            className="h-auto py-2 px-3 justify-start text-left font-normal"
          >
            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm truncate">{currentTemplate?.name || 'Default'}</span>
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change {moduleName} Template</DialogTitle>
          <DialogDescription>
            Select a template to change how the liturgy document is formatted and displayed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="template-select" className="text-sm font-medium">
              Select Template
            </label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
            >
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(templates).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Description */}
          {selectedTemplateId && templates[selectedTemplateId] && (
            <div className="rounded-md bg-muted p-3">
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">
                {templates[selectedTemplateId].description}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                Languages: {templates[selectedTemplateId].supportedLanguages.join(', ')}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
