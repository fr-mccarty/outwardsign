'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UseWizardNavigationProps {
  totalSteps: number
  initialStep?: number
  onStepChange?: (step: number) => void
  enableUrlSync?: boolean
}

export function useWizardNavigation({ 
  totalSteps, 
  initialStep = 1,
  onStepChange,
  enableUrlSync = true
}: UseWizardNavigationProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(initialStep)

  const updateStepInUrl = (step: number) => {
    if (!enableUrlSync) return
    
    const url = new URL(window.location.href)
    const currentStepParam = url.searchParams.get('step')
    
    // Only update if the step is different
    if (currentStepParam !== step.toString()) {
      url.searchParams.set('step', step.toString())
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }

  // Initialize step from URL params on mount
  useEffect(() => {
    if (!enableUrlSync) return
    
    const params = new URLSearchParams(window.location.search)
    const stepParam = params.get('step')
    if (stepParam) {
      const stepNumber = parseInt(stepParam, 10)
      if (stepNumber >= 1 && stepNumber <= totalSteps && stepNumber !== currentStep) {
        setCurrentStep(stepNumber)
        onStepChange?.(stepNumber)
      }
    } else if (currentStep === initialStep) {
      // Only set URL if we're on initial step and there's no step param
      updateStepInUrl(initialStep)
    }
  }, []) // Only run on mount

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step)
      updateStepInUrl(step)
      onStepChange?.(step)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1
      goToStep(newStep)
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1
      goToStep(newStep)
    }
  }

  const canGoNext = currentStep < totalSteps
  const canGoPrevious = currentStep > 1
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return {
    currentStep,
    goToStep,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    isFirstStep,
    isLastStep
  }
}