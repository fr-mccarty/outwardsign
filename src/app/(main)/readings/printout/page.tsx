'use client'

import { useEffect, useState } from 'react'
import type { ReadingCollection, IndividualReading, Petition } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import { Printer, Download, Eye } from "lucide-react"
import { getReadingCollections, getIndividualReadings } from "@/lib/actions/readings"
import { getPetitions } from "@/lib/actions/petitions"
import { useBreadcrumbs } from '@/components/breadcrumb-context'

export default function ReadingsPrintoutPage() {
  const [collections, setCollections] = useState<ReadingCollection[]>([])
  const [individualReadings, setIndividualReadings] = useState<IndividualReading[]>([])
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [loading, setLoading] = useState(true)
  const [printMode, setPrintMode] = useState<'readings-only' | 'readings-and-petitions'>('readings-only')
  const [selectedCollection, setSelectedCollection] = useState<string>('')
  const [selectedReadings, setSelectedReadings] = useState<string[]>([])
  const [selectedPetition, setSelectedPetition] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [collectionReadings, setCollectionReadings] = useState<IndividualReading[]>([])
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Readings Printout" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [collectionsData, readingsData, petitionsData] = await Promise.all([
          getReadingCollections(),
          getIndividualReadings(),
          getPetitions()
        ])
        setCollections(collectionsData as ReadingCollection[])
        setIndividualReadings(readingsData)
        setPetitions(petitionsData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleReadingToggle = (readingId: string, checked: boolean) => {
    if (checked) {
      setSelectedReadings(prev => [...prev, readingId])
    } else {
      setSelectedReadings(prev => prev.filter(id => id !== readingId))
    }
  }

  // Load collection readings when collection is selected
  useEffect(() => {
    const loadCollectionReadings = async () => {
      if (selectedCollection) {
        try {
          // Legacy function - return empty for now
          setCollectionReadings([])
        } catch (error) {
          console.error('Failed to load collection readings:', error)
          setCollectionReadings([])
        }
      } else {
        setCollectionReadings([])
      }
    }

    loadCollectionReadings()
  }, [selectedCollection])

  const getSelectedReadingsData = () => {
    if (selectedCollection) {
      return collectionReadings
    }
    return individualReadings.filter(r => selectedReadings.includes(r.id))
  }

  const getSelectedPetitionData = () => {
    return petitions.find(p => p.id === selectedPetition)
  }

  const handlePrint = () => {
    // Build URL parameters for print layout
    const params = new URLSearchParams()
    
    if (selectedCollection) {
      params.set('collection', selectedCollection)
    } else if (selectedReadings.length > 0) {
      params.set('readings', selectedReadings.join(','))
    }
    
    if (printMode === 'readings-and-petitions' && selectedPetition) {
      params.set('petition', selectedPetition)
      params.set('includePetitions', 'true')
    }
    
    params.set('title', 'Liturgical Readings')
    
    // Open print layout in new window
    const printUrl = printMode === 'readings-and-petitions' 
      ? `/print/combined?${params.toString()}`
      : `/print/readings-print?${params.toString()}`
    window.open(printUrl, '_blank')
  }

  const handleDownload = () => {
    const readingsData = getSelectedReadingsData()
    const petitionData = getSelectedPetitionData()
    
    let content = '# Liturgical Readings\n\n'
    
    readingsData.forEach((reading) => {
      content += `## ${reading.title}\n`
      content += `**${reading.pericope}**\n\n`
      if (reading.introduction) {
        content += `${reading.introduction}\n\n`
      }
      content += `${reading.reading_text}\n\n`
      if (reading.conclusion) {
        content += `— ${reading.conclusion}\n\n`
      }
      content += '---\n\n'
    })

    if (printMode === 'readings-and-petitions' && petitionData) {
      content += '# Petitions\n\n'
      content += `${petitionData.petition_text || petitionData.generated_content || ''}\n\n`
    }

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'liturgical-readings.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <PageContainer 
        title="Readings Printout"
        description="Create formatted printouts of readings and petitions for liturgical use."
        maxWidth="6xl"
      >
        <Loading />
      </PageContainer>
    )
  }

  const readingsData = getSelectedReadingsData()
  const petitionData = getSelectedPetitionData()

  return (
    <PageContainer 
      title="Readings Printout"
      description="Create formatted printouts of readings and petitions for liturgical use."
      maxWidth="6xl"
    >
      <div className="flex justify-end items-center mb-6">
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={readingsData.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={handlePrint} disabled={readingsData.length === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Print Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label>Content Type</label>
                <Select value={printMode} onValueChange={(value: 'readings-only' | 'readings-and-petitions') => setPrintMode(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="readings-only">Readings Only</SelectItem>
                    <SelectItem value="readings-and-petitions">Readings + Petitions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Readings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label>From Collection (Optional)</label>
                <Select value={selectedCollection} onValueChange={(value) => {
                  setSelectedCollection(value)
                  setSelectedReadings([]) // Clear individual selections when collection is chosen
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a collection..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No collection</SelectItem>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name} ({collection.occasion_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!selectedCollection && (
                <div>
                  <label>Individual Readings</label>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {individualReadings.map((reading) => (
                      <div key={reading.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={reading.id}
                          checked={selectedReadings.includes(reading.id)}
                          onCheckedChange={(checked) => handleReadingToggle(reading.id, !!checked)}
                        />
                        <label
                          htmlFor={reading.id}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {reading.title} - {reading.pericope}
                        </label>
                        <Badge variant="outline" className="text-xs">
                          {reading.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {printMode === 'readings-and-petitions' && (
            <Card>
              <CardHeader>
                <CardTitle>Select Petition</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedPetition} onValueChange={setSelectedPetition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a petition..." />
                  </SelectTrigger>
                  <SelectContent>
                    {petitions.map((petition) => (
                      <SelectItem key={petition.id} value={petition.id}>
                        {petition.title} ({petition.language})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Print Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="print-preview bg-white p-6 border rounded-lg" style={{ fontFamily: 'serif' }}>
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Liturgical Readings</h1>
                    <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
                  </div>

                  {readingsData.map((reading, index) => (
                    <div key={reading.id} className="mb-8">
                      <h2 className="text-xl font-semibold mb-2">{reading.title}</h2>
                      <p className="text-lg font-medium italic mb-3">{reading.pericope}</p>
                      
                      {reading.introduction && (
                        <p className="mb-3 text-gray-700">{reading.introduction}</p>
                      )}
                      
                      <div className="mb-3 leading-relaxed">
                        {reading.reading_text.split('\n').map((paragraph, i) => (
                          <p key={i} className="mb-2">{paragraph}</p>
                        ))}
                      </div>
                      
                      {reading.conclusion && (
                        <p className="italic text-right">— {reading.conclusion}</p>
                      )}
                      
                      {index < readingsData.length - 1 && <hr className="my-6" />}
                    </div>
                  ))}

                  {printMode === 'readings-and-petitions' && petitionData && (
                    <div className="mt-8 pt-6 border-t">
                      <h2 className="text-xl font-semibold mb-4">Petitions</h2>
                      <div className="leading-relaxed">
                        {(petitionData.petition_text || petitionData.generated_content || '').split('\n').map((line, i) => (
                          <p key={i} className="mb-2">{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <style jsx>{`
        @media print {
          .print-preview {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print-preview, .print-preview * {
            visibility: visible;
          }
          
          .print-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </PageContainer>
  )
}