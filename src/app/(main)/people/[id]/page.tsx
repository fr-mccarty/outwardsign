import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getPerson } from '@/lib/actions/people'
import { PersonViewClient } from './person-view-client'
import { getPersonPageTitle } from '@/lib/utils/formatters'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PersonDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const person = await getPerson(id)

  if (!person) {
    notFound()
  }

  // Build dynamic title from person name
  const title = getPersonPageTitle(person)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our People", href: "/people" },
    { label: "View" }
  ]

  return (
    <PageContainer
      title={title}
      description="View person contact information."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PersonViewClient person={person} />
    </PageContainer>
  )
}
