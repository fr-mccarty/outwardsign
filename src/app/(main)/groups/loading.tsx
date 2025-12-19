import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function GroupsLoading() {
  return (
    <PageContainer
      title="Groups"
      description="Loading..."
    >
      <Loading variant="skeleton-table" />
    </PageContainer>
  )
}
