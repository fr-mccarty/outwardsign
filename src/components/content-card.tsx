import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ContentCardProps {
  children: ReactNode
  className?: string
}

/**
 * ContentCard - Simple card wrapper without header
 *
 * Provides consistent p-6 padding by default (24px on all sides).
 * Use className to customize padding when needed.
 *
 * Usage:
 * <ContentCard>
 *   <p>Content with standard p-6 padding</p>
 * </ContentCard>
 *
 * For empty states, use the EmptyState component instead.
 * For cards with title/description, use FormSectionCard instead.
 */
export function ContentCard({ children, className }: ContentCardProps) {
  return (
    <Card className="!py-0">
      <CardContent className={cn("py-6", className)}>
        {children}
      </CardContent>
    </Card>
  )
}
