import { PageContainer } from '@/components/page-container'

export default function Loading() {
  return (
    <PageContainer
      title="Parish Settings"
      description="Manage your parish information, members, and administrative settings"
    >
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading Parish Settings...</div>
      </div>
    </PageContainer>
  )
}
