/**
 * ContentCard - Wrapper for Card with consistent padding
 *
 * ENFORCEMENT: All Card usage should go through this component.
 * To find violations, search for bare Card imports:
 *   grep "from '@/components/ui/card'" --include="*.tsx" | grep -v content-card
 *
 * This ensures consistent padding - Card has py-6 built-in,
 * so we never add pt-* or pb-* to CardContent/CardHeader.
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ContentCardProps {
  /** Optional title displayed at the top */
  title?: React.ReactNode
  /** Main content */
  children: React.ReactNode
  /** Optional actions displayed on the right of header */
  actions?: React.ReactNode
  /** Additional className for the card */
  className?: string
  /** Make clickable with hover effect */
  onClick?: () => void
}

export function ContentCard({
  title,
  children,
  actions,
  className,
  onClick,
}: ContentCardProps) {
  return (
    <Card
      className={cn(
        onClick && 'cursor-pointer transition-shadow hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {(title || actions) && (
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            {title && (
              <CardTitle className="text-base">{title}</CardTitle>
            )}
            {actions && (
              <div className="flex gap-2 shrink-0">{actions}</div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="text-sm">{children}</CardContent>
    </Card>
  )
}

// Re-export all Card components for cases needing more control
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card'
