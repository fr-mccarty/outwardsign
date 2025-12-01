import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { PAGE_MAX_WIDTH_CLASS } from "@/lib/constants"

export function ViewPageLoading() {
  return (
    <div className="space-y-6 p-6 pb-12">
      <div className={`${PAGE_MAX_WIDTH_CLASS} mx-auto`}>
        {/* Page Header */}
        <div className="mb-6">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Two-column layout: Main content + Right panel */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Right Side Panel - appears first on mobile, second on desktop */}
          <div className="w-full md:w-80 space-y-4 order-1 md:order-2">
            <Card>
              <CardContent className="px-6 pb-1 space-y-4">
                {/* Actions Section */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Export Section */}
                <div className="pt-4 border-t space-y-2">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Template Selector Section */}
                <div className="pt-4 border-t space-y-2">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Details Section - Hidden on small screens */}
                <div className="hidden md:block pt-4 border-t space-y-3">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="pt-2 border-t">
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>

                {/* Delete Section */}
                <div className="pt-4 border-t">
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - appears second on mobile, first on desktop */}
          <div className="flex-1 order-2 md:order-1 space-y-6">
            {/* Main liturgy content card */}
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Cover page section */}
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-6 w-1/2 mx-auto" />
                  <Skeleton className="h-5 w-2/3 mx-auto" />
                  <Skeleton className="h-5 w-1/2 mx-auto" />
                </div>

                <div className="border-t pt-6 space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <Skeleton className="h-6 w-36" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
