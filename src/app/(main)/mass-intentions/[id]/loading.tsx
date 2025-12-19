import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function MassIntentionLoading() {
  return (
    <PageContainer
      title="Mass Intention"
      description="Loading..."
    >
      <Loading variant="skeleton-cards" />
    </PageContainer>
  )
}
