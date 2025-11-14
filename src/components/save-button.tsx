'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface SaveButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean
  loadingText?: string
  children?: React.ReactNode
  showIcon?: boolean
}

export function SaveButton({
  isLoading = false,
  loadingText = "Saving...",
  children = "Save",
  showIcon = true,
  className,
  disabled,
  ...props
}: SaveButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isLoading || disabled}
      className={cn(className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {showIcon && <Save className="h-4 w-4 mr-2" />}
          {children}
        </>
      )}
    </Button>
  )
}
