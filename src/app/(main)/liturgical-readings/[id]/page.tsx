'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from "next/link"
import { Edit, Calendar } from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { useRouter } from 'next/navigation'
import type { LiturgicalReading } from '@/lib/types'
import type { IndividualReading } from '@/lib/actions/readings'
import { getLiturgicalReading } from '@/lib/actions/liturgical-readings'
import { getIndividualReadings } from '@/lib/actions/readings'
import { PrintButton } from '@/components/print-button'


interface PageProps {
  params: Promise<{ id: string }>
}

export default function LiturgicalReadingDetailPage({ params }: PageProps) {
  const [liturgicalReading, setLiturgicalReading] = useState<LiturgicalReading | null>(null)
  const [allReadings, setAllReadings] = useState<IndividualReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [readingId, setReadingId] = useState<string>('')
  const { setBreadcrumbs } = useBreadcrumbs()
  const router = useRouter()

  useEffect(() => {
    const loadReading = async () => {
      try {
        const { id } = await params
        setReadingId(id)
        
        // Load liturgical reading data
        const liturgicalReadingData = await getLiturgicalReading(id)
        if (!liturgicalReadingData) {
          setError('Liturgical reading not found')
          setLoading(false)
          return
        }

        // Load all individual readings to get the content
        const allReadingsData = await getIndividualReadings()
        
        setLiturgicalReading(liturgicalReadingData)
        setAllReadings(allReadingsData)
        setBreadcrumbs([
          { label: "Dashboard", href: "/dashboard" },
          { label: "Liturgical Readings", href: "/liturgical-readings" },
          { label: liturgicalReadingData.title }
        ])
      } catch (error) {
        console.error('Failed to load reading collection:', error)
        setError('Failed to load liturgical reading')
        router.push('/liturgical-readings')
      } finally {
        setLoading(false)
      }
    }

    loadReading()
  }, [params, setBreadcrumbs, router])

  
  const getReadingById = (readingId?: string): IndividualReading | null => {
    if (!readingId) return null
    return allReadings.find(r => r.id === readingId) || null
  }

  // Function to parse and format psalm text
  const formatPsalmText = (text: string): string => {
    // Split by "Reader:" and "People:" patterns since there are no line breaks
    let formattedHtml = ''
    
    // Split the text by Reader: and People: patterns
    const parts = text.split(/(Reader:|People:)/).filter(part => part.trim())
    
    let currentType = ''
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim()
      
      if (part === 'Reader:') {
        currentType = 'Reader'
      } else if (part === 'People:') {
        currentType = 'People'
      } else if (part && currentType) {
        // This is the content following Reader: or People:
        const content = part.trim()
        
        if (currentType === 'Reader') {
          formattedHtml += `<div class="font-semibold mb-3"><span class="font-bold">Reader:</span> ${content}</div>`
        } else if (currentType === 'People') {
          formattedHtml += `<div class="italic mb-3"><span class="font-semibold">People:</span> ${content}</div>`
        }
        
        currentType = '' // Reset after processing content
      }
    }
    
    return formattedHtml || text // Fallback to original text
  }


  if (loading) {
    return (
      <PageContainer 
        title="Liturgical Reading Collection"
        description="Loading reading collection details..."
        maxWidth="6xl"
      >
        <Loading />
      </PageContainer>
    )
  }

  if (error || !liturgicalReading) {
    return (
      <PageContainer 
        title="Liturgical Reading Collection"
        description="Error loading reading collection"
        maxWidth="6xl"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">Reading Collection Not Found</h1>
          <p className="text-muted-foreground mt-2">
            {error || 'The reading collection you\'re looking for could not be found.'}
          </p>
          <Button asChild className="mt-4">
            <Link href="/liturgical-readings">
              Back to My Readings
            </Link>
          </Button>
        </div>
      </PageContainer>
    )
  }

  // Get individual readings
  const firstReading = getReadingById(liturgicalReading.first_reading_id)
  const psalm = getReadingById(liturgicalReading.psalm_id)
  const secondReading = getReadingById(liturgicalReading.second_reading_id)
  const gospel = getReadingById(liturgicalReading.gospel_reading_id)
  
  // Count total readings
  const readingCount = [firstReading, psalm, secondReading, gospel].filter(Boolean).length

  return (
    <PageContainer 
      title={liturgicalReading?.title || 'Liturgical Reading Collection'}
      description={liturgicalReading?.description || 'Collection of liturgical readings'}
      maxWidth="6xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {liturgicalReading.date ? new Date(liturgicalReading.date).toLocaleDateString() : new Date(liturgicalReading.created_at).toLocaleDateString()}
          </div>
        </div>
        <div className="flex gap-3">
          <PrintButton 
            itemId={readingId}
            itemType="liturgical-readings"
          />
          <Button asChild>
            <Link href={`/liturgical-readings/${readingId}/wizard`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* First Reading */}
        {firstReading && (
          <Card>
            <CardContent className="p-6">
              <div className="text-right space-y-1">
                <div className="text-xl text-red-500 font-semibold">FIRST READING</div>
                <div className="text-xl text-red-500 font-semibold italic">{firstReading.pericope}</div>
                {liturgicalReading.first_reading_lector && (
                  <div className="text-xl text-red-500 font-bold">{liturgicalReading.first_reading_lector}</div>
                )}
              </div>
              
              {firstReading.introduction && (
                <div className="mt-3 font-semibold">
                  {firstReading.introduction}
                </div>
              )}
              
              <p className="mt-3 whitespace-pre-line leading-relaxed">
                {firstReading.reading_text}
              </p>
              
              {firstReading.conclusion && (
                <div className="mt-3 font-semibold">
                  {firstReading.conclusion}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Responsorial Psalm */}
        {psalm && (
          <Card>
            <CardContent className="p-6">
              <div className="text-right space-y-1">
                <div className="text-xl text-red-500 font-semibold">PSALM</div>
                <div className="text-xl text-red-500 font-semibold italic">{psalm.pericope}</div>
                {liturgicalReading.psalm_lector && (
                  <div className="text-xl text-red-500 font-bold">{liturgicalReading.psalm_lector}</div>
                )}
              </div>
              
              {psalm.introduction && (
                <div className="mt-3 font-semibold">
                  {psalm.introduction}
                </div>
              )}
              
              <div className="mt-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatPsalmText(psalm.reading_text) }} />
              
              {psalm.conclusion && (
                <div className="mt-3 font-semibold">
                  {psalm.conclusion}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Second Reading */}
        {secondReading && (
          <Card>
            <CardContent className="p-6">
              <div className="text-right space-y-1">
                <div className="text-xl text-red-500 font-semibold">SECOND READING</div>
                <div className="text-xl text-red-500 font-semibold italic">{secondReading.pericope}</div>
                {liturgicalReading.second_reading_lector && (
                  <div className="text-xl text-red-500 font-bold">{liturgicalReading.second_reading_lector}</div>
                )}
              </div>
              
              {secondReading.introduction && (
                <div className="mt-3 font-semibold">
                  {secondReading.introduction}
                </div>
              )}
              
              <p className="mt-3 whitespace-pre-line leading-relaxed">
                {secondReading.reading_text}
              </p>
              
              {secondReading.conclusion && (
                <div className="mt-3 font-semibold">
                  {secondReading.conclusion}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Gospel */}
        {gospel && (
          <Card>
            <CardContent className="p-6">
              <div className="text-right space-y-1">
                <div className="text-xl text-red-500 font-semibold">GOSPEL READING</div>
                <div className="text-xl text-red-500 font-semibold italic">{gospel.pericope}</div>
                {liturgicalReading.gospel_lector && (
                  <div className="text-xl text-red-500 font-bold">{liturgicalReading.gospel_lector}</div>
                )}
              </div>
              
              {gospel.introduction && (
                <div className="mt-3 font-semibold">
                  {gospel.introduction}
                </div>
              )}
              
              <p className="mt-3 whitespace-pre-line leading-relaxed">
                {gospel.reading_text}
              </p>
              
              {gospel.conclusion && (
                <div className="mt-3 font-semibold">
                  {gospel.conclusion}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {readingCount === 0 && (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No readings have been added to this collection yet.
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}