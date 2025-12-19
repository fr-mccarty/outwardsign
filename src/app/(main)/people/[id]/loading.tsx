import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function PersonLoading() {
  return (
    <PageContainer
      title="Person Details"
      description="Loading..."
    >
      <Loading variant="skeleton-cards" />
    </PageContainer>
  )
}
