'use client'

import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

interface DialogButtonProps extends ComponentProps<typeof Button> {
  children: React.ReactNode
}

/**
 * DialogButton - A Button component wrapped with DialogTrigger that ensures proper cursor styling.
 *
 * This component automatically applies cursor-pointer to prevent CSS specificity issues
 * that can occur when DialogTrigger uses asChild with Radix UI prop merging.
 *
 * @example
 * <Dialog>
 *   <DialogButton variant="destructive">
 *     <Trash2 className="h-4 w-4 mr-2" />
 *     Delete
 *   </DialogButton>
 *   <DialogContent>...</DialogContent>
 * </Dialog>
 */
export function DialogButton({ className, children, ...props }: DialogButtonProps) {
  return (
    <DialogTrigger asChild>
      <Button className={cn('cursor-pointer', className)} {...props}>
        {children}
      </Button>
    </DialogTrigger>
  )
}
