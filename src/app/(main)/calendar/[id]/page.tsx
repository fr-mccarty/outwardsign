'use client'

import { useEffect, useState } from 'react'
import type { LiturgicalCalendarEntry } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import { getCalendarEntry } from "@/lib/actions/calendar"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CalendarDetailPage({ params }: PageProps) {
  const [entry, setEntry] = useState<LiturgicalCalendarEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [entryId, setEntryId] = useState<string>('')
  const { setBreadcrumbs } = useBreadcrumbs()
  const router = useRouter()

  useEffect(() => {
    const loadEntry = async () => {
      try {
        const { id } = await params
        setEntryId(id)
        const entryData = await getCalendarEntry(id)

        if (!entryData) {
          router.push('/calendar?view=month')
          return
        }

        setEntry(entryData)
        setBreadcrumbs([
          { label: "Dashboard", href: "/dashboard" },
          { label: "Liturgical Calendar", href: "/calendar?view=month" },
          { label: entryData.title }
        ])
      } catch (error) {
        console.error('Failed to load calendar entry:', error)
        router.push('/calendar?view=month')
      } finally {
        setLoading(false)
      }
    }

    loadEntry()
  }, [params, setBreadcrumbs, router])

  if (loading) {
    return (
      <PageContainer 
        title="Calendar Event"
        description="Loading event details..."
        maxWidth="4xl"
      >
        <Loading />
      </PageContainer>
    )
  }

  if (!entry) {
    return null
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
    <PageContainer 
      title={entry.title}
      description={`${entry.liturgical_rank || 'Event'} - ${new Date(entry.date).toLocaleDateString()}`}
      maxWidth="4xl"
    >
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/calendar?view=month">
            <ArrowLeft className="h-4 w-4" />
            Back to Calendar
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/calendar/${entryId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Event
          </Link>
        </Button>
      </div>

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
    </PageContainer>
  )
}