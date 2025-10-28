'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from "next/link"
import { Plus, BookOpen, Edit, Eye, Calendar, Printer } from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getLiturgicalReadings } from '@/lib/actions/liturgical-readings'
import type { LiturgicalReading } from '@/lib/types'
import { useRouter } from 'next/navigation'

export default function LiturgicalReadingsPage() {
  const [readings, setReadings] = useState<LiturgicalReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setBreadcrumbs } = useBreadcrumbs()
  const router = useRouter()

  const getReadingsCount = (reading: LiturgicalReading): number => {
    let count = 0
    if (reading.first_reading_id) count++
    if (reading.psalm_id) count++
    if (reading.second_reading_id) count++
    if (reading.gospel_reading_id) count++
    return count
  }

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "My Liturgical Readings" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    const loadReadings = async () => {
      try {
        console.log('Loading liturgical readings...')
        const data = await getLiturgicalReadings()
        console.log('Loaded readings:', data)
        setReadings(data)
        setError(null)
      } catch (error) {
        console.error('Failed to load readings:', error)
        
        // Check if this is a redirect error (which happens when no parish is selected)
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
          setError('Please select a parish first. You will be redirected to the parish selection page.')
          setTimeout(() => {
            router.push('/select-parish')
          }, 2000)
        } else {
          setError(error instanceof Error ? error.message : 'An unknown error occurred')
        }
      } finally {
        setLoading(false)
      }
    }

    loadReadings()
  }, [router])


  return (
    <PageContainer 
      title="Our Liturgical Readings"
      description="Manage your liturgical reading collections created with the wizard or manual entry."
      maxWidth="7xl"
    >
      <div className="flex justify-end mb-6">
        <Button asChild>
          <Link href="/liturgical-readings/create">
            <Plus className="h-4 w-4 mr-2" />
            New Liturgical Readings
          </Link>
        </Button>
      </div>

      {loading && <Loading variant="skeleton-cards" />}
      
      {error && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-red-600 mb-4">
              <h3 className="text-lg font-medium mb-2">Error Loading Readings</h3>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && readings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readings.map((reading) => (
            <Card key={reading.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{reading.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {getReadingsCount(reading)} reading{getReadingsCount(reading) !== 1 ? 's' : ''}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {reading.date ? new Date(reading.date).toLocaleDateString() : new Date(reading.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/liturgical-readings/${reading.id}/wizard`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {reading.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {reading.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(reading.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild title="View">
                      <Link href={`/liturgical-readings/${reading.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild title="Print">
                      <Link href={`/print/liturgical-readings/${reading.id}`} target="_blank">
                        <Printer className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !loading && !error ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No liturgical readings yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first liturgical reading collection to get started.
            </p>
            <Button asChild>
              <Link href="/liturgical-readings/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Readings
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  )
}