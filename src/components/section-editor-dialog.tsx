'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form-input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { MarkdownEditor } from '@/components/markdown-editor'
import { createSection, updateSection } from '@/lib/actions/sections'
import { toast } from 'sonner'
import type { Section, InputFieldDefinition } from '@/lib/types'

interface SectionEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section?: Section
  scriptId: string
  inputFields: InputFieldDefinition[]
  onSaved: () => void
}

export function SectionEditorDialog({
  open,
  onOpenChange,
  section,
  scriptId,
  inputFields,
  onSaved,
}: SectionEditorDialogProps) {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [pageBreakAfter, setPageBreakAfter] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load section data when editing
  useEffect(() => {
    if (section) {
      setName(section.name)
      setContent(section.content)
      setPageBreakAfter(section.page_break_after)
    } else {
      setName('')
      setContent('')
      setPageBreakAfter(false)
    }
  }, [section, open])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Section name is required')
      return
    }

    if (!content.trim()) {
      toast.error('Section content is required')
      return
    }

    setIsSubmitting(true)
    try {
      if (section) {
        // Update existing section
        await updateSection(section.id, {
          name: name.trim(),
          content: content.trim(),
          page_break_after: pageBreakAfter,
        })
        toast.success('Section updated successfully')
      } else {
        // Create new section
        await createSection(scriptId, {
          name: name.trim(),
          content: content.trim(),
          page_break_after: pageBreakAfter,
        })
        toast.success('Section created successfully')
      }

      onSaved()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save section:', error)
      toast.error('Failed to save section')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {section ? 'Edit Section' : 'Create Section'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section Name */}
          <FormInput
            id="section-name"
            label="Section Name"
            value={name}
            onChange={setName}
            required
            placeholder="e.g., Opening Prayer, Readings, Closing"
          />

          {/* Markdown Editor */}
          <MarkdownEditor
            value={content}
            onChange={setContent}
            availableFields={inputFields}
            label="Content"
            required
            placeholder="Enter the section content using markdown and field placeholders..."
          />

          {/* Page Break After */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="page-break-after"
              checked={pageBreakAfter}
              onCheckedChange={(checked) =>
                setPageBreakAfter(checked as boolean)
              }
            />
            <Label
              htmlFor="page-break-after"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Insert page break after this section
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : section
                ? 'Update Section'
                : 'Create Section'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
