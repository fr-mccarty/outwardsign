import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TestTube2 } from 'lucide-react'

export default async function TestingIndexPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Testing" }
  ]

  const testPages = [
    {
      title: "Picker Components",
      description: "Test and preview all picker components (People, Events, Readings, etc.)",
      href: "/testing/pickers",
      icon: TestTube2
    }
  ]

  return (
    <PageContainer
      title="Testing Area"
      description="Test and preview components and features"
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testPages.map((page) => {
          const Icon = page.icon
          return (
            <Link key={page.href} href={page.href}>
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{page.title}</CardTitle>
                  </div>
                  <CardDescription>{page.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </PageContainer>
  )
}
