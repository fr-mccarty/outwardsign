import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function MassRoleMemberLoading() {
  return (
    <PageContainer
      title="Mass Role Member"
      description="Loading..."
    >
      <Loading variant="skeleton-cards" />
    </PageContainer>
  )
}
