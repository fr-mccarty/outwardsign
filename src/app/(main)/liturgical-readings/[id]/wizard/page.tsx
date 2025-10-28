'use client'

import { useEffect, useState, Suspense, useCallback, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Save, Printer, BookOpen, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { useRouter } from 'next/navigation'
import { getIndividualReadings } from '@/lib/actions/readings'
import { getLiturgicalReading, updateLiturgicalReading } from '@/lib/actions/liturgical-readings'
import type { IndividualReading } from '@/lib/actions/readings'
import { Wizard, type WizardStep as UnifiedWizardStep } from '@/components/wizard'
import { ReadingPickerModal } from '@/components/reading-picker-modal'
import { toast } from 'sonner'

interface WizardData {
  id: string
  title: string
  description?: string
  date?: Date
  first_reading_id?: string
  first_reading_lector?: string
  psalm_id?: string
  psalm_lector?: string
  second_reading_id?: string
  second_reading_lector?: string
  gospel_reading_id?: string
  gospel_lector?: string
  sung_petitions?: boolean
}


interface PageProps {
  params: Promise<{ id: string }>
}

function EditLiturgicalReadingWizard({ params }: PageProps) {
  const [wizardData, setWizardData] = useState<WizardData>({
    id: '',
    title: '',
    description: '',
    date: undefined,
    sung_petitions: false
  })
  const [availableReadings, setAvailableReadings] = useState<IndividualReading[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [readingId, setReadingId] = useState<string>('')
  const [openModal, setOpenModal] = useState<'first' | 'psalm' | 'second' | 'gospel' | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialDataRef = useRef<string>('')
  const { setBreadcrumbs } = useBreadcrumbs()
  const router = useRouter()

  const wizardSteps: UnifiedWizardStep[] = [
    { id: 1, title: "Basic Info", description: "Name, description, and date" },
    { id: 2, title: "First Reading", description: "Select first reading and lector" },
    { id: 3, title: "Psalm", description: "Select responsorial psalm and lector" },
    { id: 4, title: "Second Reading", description: "Select second reading and lector" },
    { id: 5, title: "Gospel", description: "Select gospel reading and lector" },
    { id: 6, title: "Review", description: "Final review and print" }
  ]

  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params
        setReadingId(id)
        
        // Load available readings
        const readings = await getIndividualReadings()
        setAvailableReadings(readings)
        
        // Load actual liturgical reading data
        try {
          const liturgicalReading = await getLiturgicalReading(id)
          if (liturgicalReading) {
            const loadedData = {
              id: liturgicalReading.id,
              title: liturgicalReading.title || '',
              description: liturgicalReading.description || '',
              date: liturgicalReading.date ? new Date(liturgicalReading.date) : undefined,
              first_reading_id: liturgicalReading.first_reading_id || undefined,
              first_reading_lector: liturgicalReading.first_reading_lector || undefined,
              psalm_id: liturgicalReading.psalm_id || undefined,
              psalm_lector: liturgicalReading.psalm_lector || undefined,
              second_reading_id: liturgicalReading.second_reading_id || undefined,
              second_reading_lector: liturgicalReading.second_reading_lector || undefined,
              gospel_reading_id: liturgicalReading.gospel_reading_id || undefined,
              gospel_lector: liturgicalReading.gospel_lector || undefined,
              sung_petitions: liturgicalReading.sung_petitions || false
            }
            
            setWizardData(loadedData)
            // Store initial data baseline for change detection
            initialDataRef.current = JSON.stringify(loadedData)
            setLastSaved(new Date())
            
            setBreadcrumbs([
              { label: "Dashboard", href: "/dashboard" },
              { label: "Liturgical Readings", href: "/liturgical-readings" },
              { label: liturgicalReading.title || 'Untitled', href: `/liturgical-readings/${id}` },
              { label: "Wizard" }
            ])
          } else {
            // New reading - set basic data
            setWizardData(prev => ({ ...prev, id }))
            setBreadcrumbs([
              { label: "Dashboard", href: "/dashboard" },
              { label: "Liturgical Readings", href: "/liturgical-readings" },
              { label: "New Reading", href: `/liturgical-readings/${id}` },
              { label: "Wizard" }
            ])
          }
        } catch (error) {
          console.error('Failed to load liturgical reading:', error)
          // Continue with empty data for new reading
          setWizardData(prev => ({ ...prev, id }))
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        router.push('/liturgical-readings')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params, setBreadcrumbs, router])

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])


  // Auto-save function
  const autoSave = useCallback(async (data: WizardData) => {
    if (!data.title.trim() || !data.id) return // Don't auto-save if no title or ID
    
    setAutoSaving(true)
    try {
      await updateLiturgicalReading(data.id, {
        title: data.title,
        description: data.description,
        date: data.date ? data.date.toISOString().split('T')[0] : undefined,
        first_reading_id: data.first_reading_id,
        first_reading_lector: data.first_reading_lector,
        psalm_id: data.psalm_id,
        psalm_lector: data.psalm_lector,
        second_reading_id: data.second_reading_id,
        second_reading_lector: data.second_reading_lector,
        gospel_reading_id: data.gospel_reading_id,
        gospel_lector: data.gospel_lector,
        sung_petitions: data.sung_petitions || false
      })
      
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      // Store current data as the new baseline
      initialDataRef.current = JSON.stringify(data)
    } catch (error) {
      console.error('Auto-save failed:', error)
      // Don't show error toast for auto-save failures to avoid annoying users
    } finally {
      setAutoSaving(false)
    }
  }, [])

  const updateWizardData = useCallback((updates: Partial<WizardData>) => {
    setWizardData(prev => {
      const newData = { ...prev, ...updates }
      
      // Check if data has actually changed
      const newDataString = JSON.stringify(newData)
      if (newDataString !== initialDataRef.current) {
        setHasUnsavedChanges(true)
        
        // Clear existing timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current)
        }
        
        // Set new timeout for auto-save (2 seconds after last change)
        autoSaveTimeoutRef.current = setTimeout(() => {
          autoSave(newData)
        }, 2000)
      }
      
      return newData
    })
  }, [autoSave])

  const getSelectedReading = (readingId?: string): IndividualReading | null => {
    if (!readingId) return null
    return availableReadings.find(r => r.id === readingId) || null
  }

  const handleReadingSelect = (type: 'first' | 'psalm' | 'second' | 'gospel', reading: IndividualReading | null) => {
    const fieldMap = {
      first: 'first_reading_id',
      psalm: 'psalm_id',
      second: 'second_reading_id',
      gospel: 'gospel_reading_id'
    } as const

    updateWizardData({ [fieldMap[type]]: reading?.id })
    setOpenModal(null)
  }

  const handleSave = async () => {
    if (!wizardData.title.trim()) {
      toast.error('Please enter a title for your reading collection.')
      return
    }

    setSaving(true)
    try {
      await updateLiturgicalReading(wizardData.id, {
        title: wizardData.title,
        description: wizardData.description,
        date: wizardData.date ? wizardData.date.toISOString().split('T')[0] : undefined,
        first_reading_id: wizardData.first_reading_id,
        first_reading_lector: wizardData.first_reading_lector,
        psalm_id: wizardData.psalm_id,
        psalm_lector: wizardData.psalm_lector,
        second_reading_id: wizardData.second_reading_id,
        second_reading_lector: wizardData.second_reading_lector,
        gospel_reading_id: wizardData.gospel_reading_id,
        gospel_lector: wizardData.gospel_lector,
        sung_petitions: wizardData.sung_petitions || false
      })
      
      // Update baseline and save status
      initialDataRef.current = JSON.stringify(wizardData)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      
      toast.success('Reading collection saved successfully!')
      router.push(`/liturgical-readings/${readingId}`)
    } catch (error) {
      console.error('Failed to save reading collection:', error)
      toast.error('Failed to save reading collection. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = () => {
    router.push(`/liturgical-readings/${readingId}`)
  }

  const renderStepContent = (currentStep: number) => {
    switch (currentStep) {
      case 1: // Basic Info
        return (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter the basic details for your liturgical reading collection
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                <Input
                  id="title"
                  value={wizardData.title}
                  onChange={(e) => updateWizardData({ title: e.target.value })}
                  placeholder="e.g., Sunday Mass - 3rd Sunday of Advent"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={wizardData.description || ''}
                  onChange={(e) => updateWizardData({ description: e.target.value })}
                  placeholder="Additional details about this reading collection..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !wizardData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {wizardData.date ? format(wizardData.date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={wizardData.date}
                      onSelect={(date) => updateWizardData({ date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        )

      case 2: // First Reading
        return (
          <Card>
            <CardHeader>
              <CardTitle>First Reading</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose a first reading and optionally assign a lector
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Select First Reading</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateWizardData({ first_reading_id: undefined })
                    }}
                    className="text-muted-foreground hover:text-foreground border-dashed"
                  >
                    Skip this reading
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => setOpenModal('first')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <BookOpen className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      {wizardData.first_reading_id ? (
                        <div>
                          <div className="font-medium">
                            {getSelectedReading(wizardData.first_reading_id)?.pericope || 'Unknown Reading'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getSelectedReading(wizardData.first_reading_id)?.category}
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">Choose a first reading...</div>
                      )}
                    </div>
                    <Plus className="h-4 w-4 flex-shrink-0" />
                  </div>
                </Button>
              </div>
              
              <div>
                <Label htmlFor="first-lector" className="text-sm font-medium">Lector Name (Optional)</Label>
                <Input
                  id="first-lector"
                  value={wizardData.first_reading_lector || ''}
                  onChange={(e) => updateWizardData({ first_reading_lector: e.target.value })}
                  placeholder="Enter lector name"
                  className="mt-1"
                />
              </div>
              
              {wizardData.first_reading_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Reading</h4>
                  <div className="text-sm text-blue-800">
                    {(() => {
                      const reading = getSelectedReading(wizardData.first_reading_id)
                      return reading ? (
                        <div>
                          <div className="font-medium">{reading.pericope}</div>
                          <div className="mt-1 text-xs">{reading.introduction || reading.reading_text?.substring(0, 100) + '...'}</div>
                        </div>
                      ) : 'Reading not found'
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 3: // Psalm
        return (
          <Card>
            <CardHeader>
              <CardTitle>Responsorial Psalm</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose a responsorial psalm and optionally assign a lector
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Select Responsorial Psalm</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateWizardData({ psalm_id: undefined })
                    }}
                    className="text-muted-foreground hover:text-foreground border-dashed"
                  >
                    Skip this reading
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => setOpenModal('psalm')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <BookOpen className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      {wizardData.psalm_id ? (
                        <div>
                          <div className="font-medium">
                            {getSelectedReading(wizardData.psalm_id)?.pericope || 'Unknown Psalm'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getSelectedReading(wizardData.psalm_id)?.category}
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">Choose a psalm...</div>
                      )}
                    </div>
                    <Plus className="h-4 w-4 flex-shrink-0" />
                  </div>
                </Button>
              </div>
              
              <div>
                <Label htmlFor="psalm-lector" className="text-sm font-medium">Lector Name (Optional)</Label>
                <Input
                  id="psalm-lector"
                  value={wizardData.psalm_lector || ''}
                  onChange={(e) => updateWizardData({ psalm_lector: e.target.value })}
                  placeholder="Enter lector name"
                  className="mt-1"
                />
              </div>
              
              {wizardData.psalm_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Psalm</h4>
                  <div className="text-sm text-blue-800">
                    {(() => {
                      const reading = getSelectedReading(wizardData.psalm_id)
                      return reading ? (
                        <div>
                          <div className="font-medium">{reading.pericope}</div>
                          <div className="mt-1 text-xs">{reading.introduction || reading.reading_text?.substring(0, 100) + '...'}</div>
                        </div>
                      ) : 'Psalm not found'
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 4: // Second Reading
        return (
          <Card>
            <CardHeader>
              <CardTitle>Second Reading</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose a second reading and optionally assign a lector
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Select Second Reading</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateWizardData({ second_reading_id: undefined })
                    }}
                    className="text-muted-foreground hover:text-foreground border-dashed"
                  >
                    Skip this reading
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => setOpenModal('second')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <BookOpen className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      {wizardData.second_reading_id ? (
                        <div>
                          <div className="font-medium">
                            {getSelectedReading(wizardData.second_reading_id)?.pericope || 'Unknown Reading'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getSelectedReading(wizardData.second_reading_id)?.category}
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">Choose a second reading...</div>
                      )}
                    </div>
                    <Plus className="h-4 w-4 flex-shrink-0" />
                  </div>
                </Button>
              </div>
              
              <div>
                <Label htmlFor="second-lector" className="text-sm font-medium">Lector Name (Optional)</Label>
                <Input
                  id="second-lector"
                  value={wizardData.second_reading_lector || ''}
                  onChange={(e) => updateWizardData({ second_reading_lector: e.target.value })}
                  placeholder="Enter lector name"
                  className="mt-1"
                />
              </div>
              
              {wizardData.second_reading_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Reading</h4>
                  <div className="text-sm text-blue-800">
                    {(() => {
                      const reading = getSelectedReading(wizardData.second_reading_id)
                      return reading ? (
                        <div>
                          <div className="font-medium">{reading.pericope}</div>
                          <div className="mt-1 text-xs">{reading.introduction || reading.reading_text?.substring(0, 100) + '...'}</div>
                        </div>
                      ) : 'Reading not found'
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 5: // Gospel
        return (
          <Card>
            <CardHeader>
              <CardTitle>Gospel Reading</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose the gospel reading and optionally assign a lector
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Select Gospel Reading</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateWizardData({ gospel_reading_id: undefined })
                    }}
                    className="text-muted-foreground hover:text-foreground border-dashed"
                  >
                    Skip this reading
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => setOpenModal('gospel')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <BookOpen className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      {wizardData.gospel_reading_id ? (
                        <div>
                          <div className="font-medium">
                            {getSelectedReading(wizardData.gospel_reading_id)?.pericope || 'Unknown Gospel'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getSelectedReading(wizardData.gospel_reading_id)?.category}
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">Choose a gospel reading...</div>
                      )}
                    </div>
                    <Plus className="h-4 w-4 flex-shrink-0" />
                  </div>
                </Button>
              </div>
              
              <div>
                <Label htmlFor="gospel-lector" className="text-sm font-medium">Lector Name (Optional)</Label>
                <Input
                  id="gospel-lector"
                  value={wizardData.gospel_lector || ''}
                  onChange={(e) => updateWizardData({ gospel_lector: e.target.value })}
                  placeholder="Enter lector name"
                  className="mt-1"
                />
              </div>
              
              {wizardData.gospel_reading_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Gospel</h4>
                  <div className="text-sm text-blue-800">
                    {(() => {
                      const reading = getSelectedReading(wizardData.gospel_reading_id)
                      return reading ? (
                        <div>
                          <div className="font-medium">{reading.pericope}</div>
                          <div className="mt-1 text-xs">{reading.introduction || reading.reading_text?.substring(0, 100) + '...'}</div>
                        </div>
                      ) : 'Gospel not found'
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 6: // Review
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review & Finalize</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review your liturgical reading collection and make final edits
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="review-title" className="text-sm font-medium">Title</Label>
                    <Input
                      id="review-title"
                      value={wizardData.title}
                      onChange={(e) => updateWizardData({ title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !wizardData.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {wizardData.date ? format(wizardData.date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={wizardData.date}
                          onSelect={(date) => updateWizardData({ date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="review-description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="review-description"
                    value={wizardData.description || ''}
                    onChange={(e) => updateWizardData({ description: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'First Reading', field: 'first_reading_id', lectorField: 'first_reading_lector' },
                    { label: 'Responsorial Psalm', field: 'psalm_id', lectorField: 'psalm_lector' },
                    { label: 'Second Reading', field: 'second_reading_id', lectorField: 'second_reading_lector' },
                    { label: 'Gospel Reading', field: 'gospel_reading_id', lectorField: 'gospel_lector' }
                  ].map(({ label, field, lectorField }) => {
                    const readingId = wizardData[field as keyof WizardData] as string
                    const lector = wizardData[lectorField as keyof WizardData] as string
                    const reading = readingId ? availableReadings.find(r => r.id === readingId) : null
                    
                    return (
                      <div key={field} className="space-y-2">
                        <Label className="text-sm font-medium">{label}</Label>
                        <div className="border rounded-lg p-3 bg-gray-50">
                          {reading ? (
                            <div>
                              <div className="font-medium text-sm">{reading.pericope}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {reading.category}
                              </div>
                              {lector && (
                                <div className="text-xs text-blue-600 mt-1">Lector: {lector}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No reading selected</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Auto-save status indicator */}
                <div className="flex items-center justify-center py-2">
                  {autoSaving ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Auto-saving...
                    </div>
                  ) : hasUnsavedChanges ? (
                    <div className="flex items-center text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Unsaved changes
                    </div>
                  ) : lastSaved ? (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Saved {lastSaved.toLocaleTimeString()}
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || !wizardData.title.trim()}
                    className="flex-1"
                    size="lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Reading Collection'}
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg"
                  >
                    <Link href={`/print/liturgical-readings/${readingId}`}>
                      <Printer className="h-4 w-4 mr-2" />
                      Preview & Print
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return <div>Invalid step</div>
    }
  }

  return (
    <>
      <Wizard
        title="Liturgical Readings Wizard"
        description="Create your liturgical reading collection step by step"
        steps={wizardSteps}
        maxWidth="4xl"
        loading={loading}
        loadingMessage="Loading liturgical readings wizard..."
        onComplete={handleComplete}
        completeButtonText="Complete & View"
        showStepPreview={true}
        allowPreviousNavigation={true}
        disableNext={(currentStep) => currentStep === 1 && !wizardData.title.trim()}
        renderStepContent={renderStepContent}
      />

      {/* Reading Selection Modals */}
      <ReadingPickerModal
        isOpen={openModal === 'first'}
        onClose={() => setOpenModal(null)}
        onSelect={(reading) => handleReadingSelect('first', reading)}
        selectedReading={getSelectedReading(wizardData.first_reading_id)}
        readings={availableReadings}
        title="Select First Reading"
        readingType="first"
      />

      <ReadingPickerModal
        isOpen={openModal === 'psalm'}
        onClose={() => setOpenModal(null)}
        onSelect={(reading) => handleReadingSelect('psalm', reading)}
        selectedReading={getSelectedReading(wizardData.psalm_id)}
        readings={availableReadings}
        title="Select Responsorial Psalm"
        readingType="psalm"
      />

      <ReadingPickerModal
        isOpen={openModal === 'second'}
        onClose={() => setOpenModal(null)}
        onSelect={(reading) => handleReadingSelect('second', reading)}
        selectedReading={getSelectedReading(wizardData.second_reading_id)}
        readings={availableReadings}
        title="Select Second Reading"
        readingType="second"
      />

      <ReadingPickerModal
        isOpen={openModal === 'gospel'}
        onClose={() => setOpenModal(null)}
        onSelect={(reading) => handleReadingSelect('gospel', reading)}
        selectedReading={getSelectedReading(wizardData.gospel_reading_id)}
        readings={availableReadings}
        title="Select Gospel Reading"
        readingType="gospel"
      />
    </>
  )
}

export default function EditLiturgicalReadingPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="space-y-8">Loading wizard...</div>}>
      <EditLiturgicalReadingWizard params={params} />
    </Suspense>
  )
}