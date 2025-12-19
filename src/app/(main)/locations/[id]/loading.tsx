import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function LocationLoading() {
  return (
    <PageContainer
      title="Location Details"
      description="Loading..."
    >
      <Loading variant="skeleton-cards" />
    </PageContainer>
  )
}
