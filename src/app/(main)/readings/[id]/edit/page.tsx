import { PageContainer } from "@/components/page-container"
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getReading } from "@/lib/actions/readings"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ReadingForm } from '../../reading-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditReadingPage({ params }: PageProps) {
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
    { label: "My Readings", href: "/readings" },
    { label: reading.pericope || 'Reading', href: `/readings/${id}` },
    { label: "Edit" }
  ]

  return (
    <PageContainer
      title="Edit Reading"
      description="Update the scripture reading or liturgical text details."
      cardTitle="Reading Details"
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ReadingForm reading={reading} />
    </PageContainer>
  )
}
