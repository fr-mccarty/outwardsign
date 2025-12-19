import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function ParishSettingsLoading() {
  return (
    <PageContainer
      title="Parish Settings"
      description="Loading..."
    >
      <Loading variant="skeleton-list" />
    </PageContainer>
  )
}
