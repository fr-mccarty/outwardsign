import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PresentationFormWrapper } from '../presentation-form-wrapper'

export default async function CreatePresentationPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Presentations", href: "/presentations" },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PresentationFormWrapper
        title="Create Presentation"
        description="Add a new child presentation to your parish."
        saveButtonLabel="Create Presentation"
      />
    </>
  )
}
