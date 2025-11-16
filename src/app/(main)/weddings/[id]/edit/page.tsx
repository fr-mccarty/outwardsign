import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getWeddingWithRelations } from '@/lib/actions/weddings'
import { WeddingFormWrapper } from '../../wedding-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditWeddingPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const wedding = await getWeddingWithRelations(id)

  if (!wedding) {
    notFound()
  }

  // Build dynamic title from bride and groom names
  const bride = (wedding as any).bride
  const groom = (wedding as any).groom
  let title = "Wedding"

  if (bride?.last_name && groom?.last_name) {
    title = `${bride.last_name}-${groom.last_name}-Wedding`
  } else if (bride?.last_name) {
    title = `${bride.last_name}-Wedding`
  } else if (groom?.last_name) {
    title = `${groom.last_name}-Wedding`
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Weddings", href: "/weddings" },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeddingFormWrapper
        wedding={wedding}
        title={title}
        description="Update wedding information."
        saveButtonLabel="Save Wedding"
      />
    </>
  )
}
