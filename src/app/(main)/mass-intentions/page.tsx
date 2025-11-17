import { Button } from "@/components/ui/button"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import Link from "next/link"
import { Plus } from "lucide-react"
import { getMassIntentions, type MassIntentionFilterParams } from "@/lib/actions/mass-intentions"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassIntentionsListClient } from './mass-intentions-list-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function MassIntentionsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: MassIntentionFilterParams = {
    search: params.search,
    status: params.status as MassIntentionFilterParams['status']
  }

  // Fetch mass intentions server-side with filters
  const intentions = await getMassIntentions(filters)

  // Compute stats server-side
  const allIntentions = await getMassIntentions()
  const stats = {
    total: allIntentions.length,
    filtered: intentions.length,
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Mass Intentions" }
  ]

  return (
    <PageContainer
      title="Mass Intentions"
      description="Manage Mass intentions for your parish."
      actions={
        <Button asChild>
          <Link href="/mass-intentions/create">
            <Plus className="h-4 w-4 mr-2" />
            New Mass Intention
          </Link>
        </Button>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassIntentionsListClient initialData={intentions} stats={stats} />
    </PageContainer>
  )
}
