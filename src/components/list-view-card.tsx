import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SquarePen } from "lucide-react"
import { ReactNode } from "react"
import { ModuleStatusLabel } from "./module-status-label"
import { LANGUAGE_LABELS } from "@/lib/constants"

interface ListViewCardProps {
  title: string
  editHref: string
  viewHref: string
  viewButtonText?: string
  status?: string
  statusType?: 'module'
  language?: string
  children: ReactNode
}

/**
 * ListViewCard - Reusable card component for list views
 *
 * Layout:
 * - Title (truncated) in upper left
 * - Optional status badge between title and edit button (if status prop provided)
 * - Edit icon button in upper right
 * - Optional language text directly under title (if language prop provided)
 * - Custom content in the body (passed as children)
 * - View button in bottom right (text customizable)
 *
 * Status Badge:
 * - Pass `status` and `statusType` props to automatically render ModuleStatusLabel
 * - Status appears between title and edit button in the header row
 * - Title will truncate to make room for status badge
 *
 * Language Text:
 * - Pass `language` prop to display language as plain text under title
 * - Language appears directly below title in header section with muted foreground color
 */
export function ListViewCard({
  title,
  editHref,
  viewHref,
  viewButtonText = "View Details",
  status,
  statusType = 'module',
  language,
  children
}: ListViewCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg line-clamp-1">
                {title}
              </CardTitle>
              {status && (
                <ModuleStatusLabel
                  status={status}
                  statusType={statusType}
                  className="text-xs flex-shrink-0"
                />
              )}
            </div>
            {language && (
              <div className="text-xs text-muted-foreground">
                {LANGUAGE_LABELS[language]?.en || language}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" asChild className="flex-shrink-0">
            <Link href={editHref}>
              <SquarePen className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}

        <div className="flex justify-end items-center pt-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={viewHref}>
              {viewButtonText}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
