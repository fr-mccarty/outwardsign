'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Type,
  ChevronDown,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import type { InputFieldDefinition } from '@/lib/types'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  availableFields: InputFieldDefinition[]
  placeholder?: string
  label?: string
  required?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  availableFields,
  placeholder,
  label,
  required,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get current selection or cursor position
  const getSelection = () => {
    const textarea = textareaRef.current
    if (!textarea) return { start: 0, end: 0, text: '' }

    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      text: textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
      ),
    }
  }

  // Insert text at cursor position or wrap selection
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { start, end, text } = getSelection()
    const newValue =
      value.substring(0, start) + before + text + after + value.substring(end)

    onChange(newValue)

    // Set cursor position after the inserted text
    setTimeout(() => {
      const newCursorPos = start + before.length + text.length + after.length
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Insert text at line start (for headings and lists)
  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { start } = getSelection()

    // Find the start of the current line
    let lineStart = start
    while (lineStart > 0 && value[lineStart - 1] !== '\n') {
      lineStart--
    }

    const newValue =
      value.substring(0, lineStart) + prefix + value.substring(lineStart)

    onChange(newValue)

    // Set cursor position after the prefix
    setTimeout(() => {
      const newCursorPos = start + prefix.length
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Formatting functions
  const applyBold = () => insertText('**', '**')
  const applyItalic = () => insertText('*', '*')
  const applyUnderline = () => insertText('<u>', '</u>')
  const applyRed = () => insertText('{red}', '{/red}')
  const applyH1 = () => insertAtLineStart('# ')
  const applyH2 = () => insertAtLineStart('## ')
  const applyH3 = () => insertAtLineStart('### ')
  const applyBulletList = () => insertAtLineStart('- ')
  const applyNumberedList = () => insertAtLineStart('1. ')

  // Alignment helpers (using HTML since markdown doesn't have native alignment)
  const applyAlignment = (align: 'left' | 'center' | 'right') => {
    const { start, end, text } = getSelection()
    if (!text) return

    const alignedText = `<div style="text-align: ${align}">\n${text}\n</div>`
    const textarea = textareaRef.current
    if (!textarea) return

    const newValue =
      value.substring(0, start) + alignedText + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + alignedText.length)
    }, 0)
  }

  // Insert field placeholder
  const insertField = (fieldName: string) => {
    insertText(`{{${fieldName}}}`)
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="markdown-editor">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/20">
        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyBold}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyItalic}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyUnderline}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyH1}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyH2}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyH3}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyAlignment('left')}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyAlignment('center')}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyAlignment('right')}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyBulletList}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyNumberedList}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Red text */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyRed}
          title="Red Text (Liturgical)"
        >
          <Type className="h-4 w-4 text-red-600" />
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Insert Field dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              title="Insert Field"
            >
              Insert Field
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
            {availableFields.length === 0 ? (
              <DropdownMenuItem disabled>No fields available</DropdownMenuItem>
            ) : (
              availableFields.map((field) => (
                <DropdownMenuItem
                  key={field.id}
                  onClick={() => insertField(field.name)}
                >
                  {field.name}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({field.type})
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        id="markdown-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Enter your content here...'}
        className="min-h-[400px] font-mono text-sm"
      />

      {/* Help text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Formatting:</strong> Use the toolbar buttons or markdown
          syntax
        </p>
        <p>
          <strong>Field Placeholders:</strong> Use {"{{Field Name}}"} or click
          &quot;Insert Field&quot;
        </p>
        <p>
          <strong>Red Text:</strong> {"{red}"}text{"{/red}"} for liturgical
          instructions
        </p>
      </div>
    </div>
  )
}
