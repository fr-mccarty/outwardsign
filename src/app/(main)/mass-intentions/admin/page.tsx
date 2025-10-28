import { Suspense } from 'react'
import { MassIntentionsAdmin } from './mass-intentions-admin'
import { PageContainer } from '@/components/page-container'

export default function MassIntentionsAdminPage() {
  return (
    <Suspense fallback={
      <PageContainer
        title="Mass Intentions Admin"
        description="Manage conflicts and unscheduled Mass intentions"
        maxWidth="7xl"
      >
        <div className="space-y-6">Loading admin view...</div>
      </PageContainer>
    }>
      <MassIntentionsAdmin />
    </Suspense>
  )
}