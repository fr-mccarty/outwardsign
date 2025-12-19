import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function EventsLoading() {
  return (
    <PageContainer
      title="Our Events"
      description="Loading..."
    >
      <Loading variant="skeleton-table" />
    </PageContainer>
  )
}
