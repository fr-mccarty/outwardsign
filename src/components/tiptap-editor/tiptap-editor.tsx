'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { TiptapToolbar } from './tiptap-toolbar'
import { FontSize } from './extensions/font-size'
import { ParagraphWithStyle } from './extensions/paragraph-with-style'
import type { InputFieldDefinition } from '@/lib/types'

interface TiptapEditorProps {
  value: string
  onChange: (value: string) => void
  availableFields: InputFieldDefinition[]
  placeholder?: string
  label?: string
  required?: boolean
}

export function TiptapEditor({
  value,
  onChange,
  availableFields,
  placeholder,
  label,
  required,
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable headings, lists, and default paragraph
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        paragraph: false,
      }),
      ParagraphWithStyle,
      Underline,
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({
        types: ['paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Enter your content here...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content min-h-[400px] p-4 outline-none focus:outline-none',
      },
    },
  })

  // Sync external value changes (e.g., form reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  // Insert text at current cursor position
  const insertText = (text: string) => {
    if (editor) {
      editor.chain().focus().insertContent(text).run()
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="tiptap-editor">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="border rounded-md bg-card text-card-foreground overflow-hidden">
        <TiptapToolbar
          editor={editor}
          availableFields={availableFields}
          onInsertText={insertText}
        />
        <EditorContent editor={editor} className="prose prose-sm max-w-none" />
      </div>
    </div>
  )
}
