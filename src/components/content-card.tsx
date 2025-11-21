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
 * Usage:
 * <ContentCard>
 *   <p>Any content here</p>
 * </ContentCard>
 *
 * For cards with title/description, use FormSectionCard instead.
 */
export function ContentCard({ children, className }: ContentCardProps) {
  return (
    <Card>
      <CardContent className={cn("pt-6", className)}>
        {children}
      </CardContent>
    </Card>
  )
}
