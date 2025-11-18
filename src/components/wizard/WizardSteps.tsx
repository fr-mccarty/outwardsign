'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Check } from 'lucide-react'

export interface WizardStep {
  id: number
  title: string
  description?: string
}

interface WizardStepsProps {
  steps: WizardStep[]
  currentStep: number
  onStepClick?: (stepId: number) => void
  allowPreviousNavigation?: boolean
}

export function WizardSteps({ 
  steps, 
  currentStep, 
  onStepClick,
  allowPreviousNavigation = true 
}: WizardStepsProps) {
  const handleStepClick = (stepId: number) => {
    if (onStepClick && allowPreviousNavigation && stepId <= currentStep) {
      onStepClick(stepId)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(step.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    step.id < currentStep
                      ? 'bg-green-500 border-green-500 text-white'
                      : step.id === currentStep
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border text-muted-foreground'
                  } ${
                    allowPreviousNavigation && step.id <= currentStep
                      ? 'cursor-pointer hover:opacity-80'
                      : 'cursor-default'
                  }`}
                  disabled={!allowPreviousNavigation || step.id > currentStep}
                >
                  {step.id < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </button>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 ${
                    step.id < currentStep ? 'bg-green-500' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <h3 className="font-medium">{steps[currentStep - 1]?.title}</h3>
          {steps[currentStep - 1]?.description && (
            <p className="text-sm text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}