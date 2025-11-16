import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getReading } from "@/lib/actions/readings"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ReadingViewClient } from './reading-view-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReadingDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch reading server-side
  const reading = await getReading(id)

  if (!reading) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Readings", href: "/readings" },
    { label: reading.pericope || 'Reading' }
  ]

  return (
    <PageContainer
      title={reading.pericope || 'Reading'}
      description="Scripture reading details"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ReadingViewClient reading={reading} />
    </PageContainer>
  )
}
