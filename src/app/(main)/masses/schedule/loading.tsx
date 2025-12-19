import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function ScheduleMassesLoading() {
  return (
    <PageContainer
      title="Schedule Masses"
      description="Loading..."
    >
      <Loading variant="skeleton-cards" />
    </PageContainer>
  )
}
