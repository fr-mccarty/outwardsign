'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Petition } from '@/lib/types'
import { getPetition } from '@/lib/actions/petitions'

interface PrintPetitionPageProps {
  params: Promise<{ petitionId: string }>
}

export default function PrintPetitionPage({ params }: PrintPetitionPageProps) {
  const [petition, setPetition] = useState<Petition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const { petitionId: id } = await params
      
      if (!id) {
        setError('No petition ID provided')
        setLoading(false)
        return
      }

      try {
        const petitionData = await getPetition(id)
        if (!petitionData) {
          setError('Petition not found')
        } else {
          setPetition(petitionData)
        }
      } catch (err) {
        console.error('Failed to load petition:', err)
        setError('Failed to load petition for printing')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params])


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
            <span className="text-gray-600">Loading petition for printing...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !petition) {
    return (
      <div>
        <div className="print-preview-notice hide-on-print" style={{ background: '#ffebee', borderColor: '#f44336', color: '#c62828' }}>
          {error || 'Petition not found'}
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

  return (
    <div>
      {/* Custom print styles for smaller margins */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              margin: 0.5cm 0.8cm 0.3cm 0.8cm !important;
            }
            .petitions-print-content {
              padding: 1.5cm 0 0 0 !important;
            }
          }
          @media screen {
            .petitions-print-content {
              padding: 0.5cm 0.8cm 0.3cm 0.8cm !important;
            }
          }
        `
      }} />
      
      {/* Print Actions - Hidden on Print */}
      <div className="print-actions hide-on-print">
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>


      {/* Petitions Content */}
      <div className="petitions-print-content font-sans">
        {/* Header - Right Aligned Red Text */}
        <div className="text-right text-xl text-red-500 font-semibold">
          {petition.language.toLowerCase() === 'spanish' ? 'PETICIONES' :
           petition.language.toLowerCase() === 'french' ? 'PRIÈRE UNIVERSELLE' :
           petition.language.toLowerCase() === 'latin' ? 'ORATIO UNIVERSALIS' :
           'PETITIONS'}
        </div>
        <div className="text-right text-xl text-red-500 font-semibold italic">
          {petition.title}
        </div>
        <div className="text-right text-xl text-red-500 font-bold">
          {new Date(petition.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>


        {/* Petitions Content */}
        <div className="mt-8">
          {(petition.text || petition.generated_content) ? (
            <div className="whitespace-pre-line">
              {(petition.text || petition.generated_content)?.split('\n')
                .filter(line => line.trim())
                .filter((line, index) => {
                  // Skip the first line if it matches the petition title
                  if (index === 0 && line.trim().toLowerCase() === petition.title.toLowerCase()) {
                    return false
                  }
                  return true
                })
                .map((petitionText, i) => (
                <div key={i} className="mb-4">
                  <div className="mb-1">
                    {petitionText}
                  </div>
                  <div className="font-semibold text-red-500 italic ml-8">
                    {petition.language.toLowerCase() === 'spanish' ? 'Te rogamos, óyenos.' : 
                     petition.language.toLowerCase() === 'french' ? 'Nous te prions, écoute-nous.' :
                     petition.language.toLowerCase() === 'latin' ? 'Te rogamus, audi nos.' :
                     'Lord, hear our prayer.'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 italic text-gray-600">
              No petition content generated yet. Please return to the wizard to generate petitions.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}