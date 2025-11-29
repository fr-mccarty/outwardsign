'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { SquarePen, Eye, Calendar } from "lucide-react"
import { ReactNode, useRef, useState, useEffect } from "react"
import { ModuleStatusLabel } from "./module-status-label"
import { LITURGICAL_LANGUAGE_LABELS } from "@/lib/constants"
import { formatDatePretty, formatTime } from "@/lib/utils/formatters"

interface ListViewCardProps {
  title: string | ReactNode
  editHref: string
  viewHref: string
  viewButtonText?: string
  status?: string
  statusType?: 'module'
  language?: string
  datetime?: { date: string; time?: string }
  children: ReactNode
}

/**
 * ListViewCard - Reusable card component for list views
 *
 * Layout (top to bottom):
 * - Title (truncated) + Edit button
 * - Language badge (only if language prop provided)
 * - Children/Description
 * - Status (bottom left) + View/Preview button (bottom right)
 */
export function ListViewCard({
  title,
  editHref,
  viewHref,
  viewButtonText = "View Details",
  status,
  statusType = 'module',
  language,
  datetime,
  children
}: ListViewCardProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const [isClamped, setIsClamped] = useState(false)

  useEffect(() => {
    const el = titleRef.current
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight)
    }
  }, [title])

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 overflow-hidden">
            <TooltipProvider>
              <Tooltip open={isClamped && typeof title === 'string' ? undefined : false}>
                <TooltipTrigger asChild>
                  <CardTitle ref={titleRef} className="text-lg line-clamp-1 cursor-default">
                    {title}
                  </CardTitle>
                </TooltipTrigger>
                <TooltipContent>
                  {typeof title === 'string' ? <p>{title}</p> : title}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {language && (
              <p className="text-xs text-muted-foreground uppercase">
                {LITURGICAL_LANGUAGE_LABELS[language]?.en || language}
              </p>
            )}
            {datetime && (
              <div className="flex items-center gap-1.5 text-base text-muted-foreground pt-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDatePretty(datetime.date)}</span>
                {datetime.time && <span>at {formatTime(datetime.time)}</span>}
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
      <CardContent className="pt-0">
        {children}

        <div className="flex justify-between items-center pt-3">
          {status ? (
            <ModuleStatusLabel
              status={status}
              statusType={statusType}
              className="text-xs"
            />
          ) : (
            <div />
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={viewHref}>
              <Eye className="h-4 w-4 mr-1" />
              {viewButtonText}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
