import { Suspense } from 'react'
import { MassIntentionForm } from '../components/mass-intention-form'
import { PageContainer } from '@/components/page-container'

export default function CreateMassIntentionPage() {
  return (
    <Suspense fallback={
      <PageContainer
        title="Create Mass Intention"
        description="Add a new Mass intention"
        maxWidth="2xl"
      >
        <div className="space-y-6">Loading form...</div>
      </PageContainer>
    }>
      <MassIntentionForm />
    </Suspense>
  )
}