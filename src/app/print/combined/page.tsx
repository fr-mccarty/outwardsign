'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { IndividualReading, Petition } from '@/lib/types'
import { getIndividualReadings } from '@/lib/actions/readings'
import { getPetition } from '@/lib/actions/petitions'

function PrintCombinedContent() {
  const [readings, setReadings] = useState<IndividualReading[]>([])
  const [petition, setPetition] = useState<Petition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const collectionId = searchParams.get('collection')
  const readingIds = useMemo(() => 
    searchParams.get('readings')?.split(',').filter(Boolean) || []
  , [searchParams])
  const petitionId = searchParams.get('petition')
  const title = searchParams.get('title') || 'Liturgical Celebration'
  const occasion = searchParams.get('occasion') || ''

  useEffect(() => {
    const loadData = async () => {
      try {
        let loadedReadings: IndividualReading[] = []
        
        // Load readings from collection or individual selections
        if (collectionId) {
          // Legacy collection loading - skip for now
          loadedReadings = []
        } else if (readingIds.length > 0) {
          const allReadings = await getIndividualReadings()
          loadedReadings = allReadings.filter(r => readingIds.includes(r.id))
          // Sort by the order they appear in the URL
          loadedReadings.sort((a, b) => readingIds.indexOf(a.id) - readingIds.indexOf(b.id))
        }
        
        setReadings(loadedReadings)
        
        // Load petition if provided
        if (petitionId) {
          const petitionData = await getPetition(petitionId)
          setPetition(petitionData)
        }
        
        if (loadedReadings.length === 0 && !petitionId) {
          setError('No readings or petitions found to display')
        }
      } catch (err) {
        console.error('Failed to load print data:', err)
        setError('Failed to load content for printing')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [collectionId, readingIds, petitionId])

  // Auto-print after content loads
  useEffect(() => {
    if (!loading && !error && (readings.length > 0 || petition)) {
      const timer = setTimeout(() => {
        window.print()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [loading, error, readings.length, petition])

  const handlePrint = () => {
    window.print()
  }

  const handleClose = () => {
    router.back()
  }

  if (loading) {
    return (
      <div>
        <div className="print-preview-notice hide-on-print">
          Loading content for printing...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="print-preview-notice hide-on-print" style={{ background: '#ffebee', borderColor: '#f44336', color: '#c62828' }}>
          {error}
        </div>
        <div className="print-actions hide-on-print">
          <button className="print-button secondary" onClick={handleClose}>
            ← Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Print Actions - Hidden on Print */}
      <div className="print-actions hide-on-print">
        <button className="print-button secondary" onClick={handleClose}>
          ← Back
        </button>
        <button className="print-button" onClick={handlePrint}>
          🖨️ Print
        </button>
      </div>

      {/* Preview Notice - Hidden on Print */}
      <div className="print-preview-notice hide-on-print">
        Print Preview - This page will automatically print when content finishes loading
      </div>

      {/* Print Header */}
      <div className="print-header">
        <h1 style={{ fontSize: '18pt', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
          {title}
        </h1>
        {occasion && (
          <div style={{ fontSize: '14pt', margin: '0.5rem 0' }}>
            {occasion}
          </div>
        )}
        <div style={{ fontSize: '12pt', color: '#666' }}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Readings Content */}
      {readings.length > 0 && (
        <div>
          <h2 style={{ fontSize: '16pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem' }}>
            Readings
          </h2>
          
          {readings.map((reading, index) => (
            <div key={reading.id} className="reading-section no-break">
              <div className="reading-title">
                {reading.title}
              </div>
              
              <div className="reading-reference">
                {reading.pericope}
              </div>
              
              {reading.introduction && (
                <div className="reading-introduction">
                  {reading.introduction}
                </div>
              )}
              
              <div className="reading-text">
                {reading.reading_text.split('\n').map((paragraph, i) => (
                  <p key={i} style={{ marginBottom: '0.8rem' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {reading.conclusion && (
                <div className="reading-conclusion">
                  — {reading.conclusion}
                </div>
              )}
              
              {index < readings.length - 1 && (
                <div style={{ margin: '2rem 0', textAlign: 'center', fontSize: '12pt', color: '#666' }}>
                  • • •
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Petitions Content */}
      {petition && (
        <div className="petition-section page-break">
          <h2 style={{ fontSize: '16pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem' }}>
            Petitions
          </h2>
          
          <div style={{ marginBottom: '1rem', fontSize: '11pt', fontStyle: 'italic', textAlign: 'center' }}>
            {petition.title}
          </div>
          
          <div>
            {(petition.generated_content || '').split('\n').filter(line => line.trim()).map((petitionText, i) => (
              <div key={i} className="petition-item">
                <div style={{ marginBottom: '0.3rem' }}>
                  {petitionText}
                </div>
                <div className="petition-response liturgical-rubric">
                  Lord, hear our prayer.
                </div>
              </div>
            ))}
          </div>
          
          {/* Concluding Prayer */}
          <div style={{ marginTop: '2rem', fontSize: '12pt', fontStyle: 'italic' }}>
            <div style={{ marginBottom: '1rem' }}>
              Almighty and eternal God, ruler of all things in heaven and earth: 
              Mercifully accept the prayers of your people, and strengthen us to do your will; 
              through Jesus Christ our Lord.
            </div>
            <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
              Amen.
            </div>
          </div>
        </div>
      )}

      {/* Print Footer */}
      <div className="print-footer">
        Generated by Liturgy.Faith • {new Date().toLocaleDateString()}
      </div>
    </div>
  )
}

export default function PrintCombinedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrintCombinedContent />
    </Suspense>
  )
}