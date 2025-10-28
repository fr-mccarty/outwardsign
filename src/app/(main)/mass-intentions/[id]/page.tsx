import { Suspense } from 'react'
import { MassIntentionForm } from '../components/mass-intention-form'
import { PageContainer } from '@/components/page-container'

interface EditMassIntentionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditMassIntentionPage({ params }: EditMassIntentionPageProps) {
  const { id } = await params
  return (
    <Suspense fallback={
      <PageContainer
        title="Edit Mass Intention"
        description="Update Mass intention details"
        maxWidth="2xl"
      >
        <div className="space-y-6">Loading form...</div>
      </PageContainer>
    }>
      <MassIntentionForm intentionId={id} />
    </Suspense>
  )
}