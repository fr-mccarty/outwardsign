import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function MassLoading() {
  return (
    <PageContainer
      title="Mass Details"
      description="Loading..."
    >
      <Loading variant="skeleton-cards" />
    </PageContainer>
  )
}
