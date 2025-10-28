'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { WizardStep } from './WizardSteps'

interface WizardNavigationProps {
  steps: WizardStep[]
  currentStep: number
  onNext: () => void
  onPrevious: () => void
  onComplete?: () => void
  nextButtonText?: string
  previousButtonText?: string
  completeButtonText?: string
  disableNext?: boolean
  disablePrevious?: boolean
  showStepPreview?: boolean
}

export function WizardNavigation({
  steps,
  currentStep,
  onNext,
  onPrevious,
  onComplete,
  nextButtonText,
  previousButtonText = 'Previous',
  completeButtonText = 'Complete',
  disableNext = false,
  disablePrevious = false,
  showStepPreview = true
}: WizardNavigationProps) {
  const isLastStep = currentStep >= steps.length
  const isFirstStep = currentStep === 1
  const nextStep = steps[currentStep]

  const handleNext = () => {
    if (isLastStep && onComplete) {
      onComplete()
    } else {
      onNext()
    }
  }

  const getNextButtonText = () => {
    if (nextButtonText) return nextButtonText
    if (isLastStep) return completeButtonText
    if (showStepPreview && nextStep) return `Next: ${nextStep.title}`
    return 'Next'
  }

  return (
    <div className="flex justify-between">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        disabled={isFirstStep || disablePrevious}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {previousButtonText}
      </Button>
      
      <Button 
        onClick={handleNext}
        disabled={disableNext}
      >
        {getNextButtonText()}
        {!isLastStep && <ArrowRight className="h-4 w-4 ml-2" />}
      </Button>
    </div>
  )
}