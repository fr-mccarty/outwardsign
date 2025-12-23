import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function MassesLoading() {
  return (
    <PageContainer
      title="Our Masses"
      description="Loading..."
    >
      <Loading variant="skeleton-table" />
    </PageContainer>
  )
}
