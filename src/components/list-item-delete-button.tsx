'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface ListItemDeleteButtonProps {
  onClick: () => void
  testId?: string
  disabled?: boolean
}

/**
 * ListItemDeleteButton Component
 *
 * Standardized delete button for list items throughout the app.
 * Uses Trash2 icon in a ghost icon button with consistent sizing.
 *
 * Usage:
 * ```tsx
 * <ListItemDeleteButton
 *   onClick={() => handleDelete(item.id)}
 *   testId="member-delete-123"
 * />
 * ```
 */
export function ListItemDeleteButton({
  onClick,
  testId,
  disabled = false,
}: ListItemDeleteButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      aria-label="Delete"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  )
}
