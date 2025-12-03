import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BaptismFormWrapper } from '../baptism-form-wrapper'

export default async function CreateBaptismPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Baptisms", href: "/baptisms" },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <BaptismFormWrapper
        title="Create Baptism"
        description="Add a new baptism celebration to your parish."
      />
    </>
  )
}
