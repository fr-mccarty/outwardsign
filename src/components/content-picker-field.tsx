'use client'

import { ContentPicker } from '@/components/content-picker'
import { PickerField } from '@/components/picker-field'
import { FileText } from 'lucide-react'
import type { ContentWithTags } from '@/lib/types'

interface ContentPickerFieldProps {
  label: string
  value: ContentWithTags | null
  onValueChange: (content: ContentWithTags | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
  defaultFilterTags?: string[] // From input field definition
  language?: 'en' | 'es'
}

export function ContentPickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  placeholder = 'Select Content',
  required = false,
  defaultFilterTags,
  language,
}: ContentPickerFieldProps) {
  const renderContentValue = (content: ContentWithTags) => {
    return (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <span className="truncate">{content.title}</span>
      </div>
    )
  }

  return (
    <PickerField
      label={label}
      value={value}
      onValueChange={onValueChange}
      showPicker={showPicker}
      onShowPickerChange={onShowPickerChange}
      description={description}
      placeholder={placeholder}
      required={required}
      icon={FileText}
      renderValue={renderContentValue}
    >
      <ContentPicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onValueChange}
        selectedContentId={value?.id}
        defaultFilterTags={defaultFilterTags}
        language={language}
      />
    </PickerField>
  )
}
