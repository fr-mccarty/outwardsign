'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wizard } from '@/components/wizard/Wizard'
import { Step1DateRange } from './steps/step-1-date-range'
import { Step2SchedulePattern, type MassScheduleEntry } from './steps/step-2-schedule-pattern'
import { Step3TemplateSelection } from './steps/step-3-template-selection'
import { Step4Review } from './steps/step-4-review'
import { Step5Results } from './steps/step-5-results'
import { MassRoleTemplate } from '@/lib/actions/mass-role-templates'
import { toast } from 'sonner'
import { scheduleMasses, type ScheduleMassesResult } from '@/lib/actions/mass-scheduling'

interface ScheduleMassesClientProps {
  templates: MassRoleTemplate[]
}

export function ScheduleMassesClient({ templates }: ScheduleMassesClientProps) {
  const router = useRouter()

  // Step 1: Date Range
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Step 2: Schedule Pattern
  const [schedule, setSchedule] = useState<MassScheduleEntry[]>([])

  // Step 3: Template Selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  // Step 4: Algorithm Options
  const [algorithmOptions, setAlgorithmOptions] = useState({
    balanceWorkload: true,
    respectBlackoutDates: true,
    allowManualAdjustments: true,
  })

  // Wizard state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [schedulingResult, setSchedulingResult] = useState<ScheduleMassesResult | null>(null)
  const [currentWizardStep, setCurrentWizardStep] = useState(1)

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (field === 'startDate') {
      setStartDate(value)
    } else {
      setEndDate(value)
    }
  }

  const handleAlgorithmOptionChange = (
    option: keyof typeof algorithmOptions,
    value: boolean
  ) => {
    setAlgorithmOptions((prev) => ({ ...prev, [option]: value }))
  }

  // Calculate total mass count
  const calculateTotalMasses = () => {
    if (!startDate || !endDate || schedule.length === 0) return 0

    const start = new Date(startDate)
    const end = new Date(endDate)
    let count = 0

    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()
      const matchingEntries = schedule.filter((entry) => entry.dayOfWeek === dayOfWeek)
      count += matchingEntries.length
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return count
  }

  const totalMassCount = calculateTotalMasses()

  const handleComplete = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a template')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await scheduleMasses({
        startDate,
        endDate,
        schedule,
        templateId: selectedTemplateId,
        algorithmOptions,
      })

      toast.success(`Successfully created ${result.massesCreated} Masses`)

      // Store result and navigate to Step 5 if manual adjustments enabled
      setSchedulingResult(result)

      if (algorithmOptions.allowManualAdjustments && result.rolesUnassigned > 0) {
        // Navigate to Step 5 to show assignment editor
        setCurrentWizardStep(5)
      } else {
        // Go directly to masses list
        router.push(`/masses?start_date=${startDate}`)
      }
    } catch (error) {
      console.error('Failed to schedule masses:', error)
      toast.error('Failed to schedule masses. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step validation
  const isStep1Valid = () => {
    return startDate && endDate && new Date(endDate) >= new Date(startDate)
  }

  const isStep2Valid = () => {
    return schedule.length > 0
  }

  const isStep3Valid = () => {
    return selectedTemplateId !== null
  }

  const isStep4Valid = () => {
    return true // Review step is always valid if we got here
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
      default:
        return false
    }
  }

  const wizardSteps = currentWizardStep === 5
    ? [
        { id: 1, title: 'Date Range', description: 'Select scheduling period' },
        { id: 2, title: 'Schedule Pattern', description: 'Define Mass times' },
        { id: 3, title: 'Role Template', description: 'Select assignments' },
        { id: 4, title: 'Review & Confirm', description: 'Finalize settings' },
        { id: 5, title: 'Assign Ministers', description: 'Manual adjustments' },
      ]
    : [
        { id: 1, title: 'Date Range', description: 'Select scheduling period' },
        { id: 2, title: 'Schedule Pattern', description: 'Define Mass times' },
        { id: 3, title: 'Role Template', description: 'Select assignments' },
        { id: 4, title: 'Review & Confirm', description: 'Finalize settings' },
      ]

  const renderStepContent = (currentStep: number, goToStep: (step: number) => void) => {
    switch (currentStep) {
      case 1:
        return (
          <Step1DateRange
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />
        )
      case 2:
        return (
          <Step2SchedulePattern
            schedule={schedule}
            onChange={setSchedule}
            startDate={startDate}
            endDate={endDate}
          />
        )
      case 3:
        return (
          <Step3TemplateSelection
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onChange={setSelectedTemplateId}
          />
        )
      case 4:
        return (
          <Step4Review
            startDate={startDate}
            endDate={endDate}
            schedule={schedule}
            templateId={selectedTemplateId}
            templates={templates}
            algorithmOptions={algorithmOptions}
            onAlgorithmOptionChange={handleAlgorithmOptionChange}
            onEditStep={goToStep}
            totalMassCount={totalMassCount}
          />
        )
      case 5:
        return schedulingResult ? (
          <Step5Results
            result={schedulingResult}
            startDate={startDate}
          />
        ) : null
      default:
        return null
    }
  }

  // Override initial step if showing results
  return (
    <Wizard
      title="Schedule Masses"
      description="Create multiple Masses with automatic minister assignments"
      steps={wizardSteps}
      loading={isSubmitting}
      loadingMessage="Creating Masses and assigning ministers..."
      renderStepContent={renderStepContent}
      onComplete={handleComplete}
      disableNext={getDisableNext}
      completeButtonText="Schedule Masses"
      initialStep={currentWizardStep}
    />
  )
}
