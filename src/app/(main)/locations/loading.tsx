import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function LocationsLoading() {
  return (
    <PageContainer
      title="Locations"
      description="Loading..."
    >
      <Loading variant="skeleton-table" />
    </PageContainer>
  )
}
