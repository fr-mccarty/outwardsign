'use client'

import { CommandItem } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface PickerItemWrapperProps {
  value: string
  onSelect: () => void
  isSelected: boolean
  initials?: string
  primaryText: ReactNode
  secondaryText?: ReactNode
  showAvatar?: boolean
}

export function PickerItemWrapper({
  value,
  onSelect,
  isSelected,
  initials,
  primaryText,
  secondaryText,
  showAvatar = true,
}: PickerItemWrapperProps) {
  return (
    <CommandItem
      value={value}
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-3 px-3 py-3 cursor-pointer",
        isSelected && "bg-accent text-accent-foreground"
      )}
    >
      {showAvatar && initials && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {primaryText}
          {isSelected && (
            <Badge variant="secondary" className="text-xs">
              Selected
            </Badge>
          )}
        </div>

        {secondaryText && (
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            {secondaryText}
          </div>
        )}
      </div>
    </CommandItem>
  )
}
