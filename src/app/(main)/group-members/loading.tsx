import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer } from '@/components/page-container'

export default function GroupMembersLoading() {
  return (
    <PageContainer
      title="Group Members"
      description="View and manage people serving in groups"
    >
      <div className="space-y-6">
        {/* Search Card Skeleton */}
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 flex-1 max-w-md" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-lg border bg-card">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-[60px] hidden sm:block" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[120px] hidden md:block" />
              <Skeleton className="h-4 w-[120px] hidden lg:block" />
              <Skeleton className="h-4 w-[50px]" />
            </div>
          </div>

          {/* Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b last:border-b-0 p-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <Skeleton className="h-10 w-10 rounded-full hidden sm:block" />
                {/* Name */}
                <div className="space-y-1 min-w-[150px]">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                {/* Groups */}
                <Skeleton className="h-5 w-20 hidden md:block" />
                {/* Phone */}
                <Skeleton className="h-4 w-28 hidden lg:block" />
                {/* Actions */}
                <Skeleton className="h-8 w-8 rounded-md ml-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Skeleton */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-8">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
