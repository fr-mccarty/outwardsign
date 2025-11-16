"use client"

import type { LiturgicalCalendarEntry } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Edit, Calendar, ArrowLeft } from "lucide-react"

interface CalendarViewClientProps {
  entry: LiturgicalCalendarEntry
  entryId: string
}

export function CalendarViewClient({ entry, entryId }: CalendarViewClientProps) {
  const getRankBadge = (rank?: string) => {
    switch (rank?.toLowerCase()) {
      case 'solemnity': return 'bg-yellow-100 text-yellow-800'
      case 'feast': return 'bg-orange-100 text-orange-800'
      case 'memorial': return 'bg-blue-100 text-blue-800'
      case 'optional_memorial': return 'bg-gray-100 text-gray-600'
      default: return 'bg-green-100 text-green-700'
    }
  }

  const getLiturgicalColor = (color?: string) => {
    switch (color?.toLowerCase()) {
      case 'white': return 'bg-gray-100 text-gray-800'
      case 'red': return 'bg-red-100 text-red-800'
      case 'green': return 'bg-green-100 text-green-800'
      case 'purple': return 'bg-purple-100 text-purple-800'
      case 'rose': return 'bg-pink-100 text-pink-800'
      case 'black': return 'bg-gray-200 text-gray-900'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1 order-2 md:order-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Liturgical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entry.liturgical_rank && (
                <div>
                  <label className="text-muted-foreground">Rank</label>
                  <div className="mt-1">
                    <Badge className={getRankBadge(entry.liturgical_rank)}>
                      {entry.liturgical_rank.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              )}

              {entry.liturgical_season && (
                <div>
                  <label className="text-muted-foreground">Season</label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {entry.liturgical_season}
                    </Badge>
                  </div>
                </div>
              )}

              {entry.color && (
                <div>
                  <label className="text-muted-foreground">Color</label>
                  <div className="mt-1">
                    <Badge className={getLiturgicalColor(entry.color)}>
                      {entry.color}
                    </Badge>
                  </div>
                </div>
              )}

              <div>
                <label className="text-muted-foreground">Type</label>
                <div className="mt-1">
                  <Badge variant={entry.is_custom ? "default" : "secondary"}>
                    {entry.is_custom ? "Custom" : "Universal"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Readings</CardTitle>
            </CardHeader>
            <CardContent>
              {entry.readings && entry.readings.length > 0 ? (
                <ul className="space-y-2">
                  {(entry.readings as string[]).map((reading, index) => (
                    <li key={index} className="text-sm border-l-2 border-primary/20 pl-3">
                      {reading}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No readings specified</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Special Prayers</CardTitle>
            </CardHeader>
            <CardContent>
              {entry.special_prayers && entry.special_prayers.length > 0 ? (
                <ul className="space-y-2">
                  {(entry.special_prayers as string[]).map((prayer, index) => (
                    <li key={index} className="text-sm border-l-2 border-primary/20 pl-3">
                      {prayer}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No special prayers specified</p>
              )}
            </CardContent>
          </Card>

          {entry.notes && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{entry.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full md:w-80 space-y-4 print:hidden order-1 md:order-2">
        <Card>
          <CardContent className="pt-4 px-4 pb-2 space-y-3">
            <Button asChild className="w-full" variant="default">
              <Link href={`/calendar/${entryId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Link>
            </Button>

            <Button asChild className="w-full" variant="outline">
              <Link href="/calendar?view=month">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Calendar
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 px-4 pb-4 space-y-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Date</div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {new Date(entry.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
              <div className="text-sm">
                {new Date(entry.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
