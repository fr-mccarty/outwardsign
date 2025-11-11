import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassIntentionFormWrapper } from '../mass-intention-form-wrapper'

export default async function CreateMassIntentionPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Mass Intentions", href: "/mass-intentions" },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassIntentionFormWrapper
        title="Create Mass Intention"
        description="Add a new Mass intention for your parish."
        saveButtonLabel="Create Mass Intention"
      />
    </>
  )
}
