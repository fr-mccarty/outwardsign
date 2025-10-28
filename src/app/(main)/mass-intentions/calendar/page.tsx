import { Suspense } from 'react'
import { MassIntentionsCalendar } from './mass-intentions-calendar'
import { PageContainer } from '@/components/page-container'

export default function MassIntentionsCalendarPage() {
  return (
    <Suspense fallback={
      <PageContainer
        title="Mass Intentions Calendar"
        description="View Mass intentions in calendar format"
        maxWidth="7xl"
      >
        <div className="space-y-6">Loading calendar...</div>
      </PageContainer>
    }>
      <MassIntentionsCalendar />
    </Suspense>
  )
}