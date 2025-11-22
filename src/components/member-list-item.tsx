'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface PersonInfo {
  id: string
  first_name: string
  last_name: string
  preferred_name?: string | null
  full_name: string
  email?: string | null
  phone_number?: string | null
}

interface MemberListItemProps {
  person: PersonInfo
  badge?: {
    label: string
    variant?: 'default' | 'secondary' | 'outline'
  }
  onToggleActive?: () => void
  onDelete: () => void
  isActive?: boolean
  testIdPrefix?: string
}

/**
 * MemberListItem Component
 *
 * Reusable component for displaying a member in a list with their information,
 * badge, and action buttons.
 *
 * Used in: Mass Roles, Groups
 */
export function MemberListItem({
  person,
  badge,
  onToggleActive,
  onDelete,
  isActive = true,
  testIdPrefix = 'member'
}: MemberListItemProps) {
  const personName = person.full_name

  return (
    <div
      data-testid={`${testIdPrefix}-item-${person.id}`}
      className={`p-4 border rounded-lg ${!isActive ? 'bg-muted/50 opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium">{personName}</h3>
            {badge && (
              <Badge variant={!isActive ? 'outline' : (badge.variant || 'secondary')}>
                {badge.label}
              </Badge>
            )}
          </div>
          {person.email && (
            <p className="text-sm text-muted-foreground">
              {person.email}
            </p>
          )}
          {person.phone_number && (
            <p className="text-sm text-muted-foreground">
              {person.phone_number}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onToggleActive && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleActive}
              data-testid={`${testIdPrefix}-toggle-${person.id}`}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            data-testid={`${testIdPrefix}-delete-${person.id}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
