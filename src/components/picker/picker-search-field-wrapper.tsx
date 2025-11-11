'use client'

import { CommandInput } from '@/components/ui/command'

interface PickerSearchFieldWrapperProps {
  placeholder?: string
  value: string
  onValueChange: (value: string) => void
}

export function PickerSearchFieldWrapper({
  placeholder = "Search...",
  value,
  onValueChange,
}: PickerSearchFieldWrapperProps) {
  return (
    <div className="flex items-center border-b px-3" onClick={(e) => e.stopPropagation()}>
      <CommandInput
        placeholder={placeholder}
        value={value}
        onValueChange={onValueChange}
        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}
