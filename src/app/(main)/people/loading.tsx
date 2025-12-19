import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'

export default function PeopleLoading() {
  return (
    <PageContainer
      title="Our People"
      description="Loading..."
    >
      <Loading variant="skeleton-table" />
    </PageContainer>
  )
}
