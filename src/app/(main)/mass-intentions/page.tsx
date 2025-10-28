import { Suspense } from 'react'
import { MassIntentionsContent } from './mass-intentions-content'
import { PageContainer } from '@/components/page-container'

export default function MassIntentionsPage() {
  return (
    <Suspense fallback={
      <PageContainer
        title="Mass Intentions"
        description="Manage Mass intentions and offerings"
        maxWidth="6xl"
      >
        <div className="space-y-6">Loading Mass intentions...</div>
      </PageContainer>
    }>
      <MassIntentionsContent />
    </Suspense>
  )
}