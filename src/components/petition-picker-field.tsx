'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollText, FileText, Wand2, Pencil, Trash2 } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { PetitionEditor } from '@/components/petition-editor'
import { PetitionTemplatePickerDialog } from '@/components/petition-template-picker-dialog'
import { createPetitionFromEvent } from '@/lib/actions/petitions'
import { deletePetition } from '@/lib/actions/petitions'
import type { Petition } from '@/lib/types'
import type { LiturgicalLanguage } from '@/lib/constants'
import { toast } from 'sonner'

interface PetitionPickerFieldProps {
  label: string
  value: Petition | null
  onValueChange: (petition: Petition | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
  eventContext?: {
    eventTypeName: string
    occasionDate: string
    keyPersonNames?: string[]
    language: LiturgicalLanguage
  }
  error?: string // Validation error message
}

export function PetitionPickerField({
  label,
  value,
  onValueChange,
  description,
  required = false,
  eventContext,
  error,
}: PetitionPickerFieldProps) {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showEditorDialog, setShowEditorDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPetition, setCurrentPetition] = useState<Petition | null>(null)

  // Create petition from template
  const handleTemplateSelect = async (templateId: string) => {
    if (!eventContext) return

    try {
      const petition = await createPetitionFromEvent({
        eventTypeName: eventContext.eventTypeName,
        occasionDate: eventContext.occasionDate,
        language: eventContext.language,
        templateId,
      })
      setCurrentPetition(petition)
      setShowTemplateDialog(false)
      setShowEditorDialog(true)
    } catch (error) {
      toast.error('Failed to create petition from template')
      console.error(error)
    }
  }

  // Create blank petition for AI or scratch
  const handleCreateBlank = async () => {
    if (!eventContext) return

    try {
      const petition = await createPetitionFromEvent({
        eventTypeName: eventContext.eventTypeName,
        occasionDate: eventContext.occasionDate,
        language: eventContext.language,
      })
      setCurrentPetition(petition)
      setShowEditorDialog(true)
    } catch (error) {
      toast.error('Failed to create petition')
      console.error(error)
    }
  }

  // Handle edit existing petition
  const handleEdit = () => {
    if (!value) return
    setCurrentPetition(value)
    setShowEditorDialog(true)
  }

  // Handle petition editor save (text only)
  const handleEditorSave = async (updatedText: string) => {
    if (!currentPetition) return

    // Update petition in database with new text
    try {
      const { updatePetitionContent } = await import('@/lib/actions/petitions')
      await updatePetitionContent(currentPetition.id, updatedText)

      // Update local state to reflect saved changes
      const updatedPetition = { ...currentPetition, text: updatedText }
      onValueChange(updatedPetition)
      setShowEditorDialog(false)
      setCurrentPetition(null)
      toast.success('Petition saved')
    } catch (error) {
      toast.error('Failed to save petition')
      console.error(error)
    }
  }

  // Handle delete petition
  const handleDelete = async () => {
    if (!value) return

    setIsDeleting(true)
    try {
      await deletePetition(value.id)
      onValueChange(null)
      setShowDeleteDialog(false)
      toast.success('Petition deleted')
    } catch (error) {
      toast.error('Failed to delete petition')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Truncate petition text for preview (first 3 lines)
  const getTruncatedText = (text: string | undefined | null) => {
    if (!text) return ''
    const lines = text.split('\n')
    if (lines.length <= 3) return text
    return lines.slice(0, 3).join('\n') + '...'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={label}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Empty State - Show creation options */}
      {!value && (
        <div className={`border border-dashed rounded-lg p-6 bg-muted/10 ${error ? 'border-destructive dark:border-destructive' : 'border-border'}`}>
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground mb-2">Create petitions for this event:</p>

            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => setShowTemplateDialog(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Create from Template
            </Button>

            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => handleCreateBlank()}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>

            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => handleCreateBlank()}
            >
              <ScrollText className="h-4 w-4 mr-2" />
              Write from Scratch
            </Button>
          </div>
        </div>
      )}

      {/* Populated State - Show petition preview */}
      {value && (
        <div className={`border rounded-lg bg-background ${error ? 'border-destructive dark:border-destructive' : 'border-border'}`}>
          <div className="p-4 space-y-3">
            {/* Petition Title */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="font-medium">{value.title}</span>
              </div>
            </div>

            {/* Petition Preview (Accordion) */}
            <Accordion type="single" collapsible>
              <AccordionItem value="preview" className="border-0">
                <AccordionTrigger className="text-sm text-muted-foreground py-2">
                  {getTruncatedText(value.text) ? 'View Full Petition' : 'No content yet'}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                    {value.text || 'No petition text has been added yet.'}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Template Picker Dialog */}
      {eventContext && (
        <PetitionTemplatePickerDialog
          open={showTemplateDialog}
          onOpenChange={setShowTemplateDialog}
          onSelect={(template) => handleTemplateSelect(template.id)}
          language={eventContext.language}
        />
      )}

      {/* Petition Editor Dialog */}
      <Dialog open={showEditorDialog} onOpenChange={setShowEditorDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {currentPetition && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">{currentPetition.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Edit petitions for this event
                </p>
              </div>
              <PetitionEditor
                value={currentPetition.text || ''}
                onChange={(newText) => {
                  // Update local state
                  setCurrentPetition({ ...currentPetition, text: newText })
                }}
                readOnly={false}
              />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditorDialog(false)
                    setCurrentPetition(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => handleEditorSave(currentPetition.text || '')}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Petition?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete these petitions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
