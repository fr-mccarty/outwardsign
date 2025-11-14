import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getReading } from "@/lib/actions/readings"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ReadingFormWrapper } from '../../reading-form-wrapper'

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
    { label: "Our Readings", href: "/readings" },
    { label: reading.pericope || 'Reading', href: `/readings/${id}` },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ReadingFormWrapper
        reading={reading}
        title="Edit Reading"
        description="Update the scripture reading or liturgical text details."
        saveButtonLabel="Save Reading"
      />
    </>
  )
}
