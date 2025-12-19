import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function MassIntentionsLoading() {
  return (
    <PageContainer
      title="Mass Intentions"
      description="Loading..."
    >
      <Loading variant="skeleton-table" />
    </PageContainer>
  )
}
