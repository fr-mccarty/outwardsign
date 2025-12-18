'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Wizard } from '@/components/wizard/Wizard'
import { WizardStepHeader } from '@/components/wizard/WizardStepHeader'
import { Step1DateRange } from './steps/step-1-date-range'
import { Step2SchedulePattern, type MassScheduleEntry } from './steps/step-2-schedule-pattern'
import { Step3LiturgicalEvents } from './steps/step-3-liturgical-events'
import { Step4ProposedSchedule, generateProposedMasses, type ProposedMass } from './steps/step-4-proposed-schedule'
import { Step5InteractivePreview } from './steps/step-5-interactive-preview'
import { Step6WorkloadReview } from './steps/step-6-workload-review'
import { Step7Confirmation } from './steps/step-7-confirmation'
import { MassTimesTemplateWithItems } from '@/lib/actions/mass-times-templates'
import { MassRoleWithCount } from '@/lib/actions/mass-roles'
import { toast } from 'sonner'
import { scheduleMasses, type ScheduleMassesResult } from '@/lib/actions/mass-scheduling'
import { getDayOfWeekNumber } from '@/lib/utils/formatters'
import { getGlobalLiturgicalEvents } from '@/lib/actions/global-liturgical-events'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import type { EventType } from '@/lib/types'

// Role definition from event_types.role_definitions
interface RoleDefinition {
  id: string
  name: string
  required: boolean
  count?: number
}

interface ScheduleMassesClientProps {
  massEventTypes: EventType[]
  massTimesTemplates: MassTimesTemplateWithItems[]
  massRolesWithCounts: MassRoleWithCount[]
}

const STORAGE_KEY = 'mass-scheduler-wizard-state-v2'

interface WizardState {
  startDate: string
  endDate: string
  schedule: MassScheduleEntry[]
  selectedMassTimesTemplateIds: string[]
  selectedMassEventTypeId: string
  selectedLiturgicalEventIds: string[]
  liturgicalEvents: Array<{ id: string; date: string; name: string }>
  proposedMasses: ProposedMass[]
  algorithmOptions: {
    balanceWorkload: boolean
    respectBlackoutDates: boolean
    allowManualAdjustments: boolean
  }
  currentWizardStep: number
  timestamp: number
}

export function ScheduleMassesClient({ massEventTypes, massTimesTemplates, massRolesWithCounts }: ScheduleMassesClientProps) {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)

  // Step 1: Date Range
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Step 2: Schedule Pattern (Mass Times Templates)
  const [schedule, setSchedule] = useState<MassScheduleEntry[]>([])
  const [selectedMassTimesTemplateIds, setSelectedMassTimesTemplateIds] = useState<string[]>([])

  // Mass Event Type (auto-selected, used for role definitions)
  const [selectedMassEventTypeId, setSelectedMassEventTypeId] = useState<string>(
    massEventTypes[0]?.id || ''
  )

  // Step 3: Liturgical Events Selection (was Step 4)
  const [selectedLiturgicalEventIds, setSelectedLiturgicalEventIds] = useState<string[]>([])
  const [liturgicalEvents, setLiturgicalEvents] = useState<Array<{ id: string; date: string; name: string }>>([])

  // Step 4: Proposed Schedule (was Step 5)
  const [proposedMasses, setProposedMasses] = useState<ProposedMass[]>([])

  // Algorithm Options
  const [algorithmOptions, setAlgorithmOptions] = useState({
    balanceWorkload: true,
    respectBlackoutDates: true,
    allowManualAdjustments: true,
  })

  // Wizard state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [schedulingResult, setSchedulingResult] = useState<ScheduleMassesResult | null>(null)
  const [schedulingError, setSchedulingError] = useState<string | null>(null)
  const [currentWizardStep, setCurrentWizardStep] = useState(1)

  // Get selected event type and its role definitions
  const selectedEventType = massEventTypes.find(et => et.id === selectedMassEventTypeId)
  const roleDefinitions: RoleDefinition[] = useMemo(() =>
    (selectedEventType?.role_definitions as { roles?: RoleDefinition[] })?.roles || [],
    [selectedEventType?.role_definitions]
  )

  // Debug logging for proposedMasses changes
  useEffect(() => {
    const totalAssignments = proposedMasses.reduce((sum, m) => sum + (m.assignments?.length || 0), 0)
    const assignedCount = proposedMasses.reduce((sum, m) => sum + (m.assignments?.filter(a => a.personId).length || 0), 0)
    console.log('[ProposedMasses State] Step:', currentWizardStep, 'Total masses:', proposedMasses.length, 'Total assignments:', totalAssignments, 'Assigned:', assignedCount)
  }, [proposedMasses, currentWizardStep])

  // Restore state from localStorage on mount
  useEffect(() => {
    const restoreState = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const state: WizardState = JSON.parse(saved)
          // Only restore if saved within last 24 hours
          const hoursSinceLastSave = (Date.now() - state.timestamp) / (1000 * 60 * 60)
          if (hoursSinceLastSave < 24) {
            setStartDate(state.startDate)
            setEndDate(state.endDate)
            setSchedule(state.schedule)
            setSelectedMassTimesTemplateIds(state.selectedMassTimesTemplateIds)
            setSelectedMassEventTypeId(state.selectedMassEventTypeId || massEventTypes[0]?.id || '')
            setSelectedLiturgicalEventIds(state.selectedLiturgicalEventIds)
            setLiturgicalEvents(state.liturgicalEvents || [])
            setProposedMasses(state.proposedMasses)
            setAlgorithmOptions(state.algorithmOptions)
            setCurrentWizardStep(state.currentWizardStep)

            // Show toast with action to start fresh
            toast.success('Previous wizard progress restored', {
              duration: 5000,
              action: {
                label: 'Start Fresh',
                onClick: () => {
                  // Reset to initial state
                  setStartDate('')
                  setEndDate('')
                  setSchedule([])
                  setSelectedMassTimesTemplateIds([])
                  setSelectedMassEventTypeId(massEventTypes[0]?.id || '')
                  setSelectedLiturgicalEventIds([])
                  setLiturgicalEvents([])
                  setProposedMasses([])
                  setAlgorithmOptions({
                    balanceWorkload: true,
                    respectBlackoutDates: true,
                    allowManualAdjustments: true,
                  })
                  setCurrentWizardStep(1)
                  setSchedulingResult(null)
                  localStorage.removeItem(STORAGE_KEY)
                  toast.success('Started fresh wizard')
                }
              }
            })
          } else {
            // Clear old data
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      } catch (error) {
        console.error('Failed to restore wizard state:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
      setIsHydrated(true)
    }

    restoreState()
  }, [massEventTypes])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return // Don't save during initial hydration

    const state: WizardState = {
      startDate,
      endDate,
      schedule,
      selectedMassTimesTemplateIds,
      selectedMassEventTypeId,
      selectedLiturgicalEventIds,
      liturgicalEvents,
      proposedMasses,
      algorithmOptions,
      currentWizardStep,
      timestamp: Date.now()
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save wizard state:', error)
    }
  }, [
    isHydrated,
    startDate,
    endDate,
    schedule,
    selectedMassTimesTemplateIds,
    selectedMassEventTypeId,
    selectedLiturgicalEventIds,
    liturgicalEvents,
    proposedMasses,
    algorithmOptions,
    currentWizardStep
  ])

  // Clear localStorage when wizard is completed
  const clearSavedState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear wizard state:', error)
    }
  }, [])

  // Reset wizard to initial state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _resetWizard = useCallback(() => {
    setStartDate('')
    setEndDate('')
    setSchedule([])
    setSelectedMassTimesTemplateIds([])
    setSelectedMassEventTypeId(massEventTypes[0]?.id || '')
    setSelectedLiturgicalEventIds([])
    setLiturgicalEvents([])
    setProposedMasses([])
    setAlgorithmOptions({
      balanceWorkload: true,
      respectBlackoutDates: true,
      allowManualAdjustments: true,
    })
    setCurrentWizardStep(1)
    setSchedulingResult(null)
    clearSavedState()
    toast.success('Wizard progress cleared')
  }, [clearSavedState, massEventTypes])

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (field === 'startDate') {
      setStartDate(value)
    } else {
      setEndDate(value)
    }
  }

  // Algorithm options change handler
  const _handleAlgorithmOptionChange = (
    option: keyof typeof algorithmOptions,
    value: boolean
  ) => {
    setAlgorithmOptions((prev) => ({ ...prev, [option]: value }))
  }
  void _handleAlgorithmOptionChange


  // Calculate total mass count based on selected templates
  const calculateTotalMasses = () => {
    if (!startDate || !endDate || selectedMassTimesTemplateIds.length === 0) return 0

    const start = new Date(startDate)
    const end = new Date(endDate)
    let count = 0

    selectedMassTimesTemplateIds.forEach(templateId => {
      const template = massTimesTemplates.find(t => t.id === templateId)
      if (!template) return

      const dayNumber = getDayOfWeekNumber(template.day_of_week)
      if (dayNumber === null) return

      const currentDate = new Date(start)
      while (currentDate <= end) {
        if (currentDate.getDay() === dayNumber) {
          count++
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    return count
  }

  // Use proposedMasses count if available, otherwise calculate from templates
  void (proposedMasses.length > 0
    ? proposedMasses.filter(m => m.isIncluded).length
    : calculateTotalMasses())

  // Generate proposed masses when dependencies change
  const regenerateProposedMasses = useCallback(async () => {
    // Get role assignments from event type role definitions
    const roleAssignments: Array<{ roleId: string; roleName: string }> = []

    for (const roleDef of roleDefinitions) {
      const count = roleDef.count || 1
      for (let i = 0; i < count; i++) {
        roleAssignments.push({
          roleId: roleDef.id,
          roleName: roleDef.name
        })
      }
    }

    // Fetch liturgical events if we have selected event IDs
    let liturgicalEventsData: Array<{ id: string; date: string; name: string; color?: string[]; grade?: number; grade_abbr?: string; type?: string }> = []
    if (startDate && endDate && selectedLiturgicalEventIds.length > 0) {
      try {
        const events = await getGlobalLiturgicalEvents(startDate, endDate)
        liturgicalEventsData = events
          .filter(e => selectedLiturgicalEventIds.includes(e.id))
          .map(e => ({
            id: e.id,
            date: e.date,
            name: e.event_data.name,
            color: e.event_data.color,
            grade: e.event_data.grade,
            grade_abbr: e.event_data.grade_abbr,
            type: e.event_data.type
          }))
        setLiturgicalEvents(liturgicalEventsData)
      } catch (error) {
        console.error('Failed to fetch liturgical events:', error)
      }
    }

    const masses = generateProposedMasses(
      startDate,
      endDate,
      massTimesTemplates,
      selectedMassTimesTemplateIds,
      liturgicalEventsData,
      roleAssignments
    )
    setProposedMasses(masses)
  }, [startDate, endDate, massTimesTemplates, selectedMassTimesTemplateIds, selectedLiturgicalEventIds, roleDefinitions])

  // Regenerate when entering proposed schedule step or when key inputs change
  // BUT NOT when on step 5+ (where assignments have been made)
  useEffect(() => {
    if (currentWizardStep < 5 && startDate && endDate && selectedMassTimesTemplateIds.length > 0 && roleDefinitions.length > 0) {
      regenerateProposedMasses()
    }
  }, [currentWizardStep, startDate, endDate, selectedMassTimesTemplateIds, roleDefinitions, regenerateProposedMasses])

  const handleComplete = useCallback(async () => {
    if (!selectedMassEventTypeId) {
      toast.error('No mass event type available')
      return
    }

    if (selectedLiturgicalEventIds.length === 0) {
      toast.error('Please select at least one liturgical event')
      return
    }

    // Validate that we have proposed masses
    const massesToCreate = proposedMasses.filter(m => m.isIncluded)
    if (massesToCreate.length === 0) {
      toast.error('No masses selected to create')
      return
    }

    setIsSubmitting(true)

    try {
      // Convert proposedMasses to the format expected by scheduleMasses
      const proposedMassesForScheduling = massesToCreate.map(mass => ({
        id: mass.id,
        date: mass.date,
        time: mass.time,
        liturgicalEventId: mass.liturgicalEventId,
        assignments: mass.assignments?.map(a => ({
          roleId: a.roleId,
          roleName: a.roleName,
          personId: a.personId,
          personName: a.personName
        }))
      }))

      const result = await scheduleMasses({
        startDate,
        endDate,
        schedule,
        eventTypeId: selectedMassEventTypeId,
        selectedLiturgicalEventIds,
        algorithmOptions,
        proposedMasses: proposedMassesForScheduling
      })

      toast.success(`Successfully created ${result.massesCreated} Masses`)

      // Store result and navigate to results if manual adjustments enabled
      setSchedulingResult(result)

      // Clear saved wizard state on successful completion
      clearSavedState()

      // Stay on Step 7 (already navigated by handleStepChange)
      setSchedulingError(null)
    } catch (error) {
      console.error('Failed to schedule masses:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule masses. Please try again.'
      setSchedulingError(errorMessage)
      toast.error(errorMessage)
      // Stay on step 7 to show the error
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedMassEventTypeId, selectedLiturgicalEventIds, proposedMasses, startDate, endDate, schedule, algorithmOptions, clearSavedState])

  // Step validation
  const isStep1Valid = () => {
    return startDate && endDate && new Date(endDate) >= new Date(startDate)
  }

  const isStep2Valid = () => {
    return selectedMassTimesTemplateIds.length > 0
  }

  const isStep3Valid = () => {
    return selectedLiturgicalEventIds.length > 0
  }

  const isStep4Valid = () => {
    return proposedMasses.filter(m => m.isIncluded).length > 0
  }

  const isStep5Valid = () => {
    return true // Assignment step is always valid
  }

  const isStep6Valid = () => {
    return true // Workload review step is always valid
  }

  const isStep7Valid = () => {
    return true // Confirmation step is always valid
  }

  const getDisableNext = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !isStep1Valid()
      case 2:
        return !isStep2Valid()
      case 3:
        return !isStep3Valid()
      case 4:
        return !isStep4Valid()
      case 5:
        return !isStep5Valid()
      case 6:
        return !isStep6Valid() || isSubmitting
      case 7:
        return !isStep7Valid()
      default:
        return false
    }
  }

  // Wizard steps - reduced from 8 to 7 by removing template selection
  const wizardSteps = [
    { id: 1, title: 'Date Range', description: 'Select scheduling period' },
    { id: 2, title: 'Mass Times', description: 'Select Mass times' },
    { id: 3, title: 'Liturgical Events', description: 'Select celebrations' },
    { id: 4, title: 'Proposed Schedule', description: 'Review and adjust' },
    { id: 5, title: 'Assign Ministers', description: 'Assign people to roles' },
    { id: 6, title: 'Workload Review', description: 'Review assignments' },
    { id: 7, title: 'Confirmation', description: 'Masses created' },
  ]

  const renderStepContent = (currentStep: number, _goToStep: (step: number) => void) => {
    void _goToStep
    switch (currentStep) {
      case 1:
        return (
          <Step1DateRange
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            massRolesWithCounts={massRolesWithCounts}
          />
        )
      case 2:
        return (
          <Step2SchedulePattern
            schedule={schedule}
            onChange={setSchedule}
            startDate={startDate}
            endDate={endDate}
            massTimesTemplates={massTimesTemplates}
            selectedTemplateIds={selectedMassTimesTemplateIds}
            onTemplateSelectionChange={setSelectedMassTimesTemplateIds}
          />
        )
      case 3:
        return (
          <Step3LiturgicalEvents
            startDate={startDate}
            endDate={endDate}
            selectedEventIds={selectedLiturgicalEventIds}
            onSelectionChange={setSelectedLiturgicalEventIds}
            massTimesTemplates={massTimesTemplates}
            selectedMassTimesTemplateIds={selectedMassTimesTemplateIds}
          />
        )
      case 4:
        return (
          <Step4ProposedSchedule
            startDate={startDate}
            endDate={endDate}
            massTimesTemplates={massTimesTemplates}
            selectedMassTimesTemplateIds={selectedMassTimesTemplateIds}
            proposedMasses={proposedMasses}
            onProposedMassesChange={setProposedMasses}
          />
        )
      case 5:
        return (
          <Step5InteractivePreview
            proposedMasses={proposedMasses}
            onProposedMassesChange={setProposedMasses}
            roleDefinitions={roleDefinitions}
          />
        )
      case 6:
        // Step 6: Show workload review BEFORE creating masses (uses proposedMasses)
        return (
          <Step6WorkloadReview
            startDate={startDate}
            endDate={endDate}
            proposedMasses={proposedMasses}
            massTimesTemplates={massTimesTemplates}
            selectedMassTimesTemplateIds={selectedMassTimesTemplateIds}
            roleDefinitions={roleDefinitions}
            onProposedMassesChange={setProposedMasses}
          />
        )
      case 7:
        // Step 7: Show loading, then confirmation AFTER creating masses
        if (isSubmitting) {
          // Show loading state while creating masses
          return (
            <div className="space-y-6">
              <WizardStepHeader
                icon={CheckCircle2}
                title="Creating Masses..."
                description="Please wait while we create your masses and assignments"
              />
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-xl font-semibold text-foreground">Creating masses and assigning ministers...</p>
                      <p className="text-sm text-muted-foreground">This may take a few moments. Please do not close this window.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        }

        if (schedulingError) {
          // Show error state
          return (
            <div className="space-y-6">
              <WizardStepHeader
                icon={AlertTriangle}
                title="Failed to Create Masses"
                description={schedulingError}
              />
              <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <AlertTriangle className="h-12 w-12 mx-auto text-red-600 dark:text-red-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                        Mass Creation Failed
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                        {schedulingError}
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentWizardStep(6)}
                      >
                        Go Back to Review
                      </Button>
                      <Button
                        onClick={() => {
                          setSchedulingError(null)
                          handleComplete()
                        }}
                        disabled={isSubmitting}
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        }

        // Show success state with confirmation component
        if (schedulingResult) {
          return <Step7Confirmation result={schedulingResult} />
        }

        // Fallback (should not happen)
        return null
      default:
        return null
    }
  }

  // Custom step change handler to intercept step 6 -> 7 transition
  const handleStepChange = useCallback(async (newStep: number) => {
    // If transitioning from step 6 to 7, create the masses
    if (currentWizardStep === 6 && newStep === 7) {
      // Navigate to step 7 first to show loading state
      setCurrentWizardStep(7)
      // Then create the masses (handleComplete will keep us on step 7)
      await handleComplete()
    } else {
      setCurrentWizardStep(newStep)
    }
  }, [currentWizardStep, handleComplete])

  // Check if no mass event types are available
  if (massEventTypes.length === 0) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500" />
            <h3 className="text-lg font-semibold">No Mass Event Types</h3>
            <p className="text-sm text-muted-foreground">
              No mass event types have been configured for this parish.
              Please contact an administrator to set up mass event types before scheduling.
            </p>
            <Button variant="outline" onClick={() => router.push('/masses')}>
              Return to Masses
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Wizard
        title="Schedule Masses"
        description="Create multiple Masses with automatic minister assignments"
        steps={wizardSteps}
        loading={isSubmitting}
        loadingMessage="Creating Masses and assigning ministers..."
        renderStepContent={renderStepContent}
        onComplete={() => {
          // On step 7, redirect to masses list
          if (currentWizardStep === 7) {
            router.push('/masses')
          }
        }}
        onStepChange={handleStepChange}
        disableNext={getDisableNext}
        nextButtonText={(step) => step === 6 ? "Create" : undefined}
        completeButtonText={currentWizardStep === 7 ? "Go to Masses" : "Schedule Masses"}
        initialStep={currentWizardStep}
      />

      {/* Loading Modal Overlay */}
      <Dialog open={isSubmitting} modal>
        <DialogContent
          className="max-w-md border-none bg-background/95 backdrop-blur-sm shadow-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <VisuallyHidden>
            <DialogTitle>Creating Masses</DialogTitle>
          </VisuallyHidden>
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            {/* Animated Spinner with Icon */}
            <div className="relative">
              {/* Outer rotating ring */}
              <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary/20 border-t-primary border-r-primary"></div>
              {/* Middle rotating ring (opposite direction) */}
              <div className="absolute inset-2 animate-spin rounded-full border-4 border-primary/10 border-b-primary" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              {/* Inner icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-foreground">Creating Masses</h3>
              <div className="space-y-1">
                <p className="text-base text-muted-foreground">Scheduling masses and assigning ministers...</p>
                <p className="text-sm text-muted-foreground/80">This may take a few moments</p>
              </div>
            </div>

            {/* Animated Progress Dots */}
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>

            {/* Warning Message */}
            <div className="px-6 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-700 dark:text-amber-400 text-center font-medium">
                Please do not close this window
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
