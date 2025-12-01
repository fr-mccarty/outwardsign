import { cn } from "@/lib/utils"
import { PAGE_MAX_WIDTH_CLASS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import Link from "next/link"

// Discriminated union to support both actions and separators
type AdditionalActionItem = AdditionalAction | AdditionalActionSeparator

interface AdditionalAction {
  type: 'action'
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: 'default' | 'destructive'
}

interface AdditionalActionSeparator {
  type: 'separator'
}

interface PageContainerProps {
  title: string
  description?: string
  primaryAction?: React.ReactNode
  additionalActions?: AdditionalActionItem[]
  /** @deprecated Use primaryAction instead */
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  'data-testid'?: string
}

export function PageContainer({
  title,
  description,
  primaryAction,
  additionalActions,
  actions,
  children,
  className,
  'data-testid': dataTestId
}: PageContainerProps) {
  // Use new pattern if primaryAction is provided, otherwise fall back to deprecated actions prop
  const hasActions = primaryAction || additionalActions || actions

  return (
    <div className="space-y-6 p-6 pb-12" data-testid={dataTestId}>
      <div className={cn(PAGE_MAX_WIDTH_CLASS, "mx-auto", className)}>
        <div className="mb-4">
          {hasActions ? (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                {description && (
                  <p className="text-muted-foreground mt-0">
                    {description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3 lg:shrink-0">
                {/* New pattern with primaryAction and additionalActions */}
                {primaryAction && (
                  <>
                    {primaryAction}
                    {additionalActions && additionalActions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {additionalActions.map((item, index) => {
                            if (item.type === 'separator') {
                              return <DropdownMenuSeparator key={`separator-${index}`} />
                            }

                            const actionItem = item as AdditionalAction
                            const ItemContent = (
                              <>
                                {actionItem.icon && <span className="mr-2">{actionItem.icon}</span>}
                                {actionItem.label}
                              </>
                            )

                            if (actionItem.href) {
                              return (
                                <DropdownMenuItem key={index} asChild>
                                  <Link href={actionItem.href}>
                                    {ItemContent}
                                  </Link>
                                </DropdownMenuItem>
                              )
                            }

                            return (
                              <DropdownMenuItem
                                key={index}
                                onClick={actionItem.onClick}
                                className={actionItem.variant === 'destructive' ? 'text-destructive' : ''}
                              >
                                {ItemContent}
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </>
                )}
                {/* Deprecated: Fall back to old actions prop for backward compatibility */}
                {!primaryAction && actions}
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-0">
                  {description}
                </p>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}
