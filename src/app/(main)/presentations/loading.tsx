import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { PAGE_MAX_WIDTH_CLASS } from "@/lib/constants"

export default function PresentationsLoading() {
  return (
    <div className="space-y-6 p-6 pb-12">
      <div className={`${PAGE_MAX_WIDTH_CLASS} mx-auto`}>
        {/* Heading Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="space-y-6">
          {/* Search Area */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-5 w-32" />
            </CardContent>
          </Card>

          {/* List of Items */}
          <div className="rounded-lg border bg-card">
            <div className="border-b bg-muted/50">
              <div className="flex items-center h-12 px-4 gap-4">
                <Skeleton className="h-4 w-12 hidden sm:block" />
                <Skeleton className="h-4 w-40 flex-1" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32 hidden lg:block" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center h-16 px-4 gap-4">
                    <div className="hidden sm:block">
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="space-y-1 w-32">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-32 hidden lg:block" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Area */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
