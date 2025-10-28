'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getPetition } from '@/lib/actions/petitions'
import { Petition } from '@/lib/types'
import { Wizard, type WizardStep } from '@/components/wizard'

// Import wizard steps
import LanguageTemplateStep from './LanguageTemplateStep'
import DetailsEditStep from './DetailsEditStep'
import EditStep from './EditStep'
import PrintStep from './PrintStep'

const STEPS: WizardStep[] = [
  { id: 1, title: 'Language & Template', description: 'Choose language and select petition template' },
  { id: 2, title: 'Petition Details', description: 'Add specific names and community information for this liturgy' },
  { id: 3, title: 'Edit & Review', description: 'Generate and edit petitions using AI' },
  { id: 4, title: 'Print & Complete', description: 'Print petitions and complete' }
]

export default function PetitionWizardPage() {
  const params = useParams()
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [petition, setPetition] = useState<Petition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Get the ID directly from params
  const petitionId = params.id as string

  // Wizard state
  const [wizardData, setWizardData] = useState({
    language: 'English',
    templateId: '',
    templateContent: '', // Stores the actual template text
    generatedContent: '',
  })

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Petitions", href: "/petitions" },
      { label: "Petition Wizard" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    let mounted = true
    
    const loadPetition = async () => {
      try {
        if (!petitionId) {
          if (mounted) {
            setError('No petition ID provided')
            setLoading(false)
          }
          return
        }
        
        if (mounted) {
          setLoading(true)
          setError('')
        }
        
        const petitionData = await getPetition(petitionId)
        
        if (petitionData && mounted) {
          setPetition(petitionData)
          // Initialize wizard data from existing petition
          setWizardData(prev => ({
            ...prev,
            language: petitionData.language || 'english',
            templateContent: petitionData.template || '', // Initialize from existing template
            generatedContent: petitionData.text || '', // Use text field, not generated_content
          }))
        } else if (mounted) {
          setError('Petition not found')
        }
      } catch (err) {
        console.error('Failed to load petition:', err)
        if (mounted) {
          setError('Failed to load petition')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Load petition data on mount
    loadPetition()

    return () => {
      mounted = false
    }
  }, [petitionId]) // Re-run when petitionId changes


  const updateWizardData = (updates: Partial<typeof wizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }))
  }

  const handleComplete = () => {
    router.push(`/petitions/${petition?.id}`)
  }

  const renderStepContent = (currentStep: number) => {
    if (!petition) return null

    switch (currentStep) {
      case 1:
        return (
          <LanguageTemplateStep
            petition={petition}
            wizardData={wizardData}
            updateWizardData={updateWizardData}
          />
        )
      case 2:
        return (
          <DetailsEditStep
            petition={petition}
            wizardData={wizardData}
            updateWizardData={updateWizardData}
          />
        )
      case 3:
        return (
          <EditStep
            petition={petition}
            wizardData={wizardData}
            updateWizardData={updateWizardData}
          />
        )
      case 4:
        return (
          <PrintStep
            petition={petition}
            wizardData={wizardData}
          />
        )
      default:
        return null
    }
  }

  return (
    <Wizard
      title={petition ? `Petition Wizard: ${petition.title}` : "Petition Wizard"}
      description="Follow the steps below to configure and generate your petitions"
      steps={STEPS}
      maxWidth="4xl"
      loading={loading}
      error={error || (!petition ? 'Petition not found' : null)}
      loadingMessage="Loading petition wizard..."
      onComplete={handleComplete}
      completeButtonText="Complete & View Petition"
      showStepPreview={true}
      allowPreviousNavigation={true}
      renderStepContent={renderStepContent}
    />
  )
}