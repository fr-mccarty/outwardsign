import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SquarePen } from "lucide-react"
import { ReactNode } from "react"

interface ListViewCardProps {
  title: string
  editHref: string
  viewHref: string
  viewButtonText?: string
  titleSuffix?: ReactNode
  children: ReactNode
}

/**
 * ListViewCard - Reusable card component for list views
 *
 * Layout:
 * - Title in upper left
 * - Optional titleSuffix beside title (e.g., badge, label)
 * - Edit icon button in upper right
 * - Custom content in the body (passed as children)
 * - View button in bottom right (text customizable)
 */
export function ListViewCard({ title, editHref, viewHref, viewButtonText = "View Details", titleSuffix, children }: ListViewCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg line-clamp-1">
                {title}
              </CardTitle>
              {titleSuffix}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
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
