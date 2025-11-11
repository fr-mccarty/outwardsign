import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { MassIntentionFormWrapper } from '../../mass-intention-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMassIntentionPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const intention = await getMassIntentionWithRelations(id)

  if (!intention) {
    notFound()
  }

  // Build dynamic title
  let title = "Edit Mass Intention"
  if (intention.mass_offered_for) {
    title = `Edit: ${intention.mass_offered_for.substring(0, 40)}${intention.mass_offered_for.length > 40 ? '...' : ''}`
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Mass Intentions", href: "/mass-intentions" },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassIntentionFormWrapper
        intention={intention}
        title={title}
        description="Update Mass intention information."
        saveButtonLabel="Save Mass Intention"
      />
    </>
  )
}
