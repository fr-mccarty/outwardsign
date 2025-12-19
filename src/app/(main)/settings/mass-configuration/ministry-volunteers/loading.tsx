import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function MassRoleMembersLoading() {
  return (
    <PageContainer
      title="Mass Role Members"
      description="Loading..."
    >
      <Loading variant="skeleton-table" />
    </PageContainer>
  )
}
