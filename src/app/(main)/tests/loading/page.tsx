import { Loading } from "@/components/loading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'

export default function LoadingTestPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tests", href: "/tests" },
    { label: "Loading States" }
  ]

  return (
    <PageContainer
      title="Loading Component Test Page"
      description="This page displays all variants of the Loading component for visual testing."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className="space-y-8">

      <Card>
        <CardHeader>
          <CardTitle>Spinner Variant (Default) - Small</CardTitle>
        </CardHeader>
        <CardContent>
          <Loading size="sm" message="Loading small..." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spinner Variant (Default) - Medium</CardTitle>
        </CardHeader>
        <CardContent>
          <Loading size="md" message="Loading medium..." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spinner Variant (Default) - Large</CardTitle>
        </CardHeader>
        <CardContent>
          <Loading size="lg" message="Loading large..." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skeleton Cards Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <Loading variant="skeleton-cards" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skeleton List Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <Loading variant="skeleton-list" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skeleton Table Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <Loading variant="skeleton-table" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spinner - Not Centered</CardTitle>
        </CardHeader>
        <CardContent>
          <Loading centered={false} message="Not centered loading..." />
        </CardContent>
      </Card>
      </div>
    </PageContainer>
  )
}
