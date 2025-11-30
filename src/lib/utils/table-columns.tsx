import React from 'react'
import Link from 'next/link'
import { MoreVertical } from 'lucide-react'
import { DataTableColumn } from '@/components/data-table/data-table'
import { PersonAvatarGroup } from '@/components/person-avatar-group'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MODULE_STATUS_COLORS } from '@/lib/constants'
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'
import { formatDatePretty, formatTime } from '@/lib/utils/formatters'
import type {
  AvatarColumnConfig,
  WhoColumnConfig,
  WhenColumnConfig,
  WhereColumnConfig,
  ActionsColumnConfig
} from '@/lib/types/table-config'

/**
 * Build an avatar column for displaying person avatars
 *
 * @example
 * ```tsx
 * buildAvatarColumn({
 *   people: (wedding) => [wedding.bride, wedding.groom].filter(Boolean),
 *   type: 'couple',
 *   size: 'md'
 * })
 * ```
 */
export function buildAvatarColumn<T>(config: AvatarColumnConfig<T>): DataTableColumn<T> {
  return {
    key: 'avatar',
    header: '',
    cell: (row) => {
      const people = config.people(row)

      if (people.length === 0) return null

      return <PersonAvatarGroup people={people} type={config.type} size={config.size || 'md'} />
    },
    className: config.width || 'w-[80px]',
    hiddenOn: config.hiddenOn
  }
}

/**
 * Build a "who" column with status badge and name display
 *
 * @example
 * ```tsx
 * buildWhoColumn({
 *   getName: (wedding) => {
 *     const bride = wedding.bride?.full_name
 *     const groom = wedding.groom?.full_name
 *     if (bride && groom) return `${bride}-${groom}`
 *     return bride || groom || ''
 *   },
 *   getStatus: (wedding) => wedding.status,
 *   fallback: 'No couple assigned'
 * })
 * ```
 */
export function buildWhoColumn<T>(config: WhoColumnConfig<T>): DataTableColumn<T> {
  return {
    key: 'who',
    header: config.header || 'Who',
    cell: (row) => {
      const name = config.getName(row)
      const status = config.getStatus(row)
      const statusLabel = status ? getStatusLabel(status, 'en') : 'Unknown'
      const statusColor = status
        ? MODULE_STATUS_COLORS[status] || 'bg-muted-foreground/50'
        : 'bg-muted-foreground/50'

      if (!name) {
        return (
          <span className="text-muted-foreground">
            {config.fallback || 'Not assigned'}
          </span>
        )
      }

      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${statusColor}`} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{statusLabel}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-sm font-medium truncate">
            {name}
          </span>
        </div>
      )
    },
    className: config.className || 'max-w-[200px] md:max-w-[250px]',
    sortable: config.sortable !== false,
    accessorFn: (row) => config.getName(row)
  }
}

/**
 * Build a "when" column for displaying date and time
 *
 * @example
 * ```tsx
 * buildWhenColumn({
 *   getDate: (wedding) => wedding.wedding_event?.start_date || null,
 *   getTime: (wedding) => wedding.wedding_event?.start_time || null
 * })
 * ```
 */
export function buildWhenColumn<T>(config: WhenColumnConfig<T>): DataTableColumn<T> {
  return {
    key: 'when',
    header: config.header || 'When',
    cell: (row) => {
      const dateString = config.getDate(row)
      if (!dateString) {
        return <span className="text-muted-foreground text-sm">No date set</span>
      }

      const date = formatDatePretty(dateString)
      const timeString = config.getTime(row)
      const time = timeString ? formatTime(timeString) : null

      return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
          <span className="text-sm whitespace-nowrap">{date}</span>
          {time && (
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              {time}
            </span>
          )}
        </div>
      )
    },
    className: config.className || 'min-w-[120px] md:min-w-[180px]',
    sortable: config.sortable !== false,
    accessorFn: (row) => {
      const dateString = config.getDate(row)
      return dateString ? new Date(dateString) : null
    }
  }
}

/**
 * Build a "where" column for displaying location
 *
 * @example
 * ```tsx
 * buildWhereColumn({
 *   getLocation: (wedding) => wedding.wedding_event?.location || null
 * })
 * ```
 */
export function buildWhereColumn<T>(config: WhereColumnConfig<T>): DataTableColumn<T> {
  return {
    key: 'where',
    header: config.header || 'Where',
    cell: (row) => {
      const location = config.getLocation(row)
      if (!location) {
        return <span className="text-muted-foreground text-sm">No location</span>
      }
      return <span className="text-sm truncate block max-w-[150px]">{location.name}</span>
    },
    className: config.className || 'min-w-[100px] lg:min-w-[120px]',
    hiddenOn: config.hiddenOn
  }
}

/**
 * Build an actions column with View, Edit, and Delete menu
 *
 * @example
 * ```tsx
 * buildActionsColumn({
 *   baseUrl: '/weddings',
 *   onDelete: (wedding) => setWeddingToDelete(wedding),
 *   getDeleteMessage: (wedding) =>
 *     `Are you sure you want to delete the wedding for ${wedding.bride?.full_name}?`
 * })
 * ```
 */
export function buildActionsColumn<T extends { id: string }>(
  config: ActionsColumnConfig<T>
): DataTableColumn<T> {
  return {
    key: 'actions',
    header: '',
    cell: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`${config.baseUrl}/${row.id}`}>View</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${config.baseUrl}/${row.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault()
              config.onDelete(row)
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    className: config.width || 'w-[50px]'
  }
}
