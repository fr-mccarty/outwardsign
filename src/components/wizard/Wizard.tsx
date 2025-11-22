'use client'

import { ReactNode } from 'react'
import { PageContainer } from '@/components/page-container'
import { WizardSteps, type WizardStep } from './WizardSteps'
import { WizardNavigation } from './WizardNavigation'
import { WizardLoadingState } from './WizardLoadingState'
import { WizardStepContent } from './WizardStepContent'
import { useWizardNavigation } from './useWizardNavigation'

interface WizardProps {
  // Wizard configuration
  title: string
  description: string
  steps: WizardStep[]

  // Loading and error states
  loading?: boolean
  error?: string | null
  loadingMessage?: string

  // Navigation configuration
  initialStep?: number
  enableUrlSync?: boolean
  allowPreviousNavigation?: boolean
  showStepPreview?: boolean

  // Navigation callbacks
  onComplete?: () => void
  onStepChange?: (step: number) => void
  
  // Button text customization
  previousButtonText?: string
  nextButtonText?: string | ((currentStep: number) => string | undefined)
  completeButtonText?: string

  // Navigation control
  disableNext?: boolean | ((currentStep: number) => boolean)
  disablePrevious?: boolean
  
  // Step content
  renderStepContent: (currentStep: number, goToStep: (step: number) => void) => ReactNode
}

export function Wizard({
  // Wizard configuration
  title,
  description,
  steps,

  // Loading and error states
  loading = false,
  error = null,
  loadingMessage = 'Loading...',

  // Navigation configuration
  initialStep = 1,
  enableUrlSync = true,
  allowPreviousNavigation = true,
  showStepPreview = true,

  // Navigation callbacks
  onComplete,
  onStepChange,

  // Button text customization
  previousButtonText = 'Previous',
  nextButtonText,
  completeButtonText = 'Complete',

  // Navigation control
  disableNext = false,
  disablePrevious = false,

  // Step content
  renderStepContent
}: WizardProps) {
  // Use wizard navigation hook
  const {
    currentStep,
    goToStep,
    nextStep,
    previousStep
  } = useWizardNavigation({
    totalSteps: steps.length,
    initialStep,
    onStepChange,
    enableUrlSync
  })

  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    }
  }

  // Calculate dynamic disableNext
  const shouldDisableNext = typeof disableNext === 'function'
    ? disableNext(currentStep)
    : disableNext

  // Calculate dynamic nextButtonText
  const currentNextButtonText = typeof nextButtonText === 'function'
    ? nextButtonText(currentStep)
    : nextButtonText

  return (
    <PageContainer
      title={title}
      description={description}
    >
      <div className="space-y-6">
        <WizardLoadingState
          title={title}
          description={description}
          loading={loading}
          error={error}
          loadingMessage={loadingMessage}
          onRetry={() => window.location.reload()}
        />

        {!loading && !error && (
          <>
            <WizardSteps
              steps={steps}
              currentStep={currentStep}
              onStepClick={goToStep}
              allowPreviousNavigation={allowPreviousNavigation}
            />

            <WizardNavigation
              steps={steps}
              currentStep={currentStep}
              onNext={nextStep}
              onPrevious={previousStep}
              onComplete={handleComplete}
              previousButtonText={previousButtonText}
              nextButtonText={currentNextButtonText}
              completeButtonText={completeButtonText}
              showStepPreview={showStepPreview}
              disableNext={shouldDisableNext}
              disablePrevious={disablePrevious}
            />

            <WizardStepContent>
              {renderStepContent(currentStep, goToStep)}
            </WizardStepContent>
          </>
        )}
      </div>
    </PageContainer>
  )
}