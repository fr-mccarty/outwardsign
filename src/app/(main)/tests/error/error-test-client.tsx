'use client'

import { ErrorDisplay } from "@/components/error-display"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'

export function ErrorTestClient() {
  const handleReset = () => {
    console.log("Reset button clicked")
    alert("Reset function called")
  }

  // Sample errors
  const simpleError = new Error("This is a simple error message")

  const errorWithDigest = Object.assign(
    new Error("Database connection failed. Please check your internet connection and try again."),
    { digest: "abc123def456" }
  )

  const longError = new Error(
    "An unexpected error occurred while processing your request. The server encountered an internal error and was unable to complete your request. Please try again later or contact support if the problem persists."
  )

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tests", href: "/tests" },
    { label: "Error States" }
  ]

  return (
    <PageContainer
      title="Error Component Test Page"
      description="This page displays different states of the Error component for visual testing."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className="space-y-8">

      <Card>
        <CardHeader>
          <CardTitle>Simple Error</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorDisplay error={simpleError} reset={handleReset} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error with Digest (Error ID)</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorDisplay error={errorWithDigest} reset={handleReset} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Long Error Message</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorDisplay error={longError} reset={handleReset} />
        </CardContent>
      </Card>
      </div>
    </PageContainer>
  )
}
