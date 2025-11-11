'use client'

import {
  Command,
  CommandDialog,
} from '@/components/ui/command'
import { DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface PickerModalWrapperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  className?: string
  children: ReactNode
}

export function PickerModalWrapper({
  open,
  onOpenChange,
  title,
  className,
  children,
}: PickerModalWrapperProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <Command className={cn("rounded-lg border shadow-md", className)}>
        {children}
      </Command>
    </CommandDialog>
  )
}
