'use client'

import { BaptismPicker } from './baptism-picker'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface BaptismPickerFieldProps {
  label?: string
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  onSelect: (baptismId: string) => void
  buttonLabel?: string
}

export function BaptismPickerField({
  label = 'Add Baptism',
  showPicker,
  onShowPickerChange,
  onSelect,
  buttonLabel = 'Add Existing Baptism'
}: BaptismPickerFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label}
        </label>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={() => onShowPickerChange(true)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {buttonLabel}
      </Button>

      <BaptismPicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onSelect}
      />
    </div>
  )
}
