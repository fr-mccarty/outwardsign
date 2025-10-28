'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Printer,
  Save
} from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getIndividualReadings } from '@/lib/actions/readings'
import type { IndividualReading } from '@/lib/types'
import { Wizard, type WizardStep } from '@/components/wizard'

interface WizardData {
  title: string
  description: string
  readings: {
    first?: string
    psalm?: string
    second?: string
    gospel?: string
  }
  lectors: {
    first?: string
    psalm?: string
    second?: string
    gospel?: string
  }
  printOptions: {
    first: boolean
    psalm: boolean
    second: boolean
    gospel: boolean
  }
}

const STEPS: WizardStep[] = [
  { id: 1, title: 'Event Details', description: 'Tell us about the liturgical event' },
  { id: 2, title: 'First Reading', description: 'Select the first reading for your liturgical celebration' },
  { id: 3, title: 'Psalm', description: 'Select the psalm for your liturgical celebration' },
  { id: 4, title: 'Second Reading & Gospel', description: 'Complete your reading selections' },
  { id: 5, title: 'Review & Save', description: 'Review your reading selections and save or print' }
]

const READING_CATEGORIES = {
  first: ['first-reading', 'sunday-1', 'weekday-1', 'marriage-1', 'funeral-1'],
  psalm: ['psalm', 'sunday-psalm', 'weekday-psalm', 'marriage-psalm', 'funeral-psalm'],
  second: ['second-reading', 'sunday-2', 'weekday-2', 'marriage-2', 'funeral-2'],
  gospel: ['gospel', 'sunday-gospel', 'weekday-gospel', 'marriage-gospel', 'funeral-gospel']
}

export default function ReadingsWizardPage() {
  const [wizardData, setWizardData] = useState<WizardData>({
    title: '',
    description: '',
    readings: {},
    lectors: {},
    printOptions: {
      first: true,
      psalm: true,
      second: true,
      gospel: true
    }
  })
  const [availableReadings, setAvailableReadings] = useState<IndividualReading[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Liturgical Readings", href: "/liturgical-readings" },
      { label: "Readings Wizard" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    const loadReadings = async () => {
      try {
        const readings = await getIndividualReadings()
        setAvailableReadings(readings)
      } catch (error) {
        console.error('Failed to load readings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReadings()
  }, [])

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }))
  }

  const getReadingsForCategory = (category: keyof typeof READING_CATEGORIES) => {
    const categories = READING_CATEGORIES[category]
    return availableReadings.filter(reading => 
      categories.includes(reading.category.toLowerCase())
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Implement save functionality
      console.log('Saving wizard data:', wizardData)
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Readings saved successfully!')
    } catch (error) {
      console.error('Failed to save readings:', error)
      alert('Failed to save readings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    // Build print URL with selected readings
    const params = new URLSearchParams()
    
    const selectedReadingIds = Object.values(wizardData.readings).filter(Boolean)
    if (selectedReadingIds.length > 0) {
      params.set('readings', selectedReadingIds.join(','))
    }
    
    params.set('title', wizardData.title || 'Liturgical Readings')
    
    const printUrl = `/print/readings-print?${params.toString()}`
    
    window.open(printUrl, '_blank')
  }

  const handleComplete = () => {
    handleSave()
  }

  const renderStepContent = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return <EventDetailsStep wizardData={wizardData} updateWizardData={updateWizardData} />
      case 2:
        return (
          <ReadingSelectionStep
            title="First Reading"
            description="Select the first reading for your liturgical celebration"
            category="first"
            readings={getReadingsForCategory('first')}
            selectedReading={wizardData.readings.first}
            lector={wizardData.lectors.first}
            printOption={wizardData.printOptions.first}
            onReadingChange={(reading) => updateWizardData({ 
              readings: { ...wizardData.readings, first: reading } 
            })}
            onLectorChange={(lector) => updateWizardData({ 
              lectors: { ...wizardData.lectors, first: lector } 
            })}
            onPrintChange={(print) => updateWizardData({ 
              printOptions: { ...wizardData.printOptions, first: print } 
            })}
          />
        )
      case 3:
        return (
          <ReadingSelectionStep
            title="Responsorial Psalm"
            description="Select the psalm for your liturgical celebration"
            category="psalm"
            readings={getReadingsForCategory('psalm')}
            selectedReading={wizardData.readings.psalm}
            lector={wizardData.lectors.psalm}
            printOption={wizardData.printOptions.psalm}
            onReadingChange={(reading) => updateWizardData({ 
              readings: { ...wizardData.readings, psalm: reading } 
            })}
            onLectorChange={(lector) => updateWizardData({ 
              lectors: { ...wizardData.lectors, psalm: lector } 
            })}
            onPrintChange={(print) => updateWizardData({ 
              printOptions: { ...wizardData.printOptions, psalm: print } 
            })}
          />
        )
      case 4:
        return <SecondReadingGospelStep wizardData={wizardData} updateWizardData={updateWizardData} getReadingsForCategory={getReadingsForCategory} />
      case 5:
        return <ReviewSaveStep wizardData={wizardData} availableReadings={availableReadings} saving={saving} onSave={handleSave} onPrint={handlePrint} />
      default:
        return null
    }
  }

  return (
    <Wizard
      title="Readings Wizard"
      description="Create a complete liturgical reading plan step by step"
      steps={STEPS}
      maxWidth="6xl"
      loading={loading}
      error={null}
      loadingMessage="Loading readings..."
      onComplete={handleComplete}
      completeButtonText="Complete"
      showStepPreview={true}
      allowPreviousNavigation={true}
      disableNext={(currentStep) => currentStep === 1 && !wizardData.title.trim()}
      renderStepContent={renderStepContent}
    />
  )
}

// Event Details Step Component
interface EventDetailsStepProps {
  wizardData: WizardData
  updateWizardData: (updates: Partial<WizardData>) => void
}

function EventDetailsStep({ wizardData, updateWizardData }: EventDetailsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
        <p className="text-muted-foreground">
          Tell us about the liturgical event
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium">Event Title *</Label>
          <Input
            id="title"
            value={wizardData.title}
            onChange={(e) => updateWizardData({ title: e.target.value })}
            placeholder="e.g., Sunday Mass, Wedding Ceremony, Funeral Service"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
          <Textarea
            id="description"
            value={wizardData.description}
            onChange={(e) => updateWizardData({ description: e.target.value })}
            placeholder="Additional details about the event..."
            rows={3}
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Second Reading & Gospel Step Component
interface SecondReadingGospelStepProps {
  wizardData: WizardData
  updateWizardData: (updates: Partial<WizardData>) => void
  getReadingsForCategory: (category: keyof typeof READING_CATEGORIES) => IndividualReading[]
}

function SecondReadingGospelStep({ wizardData, updateWizardData, getReadingsForCategory }: SecondReadingGospelStepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Second Reading</CardTitle>
          <p className="text-muted-foreground">Optional second reading</p>
        </CardHeader>
        <CardContent>
          <ReadingSelectionContent
            readings={getReadingsForCategory('second')}
            selectedReading={wizardData.readings.second}
            lector={wizardData.lectors.second}
            printOption={wizardData.printOptions.second}
            onReadingChange={(reading) => updateWizardData({ 
              readings: { ...wizardData.readings, second: reading } 
            })}
            onLectorChange={(lector) => updateWizardData({ 
              lectors: { ...wizardData.lectors, second: lector } 
            })}
            onPrintChange={(print) => updateWizardData({ 
              printOptions: { ...wizardData.printOptions, second: print } 
            })}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Gospel</CardTitle>
          <p className="text-muted-foreground">Gospel reading</p>
        </CardHeader>
        <CardContent>
          <ReadingSelectionContent
            readings={getReadingsForCategory('gospel')}
            selectedReading={wizardData.readings.gospel}
            lector={wizardData.lectors.gospel}
            printOption={wizardData.printOptions.gospel}
            onReadingChange={(reading) => updateWizardData({ 
              readings: { ...wizardData.readings, gospel: reading } 
            })}
            onLectorChange={(lector) => updateWizardData({ 
              lectors: { ...wizardData.lectors, gospel: lector } 
            })}
            onPrintChange={(print) => updateWizardData({ 
              printOptions: { ...wizardData.printOptions, gospel: print } 
            })}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Review & Save Step Component
interface ReviewSaveStepProps {
  wizardData: WizardData
  availableReadings: IndividualReading[]
  saving: boolean
  onSave: () => void
  onPrint: () => void
}

function ReviewSaveStep({ wizardData, availableReadings, saving, onSave, onPrint }: ReviewSaveStepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div><strong>Title:</strong> {wizardData.title}</div>
            {wizardData.description && (
              <div><strong>Description:</strong> {wizardData.description}</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Selected Readings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(wizardData.readings).map(([type, readingId]) => {
              if (!readingId) return null
              const reading = availableReadings.find(r => r.id === readingId)
              const lector = wizardData.lectors[type as keyof typeof wizardData.lectors]
              
              return (
                <div key={type} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium capitalize">{type} Reading</h4>
                      <p className="text-sm text-muted-foreground">{reading?.title}</p>
                      <p className="text-xs text-muted-foreground">{reading?.pericope}</p>
                      {lector && (
                        <p className="text-xs text-muted-foreground mt-1">Lector: {lector}</p>
                      )}
                    </div>
                    <Badge variant={wizardData.printOptions[type as keyof typeof wizardData.printOptions] ? "default" : "secondary"}>
                      {wizardData.printOptions[type as keyof typeof wizardData.printOptions] ? "Print" : "Skip"}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={onSave} 
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Readings'}
            </button>
            
            <button 
              onClick={onPrint} 
              disabled={!Object.values(wizardData.readings).some(Boolean)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Readings
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


// Reading Selection Component
interface ReadingSelectionStepProps {
  title: string
  description: string
  category: string
  readings: IndividualReading[]
  selectedReading?: string
  lector?: string
  printOption: boolean
  onReadingChange: (reading?: string) => void
  onLectorChange: (lector: string) => void
  onPrintChange: (print: boolean) => void
}

function ReadingSelectionStep({
  title,
  description,
  readings,
  selectedReading,
  lector,
  printOption,
  onReadingChange,
  onLectorChange,
  onPrintChange
}: ReadingSelectionStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <ReadingSelectionContent
          readings={readings}
          selectedReading={selectedReading}
          lector={lector}
          printOption={printOption}
          onReadingChange={onReadingChange}
          onLectorChange={onLectorChange}
          onPrintChange={onPrintChange}
        />
      </CardContent>
    </Card>
  )
}

// Reading Selection Content Component (without Card wrapper)
interface ReadingSelectionContentProps {
  readings: IndividualReading[]
  selectedReading?: string
  lector?: string
  printOption: boolean
  onReadingChange: (reading?: string) => void
  onLectorChange: (lector: string) => void
  onPrintChange: (print: boolean) => void
}

function ReadingSelectionContent({
  readings,
  selectedReading,
  lector,
  printOption,
  onReadingChange,
  onLectorChange,
  onPrintChange
}: ReadingSelectionContentProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Select Reading</Label>
        <Select value={selectedReading || ""} onValueChange={(value) => onReadingChange(value || undefined)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Choose a reading (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Skip this reading</SelectItem>
            {readings.map((reading) => (
              <SelectItem key={reading.id} value={reading.id}>
                <div>
                  <div className="font-medium">{reading.title}</div>
                  <div className="text-xs text-muted-foreground">{reading.pericope}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedReading && (
        <>
          <div>
            <Label htmlFor="lector" className="text-sm font-medium">Lector Name (Optional)</Label>
            <Input
              id="lector"
              value={lector || ''}
              onChange={(e) => onLectorChange(e.target.value)}
              placeholder="Enter lector's name"
              className="mt-1"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="print"
              checked={printOption}
              onCheckedChange={(checked) => onPrintChange(!!checked)}
            />
            <Label htmlFor="print" className="text-sm font-medium">
              Include in print version
            </Label>
          </div>
        </>
      )}
    </div>
  )
}