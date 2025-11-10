import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuinceaneraFormWrapper } from '../quinceanera-form-wrapper'

export default async function CreateQuinceaneraPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Quinceañeras", href: "/quinceaneras" },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <QuinceaneraFormWrapper
        title="Create Quinceañera"
        description="Add a new quinceañera celebration to your parish."
        saveButtonLabel="Create Quinceañera"
      />
    </>
  )
}
