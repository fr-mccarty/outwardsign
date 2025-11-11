import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassWithRelations } from '@/lib/actions/masses'
import { MassFormWrapper } from '../../mass-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMassPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const mass = await getMassWithRelations(id)

  if (!mass) {
    notFound()
  }

  // Build dynamic title from presider name and date
  let title = "Edit Mass"

  if (mass.presider) {
    const presiderName = `${mass.presider.first_name} ${mass.presider.last_name}`
    const eventDate = mass.event?.start_date
      ? new Date(mass.event.start_date).toLocaleDateString()
      : ''
    title = eventDate ? `Mass - ${presiderName} - ${eventDate}` : `Mass - ${presiderName}`
  } else if (mass.event?.start_date) {
    const eventDate = new Date(mass.event.start_date).toLocaleDateString()
    title = `Mass - ${eventDate}`
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Masses", href: "/masses" },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassFormWrapper
        mass={mass}
        title={title}
        description="Update Mass information."
        saveButtonLabel="Save Mass"
      />
    </>
  )
}
