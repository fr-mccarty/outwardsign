import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getPerson } from "@/lib/actions/people"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PersonFormWrapper } from '../../person-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPersonPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch person server-side
  const person = await getPerson(id)

  if (!person) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our People", href: "/people" },
    { label: `${person.first_name} ${person.last_name}`, href: `/people/${id}` },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PersonFormWrapper
        person={person}
        title="Edit Person"
        description="Update the person details."
      />
    </>
  )
}
