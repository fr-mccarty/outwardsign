'use client'

import { useEffect, useState } from 'react'
import type { LiturgicalCalendarEntry } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from "next/link"
import { Plus, Calendar as CalendarIcon, Edit } from "lucide-react"
import { getCalendarEntries } from "@/lib/actions/calendar"
import { useBreadcrumbs } from '@/components/breadcrumb-context'

export default function CalendarPage() {
  const [calendarEntries, setCalendarEntries] = useState<LiturgicalCalendarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Liturgical Calendar" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    const loadCalendarEntries = async () => {
      try {
        const entries = await getCalendarEntries()
        setCalendarEntries(entries)
      } catch (error) {
        console.error('Failed to load calendar entries:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCalendarEntries()
  }, [])

  if (loading) {
    return (
      <PageContainer
        title="Liturgical Calendar"
        description="Manage liturgical seasons, feast days, and special celebrations."
        maxWidth="7xl"
      >
        <Loading variant="skeleton-cards" />
      </PageContainer>
    )
  }
  
  // Group entries by month for better organization
  const entriesByMonth = calendarEntries.reduce((acc, entry) => {
    const monthKey = new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(entry)
    return acc
  }, {} as Record<string, typeof calendarEntries>)

  const getLiturgicalColor = (color?: string) => {
    switch (color?.toLowerCase()) {
      case 'white': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'red': return 'bg-red-100 text-red-800 border-red-200'
      case 'green': return 'bg-green-100 text-green-800 border-green-200'
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'rose': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'black': return 'bg-gray-200 text-gray-900 border-gray-300'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getRankBadge = (rank?: string) => {
    switch (rank?.toLowerCase()) {
      case 'solemnity': return 'bg-yellow-100 text-yellow-800'
      case 'feast': return 'bg-orange-100 text-orange-800'
      case 'memorial': return 'bg-blue-100 text-blue-800'
      case 'optional_memorial': return 'bg-gray-100 text-gray-600'
      default: return 'bg-green-100 text-green-700'
    }
  }

  return (
    <PageContainer
      title="Liturgical Calendar"
      description="Manage liturgical seasons, feast days, and special celebrations."
      maxWidth="7xl"
    >
      <div className="flex justify-end mb-6">
        <Button asChild>
          <Link href="/calendar/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Link>
        </Button>
      </div>

      {Object.keys(entriesByMonth).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(entriesByMonth).map(([month, entries]) => (
            <div key={month} className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">{month}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entries.map((entry) => (
                  <Card key={entry.id} className={`hover:shadow-lg transition-shadow border-l-4 ${getLiturgicalColor(entry.color)}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{entry.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/calendar/${entry.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {entry.liturgical_rank && (
                          <Badge className={getRankBadge(entry.liturgical_rank)}>
                            {entry.liturgical_rank.replace('_', ' ')}
                          </Badge>
                        )}
                        {entry.liturgical_season && (
                          <Badge variant="outline">
                            {entry.liturgical_season}
                          </Badge>
                        )}
                        {entry.color && (
                          <Badge variant="outline" className={getLiturgicalColor(entry.color)}>
                            {entry.color}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Readings:</span>
                          <span className="ml-1 font-medium">{entry.readings?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prayers:</span>
                          <span className="ml-1 font-medium">{entry.special_prayers?.length || 0}</span>
                        </div>
                      </div>
                      
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {entry.notes}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                          {entry.is_custom ? 'Custom' : 'Universal'}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/calendar/${entry.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No calendar entries yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your liturgical calendar with feast days, special celebrations, and seasonal planning.
            </p>
            <Button asChild>
              <Link href="/calendar/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}