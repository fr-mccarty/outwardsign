import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeddingFormWrapper } from '../wedding-form-wrapper'

export default async function CreateWeddingPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Weddings", href: "/weddings" },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeddingFormWrapper
        title="Create Wedding"
        description="Add a new wedding celebration to your parish."
        saveButtonLabel="Create Wedding"
      />
    </>
  )
}
