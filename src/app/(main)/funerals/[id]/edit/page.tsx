import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getFuneralWithRelations } from '@/lib/actions/funerals'
import { FuneralFormWrapper } from '../../funeral-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditFuneralPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const funeral = await getFuneralWithRelations(id)

  if (!funeral) {
    notFound()
  }

  // Build dynamic title from deceased name
  const deceased = (funeral as any).deceased
  let title = "Edit Funeral"

  if (deceased?.last_name) {
    title = `${deceased.first_name ? deceased.first_name + ' ' : ''}${deceased.last_name} Funeral`
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Funerals", href: "/funerals" },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <FuneralFormWrapper
        funeral={funeral}
        title={title}
        description="Update funeral information."
        saveButtonLabel="Save Funeral"
      />
    </>
  )
}
