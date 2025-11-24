'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
      <CardContent className="p-4 sm:p-6">
        <TooltipProvider>
          <div className="flex items-center justify-center overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleStepClick(step.id)}
                        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors text-sm sm:text-base ${
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
                          <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          step.id
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{step.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </TooltipProvider>
        
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