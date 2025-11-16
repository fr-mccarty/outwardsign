import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getQuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { QuinceaneraFormWrapper } from '../../quinceanera-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuinceaneraPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const quinceanera = await getQuinceaneraWithRelations(id)

  if (!quinceanera) {
    notFound()
  }

  // Build dynamic title from quinceañera name
  const quinceaneraGirl = quinceanera.quinceanera
  let title = "Quinceañera"

  if (quinceaneraGirl?.last_name) {
    title = `${quinceaneraGirl.last_name}-Quinceañera`
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Quinceañeras", href: "/quinceaneras" },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <QuinceaneraFormWrapper
        quinceanera={quinceanera}
        title={title}
        description="Update quinceañera information."
        saveButtonLabel="Save Quinceañera"
      />
    </>
  )
}
