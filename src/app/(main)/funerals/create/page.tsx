import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FuneralFormWrapper } from '../funeral-form-wrapper'

export default async function CreateFuneralPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Funerals", href: "/funerals" },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <FuneralFormWrapper
        title="Create Funeral"
        description="Add a new funeral service to your parish."
        saveButtonLabel="Create Funeral"
      />
    </>
  )
}
