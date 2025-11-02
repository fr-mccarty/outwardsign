'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LiturgicalReading } from '@/lib/types'
import type { IndividualReading } from '@/lib/actions/readings'
import { getLiturgicalReading } from '@/lib/actions/liturgical-readings'
import { getIndividualReadings } from '@/lib/actions/readings'

interface PrintLiturgicalReadingPageProps {
  params: Promise<{ id: string }>
}

export default function PrintLiturgicalReadingPage({ params }: PrintLiturgicalReadingPageProps) {
  const [liturgicalReading, setLiturgicalReading] = useState<LiturgicalReading | null>(null)
  const [readings, setReadings] = useState<IndividualReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params
      
      if (!id) {
        setError('No liturgical reading ID provided')
        setLoading(false)
        return
      }

      try {
        // Load liturgical reading data
        const liturgicalReadingData = await getLiturgicalReading(id)
        if (!liturgicalReadingData) {
          setError('Liturgical reading not found')
          setLoading(false)
          return
        }

        // Load all individual readings to get the content
        const allReadings = await getIndividualReadings()
        
        setLiturgicalReading(liturgicalReadingData)
        setReadings(allReadings)
      } catch (err) {
        console.error('Failed to load liturgical reading:', err)
        setError('Failed to load liturgical reading for printing')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params])

  const getReadingById = (readingId?: string): IndividualReading | null => {
    if (!readingId) return null
    return readings.find(r => r.id === readingId) || null
  }

  // Function to parse and format psalm text
  const formatPsalmText = (text: string): string => {
    console.log('Psalm text to format:', text) // Debug logging
    
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
    
    console.log('Formatted HTML:', formattedHtml) // Debug logging
    return formattedHtml || text // Fallback to original text
  }

  const handlePrint = () => {
    window.print()
  }

  const handleClose = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="hide-on-print">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="text-gray-600">Loading liturgical readings for printing...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !liturgicalReading) {
    return (
      <div>
        <div className="print-preview-notice hide-on-print" style={{ background: '#ffebee', borderColor: '#f44336', color: '#c62828' }}>
          {error || 'Liturgical reading not found'}
        </div>
        <div className="print-actions hide-on-print">
          <Button variant="outline" onClick={handleClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    )
  }

  const firstReading = getReadingById(liturgicalReading.first_reading_id)
  const psalm = getReadingById(liturgicalReading.psalm_id)
  const secondReading = getReadingById(liturgicalReading.second_reading_id)
  const gospel = getReadingById(liturgicalReading.gospel_reading_id)
  
  // Check which readings exist and determine if page break is needed
  const hasMoreReadingsAfter = (currentType: 'first' | 'psalm' | 'second' | 'gospel') => {
    switch(currentType) {
      case 'first':
        return !!(psalm || secondReading || gospel)
      case 'psalm':
        return !!(secondReading || gospel)
      case 'second':
        return !!gospel
      case 'gospel':
        return false
      default:
        return false
    }
  }

  return (
    <div>
      {/* Print Actions - Hidden on Print */}
      <div className="print-actions hide-on-print">
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Print Content */}
      <div className="liturgical-readings-print-content">
        {/* First Reading */}
        {firstReading && (
          <div className={`p-6 ${hasMoreReadingsAfter('first') ? 'break-after-page' : ''}`}>
            <div className="text-right text-xl text-red-500 font-semibold">FIRST READING</div>
            <div className="text-right text-xl text-red-500 font-semibold italic">{firstReading.pericope}</div>
            {liturgicalReading.first_reading_lector && (
              <div className="text-right text-xl text-red-500 font-bold">{liturgicalReading.first_reading_lector}</div>
            )}
            {firstReading.introduction && (
              <div className="mt-3 font-semibold">{firstReading.introduction}</div>
            )}
            <p className="mt-3 whitespace-pre-line">{firstReading.text}</p>
            {firstReading.conclusion && (
              <div className="mt-3 font-semibold">{firstReading.conclusion}</div>
            )}
          </div>
        )}

        {/* Responsorial Psalm */}
        {psalm && (
          <div className={`p-6 ${hasMoreReadingsAfter('psalm') ? 'break-after-page' : ''}`}>
            <div className="text-right text-xl text-red-500 font-semibold">PSALM</div>
            <div className="text-right text-xl text-red-500 font-semibold italic">{psalm.pericope}</div>
            {liturgicalReading.psalm_lector && (
              <div className="text-right text-xl text-red-500 font-bold">{liturgicalReading.psalm_lector}</div>
            )}
            {psalm.introduction && (
              <div className="mt-3 font-semibold">{psalm.introduction}</div>
            )}
            <div className="mt-3" dangerouslySetInnerHTML={{ __html: formatPsalmText(psalm.text) }} />
            {psalm.conclusion && (
              <div className="mt-3 font-semibold">{psalm.conclusion}</div>
            )}
          </div>
        )}

        {/* Second Reading */}
        {secondReading && (
          <div className={`p-6 ${hasMoreReadingsAfter('second') ? 'break-after-page' : ''}`}>
            <div className="text-right text-xl text-red-500 font-semibold">SECOND READING</div>
            <div className="text-right text-xl text-red-500 font-semibold italic">{secondReading.pericope}</div>
            {liturgicalReading.second_reading_lector && (
              <div className="text-right text-xl text-red-500 font-bold">{liturgicalReading.second_reading_lector}</div>
            )}
            {secondReading.introduction && (
              <div className="mt-3 font-semibold">{secondReading.introduction}</div>
            )}
            <p className="mt-3 whitespace-pre-line">{secondReading.text}</p>
            {secondReading.conclusion && (
              <div className="mt-3 font-semibold">{secondReading.conclusion}</div>
            )}
          </div>
        )}

        {/* Gospel */}
        {gospel && (
          <div className="p-6">
            <div className="text-right text-xl text-red-500 font-semibold">GOSPEL READING</div>
            <div className="text-right text-xl text-red-500 font-semibold italic">{gospel.pericope}</div>
            {liturgicalReading.gospel_lector && (
              <div className="text-right text-xl text-red-500 font-bold">{liturgicalReading.gospel_lector}</div>
            )}
            {gospel.introduction && (
              <div className="mt-3 font-semibold">{gospel.introduction}</div>
            )}
            <p className="mt-3 whitespace-pre-line">{gospel.text}</p>
            {gospel.conclusion && (
              <div className="mt-3 font-semibold">{gospel.conclusion}</div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!firstReading && !psalm && !secondReading && !gospel && (
          <div className="p-6">
            <div className="text-center text-gray-600 italic">
              No readings have been selected for this liturgical reading collection yet.
              Please return to the wizard to select readings.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}